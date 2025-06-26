import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, Row, Col, Collapse, Select, Space, message, Modal, Radio } from 'antd';
import { Editor, DiffEditor } from '@monaco-editor/react';
import * as diff from 'diff';
import { getProjectVersions, VersionInfo } from '../services/changelog.service';
import axios from 'axios';
import { DownloadOutlined, CopyOutlined, CodeOutlined, ArrowLeftOutlined, TableOutlined, FieldNumberOutlined } from '@ant-design/icons';
import { API_CONFIG } from '../../../config';
import Logo from '../../../components/common/Logo';
import './CodeComparePage.css';

// Icons for the summary
import { PlusCircleOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// Define change types
type ChangeType = 'added' | 'removed' | 'modified';

interface SummaryItem {
  type: 'Table' | 'Enum' | 'Ref' | 'Note' | 'Other'; // DBML object types
  name: string; // Name of table, enum, ref, etc.
  change: ChangeType; // Type of change: added, removed, modified
  detailCount?: number; // Number of detailed changes (e.g., number of columns changed)
}

interface DiffChange {
  totalChanges: number;
  newObjectsCount: number;
  removedObjectsCount: number;
  valueChangesCount: number;
  listChangesCount: number;
  addedTables: string[];
  removedTables: string[];
  tableChanges: {
    [tableName: string]: Array<{
      property: string;
      oldValue: string;
      newValue: string;
    }>;
  };
}

interface TableChange {
  tableName: string;
  changeType: 'added' | 'removed' | 'modified';
  columns?: ColumnChange[];
}

interface ColumnChange {
  columnName: string;
  changeType: 'added' | 'removed' | 'modified';
  oldType?: string;
  newType?: string;
  details?: string;
}

interface DetailedChanges {
  tables: TableChange[];
  summary: {
    tablesAdded: number;
    tablesRemoved: number;
    tablesModified: number;
    columnsAdded: number;
    columnsRemoved: number;
    columnsModified: number;
  };
}

// =========================================================
// Function to analyze detailed changes
// =========================================================
const analyzeDetailedChanges = (oldContent: string, newContent: string): DetailedChanges => {
  const tableChanges: TableChange[] = [];
  const summary = {
    tablesAdded: 0,
    tablesRemoved: 0,
    tablesModified: 0,
    columnsAdded: 0,
    columnsRemoved: 0,
    columnsModified: 0,
  };

  // Parse tables from both versions
  const parseTablesFromContent = (content: string) => {
    const tables = new Map<string, { fields: string[], rawContent: string }>();
    const tableRegex = /Table\s+([\w\.]+)\s*{([^}]*)}/g;
    let match;

    while ((match = tableRegex.exec(content)) !== null) {
      const tableName = match[1];
      const tableContent = match[2];
      
      // Extract fields
      const fieldLines = tableContent.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.includes('Indexes'));
      
      const fields = fieldLines.map(line => {
        const parts = line.split(/\s+/);
        return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : line;
      });

      tables.set(tableName, { fields, rawContent: tableContent });
    }

    return tables;
  };

  const oldTables = parseTablesFromContent(oldContent);
  const newTables = parseTablesFromContent(newContent);

  // Get all table names
  const allTableNames = new Set([...oldTables.keys(), ...newTables.keys()]);

  allTableNames.forEach(tableName => {
    const oldTable = oldTables.get(tableName);
    const newTable = newTables.get(tableName);

    if (oldTable && !newTable) {
      // Table removed
      tableChanges.push({
        tableName,
        changeType: 'removed'
      });
      summary.tablesRemoved++;
    } else if (!oldTable && newTable) {
      // Table added
      tableChanges.push({
        tableName,
        changeType: 'added',
        columns: newTable.fields.map(field => ({
          columnName: field.split(' ')[0],
          changeType: 'added' as const,
          newType: field.split(' ')[1] || 'unknown'
        }))
      });
      summary.tablesAdded++;
      summary.columnsAdded += newTable.fields.length;
    } else if (oldTable && newTable) {
      // Table exists in both - check for modifications
      const oldFields = new Set(oldTable.fields);
      const newFields = new Set(newTable.fields);
      const columnChanges: ColumnChange[] = [];

      // Find added columns
      newTable.fields.forEach(field => {
        if (!oldFields.has(field)) {
          const [columnName, columnType] = field.split(' ');
          columnChanges.push({
            columnName,
            changeType: 'added',
            newType: columnType
          });
          summary.columnsAdded++;
        }
      });

      // Find removed columns
      oldTable.fields.forEach(field => {
        if (!newFields.has(field)) {
          const [columnName, columnType] = field.split(' ');
          columnChanges.push({
            columnName,
            changeType: 'removed',
            oldType: columnType
          });
          summary.columnsRemoved++;
        }
      });

      if (columnChanges.length > 0) {
        tableChanges.push({
          tableName,
          changeType: 'modified',
          columns: columnChanges
        });
        summary.tablesModified++;
      }
    }
  });

  return { tables: tableChanges, summary };
};

// =========================================================
// Function to analyze changes and create summary
// =========================================================
const analyzeChangesForSummary = (oldContent: string, newContent: string): SummaryItem[] => {
  const summary: SummaryItem[] = [];
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  // Basic regex to identify DBML objects
  const tableRegex = /^\s*Table\s+([\w\.]+)\s*{/i;
  const enumRegex = /^\s*Enum\s+([\w\.]+)\s*{/i;
  const refRegex = /^\s*Ref:\s+([\w\.\s\-<>]+)\s*$/i;
  const projectRegex = /^\s*Project\s+([\w\.]+)\s*{/i;

  // Step 1: Collect all objects from both versions
  const extractObjects = (contentLines: string[]) => {
    const objects = new Map<string, { type: string, fullDefinition: string[] }>();
    let currentObject: { type: string, name: string, definitionLines: string[], startIndex: number, endIndex: number } | null = null;
    let braceCount = 0;

    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      const trimmedLine = line.trim();

      // Start of an object
      if (trimmedLine.match(tableRegex)) {
        const match = trimmedLine.match(tableRegex)!;
        currentObject = { type: 'Table', name: match[1], definitionLines: [line], startIndex: i, endIndex: -1 };
        braceCount = (trimmedLine.match(/{/g) || []).length;
      } else if (trimmedLine.match(enumRegex)) {
        const match = trimmedLine.match(enumRegex)!;
        currentObject = { type: 'Enum', name: match[1], definitionLines: [line], startIndex: i, endIndex: -1 };
        braceCount = (trimmedLine.match(/{/g) || []).length;
      } else if (trimmedLine.match(projectRegex)) {
        const match = trimmedLine.match(projectRegex)!;
        currentObject = { type: 'Project', name: match[1], definitionLines: [line], startIndex: i, endIndex: -1 };
        braceCount = (trimmedLine.match(/{/g) || []).length;
      } else if (trimmedLine.match(refRegex)) {
        const match = trimmedLine.match(refRegex)!;
        // Relationships are single-line, treat them as complete objects
        objects.set(`Ref: ${match[1]}`, { type: 'Ref', fullDefinition: [line] });
        currentObject = null; // Reset
      } else if (currentObject) {
        currentObject.definitionLines.push(line);
        braceCount += (trimmedLine.match(/{/g) || []).length;
        braceCount -= (trimmedLine.match(/}/g) || []).length;

        if (braceCount === 0 && trimmedLine.endsWith('}')) { // End of object
          currentObject.endIndex = i;
          objects.set(`${currentObject.type}: ${currentObject.name}`, {
            type: currentObject.type,
            fullDefinition: currentObject.definitionLines,
          });
          currentObject = null;
        }
      }
    }
    return objects;
  };

  const oldObjects = extractObjects(oldLines);
  const newObjects = extractObjects(newLines);

  const allObjectKeys = new Set([...Array.from(oldObjects.keys()), ...Array.from(newObjects.keys())]);

  allObjectKeys.forEach(key => {
    const oldObj = oldObjects.get(key);
    const newObj = newObjects.get(key);

    const [objType, objName] = key.split(': ', 2); // Split type and name

    if (oldObj && !newObj) {
      summary.push({ type: objType as any, name: objName, change: 'removed' });
    } else if (!oldObj && newObj) {
      summary.push({ type: objType as any, name: objName, change: 'added' });
    } else if (oldObj && newObj) {
      // For objects that exist in both versions, check for content changes
      const oldDef = oldObj.fullDefinition.join('\n');
      const newDef = newObj.fullDefinition.join('\n');
      if (oldDef !== newDef) {
        // Calculate detailCount using diff on fullDefinition
        const internalDiff = diff.diffLines(oldDef, newDef);
        const addedLines = internalDiff.filter(p => p.added).length;
        const removedLines = internalDiff.filter(p => p.removed).length;
        const detailCount = addedLines + removedLines; // Count of added/removed lines
        summary.push({ type: objType as any, name: objName, change: 'modified', detailCount: detailCount > 0 ? detailCount : undefined });
      }
    }
  });

  // Sort summary items by change type (added, modified, removed) and then by name
  summary.sort((a, b) => {
    const order = { 'added': 1, 'modified': 2, 'removed': 3 };
    if (order[a.change] !== order[b.change]) {
      return order[a.change] - order[b.change];
    }
    return a.name.localeCompare(b.name);
  });

  return summary;
};

const CodeComparePage: React.FC = () => {
  const { projectId, versionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null);
  const [previousVersion, setPreviousVersion] = useState<VersionInfo | null>(null);
  const [oldContent, setOldContent] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [selectedFromVersion, setSelectedFromVersion] = useState<string>('');
  const [selectedToVersion, setSelectedToVersion] = useState<string>('');
  const [diffChanges, setDiffChanges] = useState<DiffChange | null>(null);
  const [changeSummaryLoading, setChangeSummaryLoading] = useState(false);
  const [detailedChanges, setDetailedChanges] = useState<DetailedChanges | null>(null);

  // DDL generation states
  const [ddlModalVisible, setDdlModalVisible] = useState(false);
  const [selectedDbType, setSelectedDbType] = useState<number>(1); // Default: MySQL
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [generatingScript, setGeneratingScript] = useState(false);
  const [showScriptResult, setShowScriptResult] = useState(false);

  // Fetch all available versions for the project
  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const versionsData = await getProjectVersions(projectId!);
        setVersions(versionsData);

        if (versionId) {
          // If versionId is provided from URL (from "View code change" click)
          const selectedVersion = versionsData.find(v => v.id === versionId);
          if (selectedVersion) {
            // Find the index of the selected version
            const selectedIndex = versionsData.findIndex(v => v.id === versionId);
            
            // Set the selected version as "To Version" (current)
            setSelectedToVersion(selectedVersion.id);
            setCurrentVersion(selectedVersion);
            setNewContent(selectedVersion.content || '');
            
            // Set the previous version as "From Version" (if available)
            if (selectedIndex < versionsData.length - 1) {
              const previousVersion = versionsData[selectedIndex + 1];
              setSelectedFromVersion(previousVersion.id);
              setPreviousVersion(previousVersion);
              setOldContent(previousVersion.content || '');
              
              // Calculate detailed changes
              const detailed = analyzeDetailedChanges(previousVersion.content || '', selectedVersion.content || '');
              setDetailedChanges(detailed);
              
              // Fetch detailed comparison from API
              await fetchComparisonDetails(projectId!, previousVersion.codeVersion, selectedVersion.codeVersion);
            } else {
              // If this is the oldest version, compare with empty
              setSelectedFromVersion('');
              setPreviousVersion(null);
              setOldContent('');
            }
          }
        } else {
          // Default behavior: Set to the two most recent versions if available
        if (versionsData.length >= 2) {
          setSelectedToVersion(versionsData[0].id);
          setSelectedFromVersion(versionsData[1].id);

          setCurrentVersion(versionsData[0]);
          setPreviousVersion(versionsData[1]);

          setNewContent(versionsData[0].content || '');
          setOldContent(versionsData[1].content || '');
            
            // Calculate detailed changes
            const detailed = analyzeDetailedChanges(versionsData[1].content || '', versionsData[0].content || '');
            setDetailedChanges(detailed);
            
            // Fetch detailed comparison from API
            await fetchComparisonDetails(projectId!, versionsData[1].codeVersion, versionsData[0].codeVersion);
        } else if (versionsData.length === 1) {
          setSelectedToVersion(versionsData[0].id);
          setCurrentVersion(versionsData[0]);
          setNewContent(versionsData[0].content || '');
          }
        }
      } catch (error) {
        console.error('Error loading versions:', error);
        message.error('Failed to load versions');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [projectId, versionId]);

  // Compare versions when selection changes
  const handleVersionChange = async (fromVersionId: string, toVersionId: string) => {
    if (!toVersionId || fromVersionId === toVersionId) {
      return;
    }

    setChangeSummaryLoading(true);

    try {
      const fromVersion = fromVersionId ? versions.find(v => v.id === fromVersionId) : null;
      const toVersion = versions.find(v => v.id === toVersionId);

      if (toVersion) {
        setPreviousVersion(fromVersion || null);
        setCurrentVersion(toVersion);

        setOldContent(fromVersion?.content || '');
        setNewContent(toVersion.content || '');

        // Calculate detailed changes
        const detailed = analyzeDetailedChanges(fromVersion?.content || '', toVersion.content || '');
        setDetailedChanges(detailed);

        // Fetch detailed comparison from API (only if we have a from version)
        if (fromVersion) {
        await fetchComparisonDetails(projectId!, fromVersion.codeVersion, toVersion.codeVersion);
        }
      }
    } catch (error) {
      console.error('Error comparing versions:', error);
      message.error('Failed to compare versions');
    } finally {
      setChangeSummaryLoading(false);
    }
  };

  // Fetch comparison details from API
  const fetchComparisonDetails = async (projectId: string, beforeVersion: number, currentVersion: number) => {
    try {
      const token = localStorage.getItem('dbdocs_token');

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/v1/versions/compare`,
        {
          params: {
            projectId,
            beforeVersion,
            currentVersion
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data) {
        setDiffChanges(response.data);
      }
    } catch (error) {
      console.error('Error fetching comparison details:', error);
    }
  };

  // Calculate changes for summary display
  const changeSummary = useMemo(() => {
    if (currentVersion && !changeSummaryLoading) {
      return analyzeChangesForSummary(oldContent, newContent);
    }
    return null;
  }, [currentVersion, oldContent, newContent, changeSummaryLoading]);

  // Handle from version selection change
  const handleFromVersionChange = (versionId: string | undefined) => {
    const fromVersionId = versionId || '';
    setSelectedFromVersion(fromVersionId);
    handleVersionChange(fromVersionId, selectedToVersion);
  };

  // Handle to version selection change
  const handleToVersionChange = (versionId: string) => {
    setSelectedToVersion(versionId);
    handleVersionChange(selectedFromVersion, versionId);
  };

  // Function to handle "Create DDL update" button click
  const handleCreateDdlClick = () => {
    if (!selectedFromVersion || !selectedToVersion) {
      message.warning('Please select both versions to generate DDL updates');
      return;
    }
    setDdlModalVisible(true);
  };

  // Function to handle database type selection
  const handleDbTypeChange = (value: number) => {
    setSelectedDbType(value);
  };

  // Function to generate DDL update script
  const generateDdlScript = async () => {
    if (!projectId || !selectedFromVersion || !selectedToVersion) {
      message.error('Missing required parameters for DDL generation');
      return;
    }

    setGeneratingScript(true);

    try {
      const fromVersion = versions.find(v => v.id === selectedFromVersion);
      const toVersion = versions.find(v => v.id === selectedToVersion);

      if (!fromVersion || !toVersion) {
        throw new Error('Selected versions not found');
      }

      const token = localStorage.getItem('dbdocs_token');

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/v1/versions/generate-ddl`,
        {
          projectId,
          fromVersion: fromVersion.codeVersion,
          toVersion: toVersion.codeVersion,
          dialect: selectedDbType
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setGeneratedScript(response.data.ddlScript || 'No changes required.');
      setShowScriptResult(true);
    } catch (error) {
      console.error('Error generating DDL script:', error);
      message.error('Failed to generate DDL update script');
    } finally {
      setGeneratingScript(false);
    }
  };

  // Function to copy script to clipboard
  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(generatedScript)
      .then(() => {
        message.success('Script copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy script:', err);
        message.error('Failed to copy script to clipboard');
      });
  };

  // Function to download script as SQL file
  const downloadScript = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ddl_update_v${previousVersion?.codeVersion}_to_v${currentVersion?.codeVersion}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  // Helper function to get icon based on change type
  const getChangeIcon = (changeType: ChangeType) => {
    switch (changeType) {
      case 'added':
        return <PlusCircleOutlined style={{ color: '#52c41a' }} />;
      case 'removed':
        return <MinusCircleOutlined style={{ color: '#f5222d' }} />;
      case 'modified':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return null;
    }
  };

  // Helper function to get text color based on change type
  const getChangeTextColor = (changeType: ChangeType) => {
    switch (changeType) {
      case 'added':
        return '#52c41a';
      case 'removed':
        return '#f5222d';
      case 'modified':
        return '#faad14';
      default:
        return '#333';
    }
  };

  return (
    <div className="code-compare-page">
      {/* Header with logo and navigation */}
      <div className="code-compare-header">
        <div className="code-compare-header-left">
          <div className="code-compare-logo" onClick={() => navigate('/')}>
            <Logo variant="icon" width={48} height={48} />
          </div>
          <Button 
            className="code-compare-back-btn"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Title level={3} className="code-compare-title">Code Comparison</Title>
        </div>
      </div>

      <div style={{ padding: '0 32px', paddingBottom: 32 }}>

        <div className="version-selector-container">
          <Row gutter={16}>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
                <Text className="version-selector-label">From Version (Older):</Text>
            <Select
                  className="version-selector"
              style={{ width: '100%' }}
              placeholder="Select from version"
              value={selectedFromVersion}
              onChange={handleFromVersionChange}
              loading={loading}
                  allowClear
            >
                  <Option value="">No version (compare with empty)</Option>
              {versions.map(version => (
                <Option key={version.id} value={version.id}>
                  Version {version.codeVersion} - {new Date(version.createdDate).toLocaleDateString()}
                </Option>
              ))}
            </Select>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
                <Text className="version-selector-label">To Version (Newer):</Text>
            <Select
                  className="version-selector"
              style={{ width: '100%' }}
              placeholder="Select to version"
              value={selectedToVersion}
              onChange={handleToVersionChange}
              loading={loading}
            >
              {versions.map(version => (
                <Option key={version.id} value={version.id}>
                  Version {version.codeVersion} - {new Date(version.createdDate).toLocaleDateString()}
                </Option>
              ))}
            </Select>
          </Space>
        </Col>
      </Row>
        </div>

      <Button
        type="primary"
        icon={<CodeOutlined />}
          className="action-button"
        style={{ marginBottom: 24 }}
        onClick={handleCreateDdlClick}
        disabled={!selectedFromVersion || !selectedToVersion}
      >
        Create DDL Update
      </Button>

      {/* DDL Database Selection Modal */}
      <Modal
        title="Generate DDL Update Script"
        open={ddlModalVisible}
        onCancel={() => setDdlModalVisible(false)}
        footer={null}
        maskClosable={false}
        destroyOnClose
      >
        {!showScriptResult ? (
          <div>
            <p>Select database type for the DDL update script:</p>
            <Radio.Group
              value={selectedDbType}
              onChange={e => handleDbTypeChange(e.target.value)}
              style={{ marginBottom: 24 }}
            >
              <Space direction="vertical">
                <Radio value={1}>MySQL</Radio>
                <Radio value={2}>MariaDB</Radio>
                <Radio value={3}>PostgreSQL</Radio>
                <Radio value={4}>Oracle</Radio>
                <Radio value={5}>SQL Server</Radio>
              </Space>
            </Radio.Group>

            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setDdlModalVisible(false)} style={{ marginRight: 16 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={generateDdlScript}
                loading={generatingScript}
              >
                Generate
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ height: '60vh', overflowY: 'auto', marginBottom: 16, border: '1px solid #d9d9d9', borderRadius: 4 }}>
              <Editor
                height="100%"
                language="sql"
                theme="vs"
                value={generatedScript || '-- No changes required.'}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on' as const
                }}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <Button
                icon={<CopyOutlined />}
                onClick={copyScriptToClipboard}
                style={{ marginRight: 8 }}
              >
                Copy
              </Button>
              <Button
                icon={<DownloadOutlined />}
                type="primary"
                onClick={downloadScript}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Row gutter={[24, 24]}>
        {/* Left column for Summary */}
        <Col span={6}>
          <Card
            title={<Text strong>Change Summary</Text>}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)', height: '100%' }}
            bodyStyle={{ padding: '0 12px' }}
            loading={changeSummaryLoading}
          >
            {diffChanges ? (
              <div style={{ padding: '12px 0' }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Total Changes: </Text>
                  <Text>{diffChanges.totalChanges}</Text>
                </div>

                {diffChanges.addedTables?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: 4 }}>
                      Added Tables ({diffChanges.addedTables?.length}):
                    </Text>
                    {diffChanges.addedTables.map((table, i) => (
                      <div key={i} style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
                        <PlusCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        <Text code>{table}</Text>
                      </div>
                    ))}
                  </div>
                )}

                {diffChanges.removedTables?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ color: '#f5222d', display: 'block', marginBottom: 4 }}>
                      Removed Tables ({diffChanges.removedTables?.length}):
                    </Text>
                    {diffChanges.removedTables.map((table, i) => (
                      <div key={i} style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
                        <MinusCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                        <Text code>{table}</Text>
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(diffChanges.tableChanges ?? {}).length > 0 && (
                  <div>
                    <Text strong style={{ color: '#faad14', display: 'block', marginBottom: 4 }}>
                      Modified Tables ({Object.keys(diffChanges.tableChanges ?? {}).length}):
                    </Text>
                    {Object.entries(diffChanges.tableChanges ?? {}).map(([table, changes], i) => (
                      <div key={i} style={{ marginLeft: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                          <Text code strong>{table}</Text>
                          <Text type="secondary" style={{ marginLeft: 4 }}>({changes.length} changes)</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : changeSummary && changeSummary.length > 0 ? (
              <Collapse bordered={false} defaultActiveKey={['summary-panel']} expandIconPosition="end">
                <Panel
                  header={<Text strong>Overview Changes</Text>}
                  key="summary-panel"
                  style={{ borderBottom: 'none' }}
                >
                  {changeSummary.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 8,
                      fontSize: 14,
                      color: getChangeTextColor(item.change),
                      fontWeight: 500,
                    }}>
                      {getChangeIcon(item.change)}
                      <span style={{ marginLeft: 8 }}>
                        {item.type} <Text code style={{ color: getChangeTextColor(item.change) }}>{item.name}</Text>
                        {item.detailCount !== undefined && item.detailCount > 0 && (
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            ({item.detailCount})
                          </Text>
                        )}
                      </span>
                    </div>
                  ))}
                </Panel>
              </Collapse>
            ) : (
              <Text type="secondary" style={{ padding: '12px 0', display: 'block' }}>No changes between versions.</Text>
            )}
          </Card>
        </Col>

        {/* Right column for Diff Editor */}
        <Col span={18}>
          <Card
            style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 24px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fff',
              borderRadius: '8px 8px 0 0'
            }}>
              <Text strong>Previous Version: <Text type="secondary">{previousVersion ? `v${previousVersion.codeVersion}` : 'None'}</Text></Text>
              <Text strong>Current Version: <Text type="secondary">{currentVersion ? `v${currentVersion.codeVersion}` : 'None'}</Text></Text>
            </div>

            <DiffEditor
              height="70vh"
              language="sql"
              theme="vs"
              original={oldContent || '// No previous version'}
              modified={newContent || '// Current version content is empty'}
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on' as const,
                contextmenu: false,
                folding: false,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Changes Section */}
      {detailedChanges && detailedChanges.tables.length > 0 && (
        <Card
          className="detailed-changes"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Text strong style={{ fontSize: 18 }}>Detailed Changes</Text>
              <Space>
                <Text type="secondary">
                  <TableOutlined style={{ marginRight: 4 }} />
                  Tables: +{detailedChanges.summary.tablesAdded} ~{detailedChanges.summary.tablesModified} -{detailedChanges.summary.tablesRemoved}
                </Text>
                <Text type="secondary">
                  <FieldNumberOutlined style={{ marginRight: 4 }} />
                  Columns: +{detailedChanges.summary.columnsAdded} -{detailedChanges.summary.columnsRemoved}
                </Text>
              </Space>
            </div>
          }
          style={{ marginTop: 24 }}
        >
          <Collapse bordered={false} defaultActiveKey={detailedChanges.tables.map((_, i) => i.toString())}>
            {detailedChanges.tables.map((table, index) => (
              <Panel
                header={
                  <div className="table-change-header">
                    <span className="table-change-icon">
                      {table.changeType === 'added' && <PlusCircleOutlined style={{ color: '#059669' }} />}
                      {table.changeType === 'removed' && <MinusCircleOutlined style={{ color: '#dc2626' }} />}
                      {table.changeType === 'modified' && <ExclamationCircleOutlined style={{ color: '#d97706' }} />}
                    </span>
                    <span className="table-change-name">{table.tableName}</span>
                    <span className={`table-change-type change-${table.changeType}`}>
                      {table.changeType}
                    </span>
                  </div>
                }
                key={index.toString()}
              >
                <div className="table-change-item">
                  {table.columns && table.columns.length > 0 ? (
                    <div className="column-change-list">
                      <Text strong style={{ marginBottom: 12, display: 'block' }}>
                        Column Changes ({table.columns.length}):
                      </Text>
                      {table.columns.map((column, colIndex) => (
                        <div key={colIndex} className="column-change-item">
                          <span className="column-icon">
                            {column.changeType === 'added' && <PlusCircleOutlined style={{ color: '#059669' }} />}
                            {column.changeType === 'removed' && <MinusCircleOutlined style={{ color: '#dc2626' }} />}
                            {column.changeType === 'modified' && <ExclamationCircleOutlined style={{ color: '#d97706' }} />}
                          </span>
                          <span className="column-name">{column.columnName}</span>
                          <span className="column-type">
                            {column.changeType === 'added' && column.newType}
                            {column.changeType === 'removed' && column.oldType}
                            {column.changeType === 'modified' && `${column.oldType} → ${column.newType}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">No column changes detected.</Text>
                  )}
                </div>
              </Panel>
            ))}
          </Collapse>
        </Card>
      )}

      {/* CSS customizations for Summary Card and Ant Design overrides */}
      <style>{`
        /* Ant Design overrides */
        .ant-collapse-item {
            border-bottom: none !important;
        }
        .ant-collapse-header {
            padding: 12px 0 !important;
            border-bottom: 1px solid #f0f0f0 !important;
            font-weight: 600;
        }
        .ant-collapse-content-box {
            padding: 12px 0 !important;
        }
        .ant-collapse > .ant-collapse-item:last-child > .ant-collapse-header {
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        .ant-collapse-borderless > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
            padding: 0px 0 !important;
        }
      `}</style>
      </div>
    </div>
  );
};

export default CodeComparePage;
