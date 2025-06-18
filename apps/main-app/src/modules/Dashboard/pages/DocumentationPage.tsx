import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Tabs,
  Typography,
  Button,
  Space,
  Spin,
  message,
  Tag,
  Tooltip,
  Avatar,
  List,
  Card,
  Statistic,
  Row,
  Col,
  Table,
  Divider,
  Input,
  Select
} from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  ProjectOutlined,
  HistoryOutlined,
  EditOutlined,
  ClockCircleOutlined,
  TableOutlined,
  FieldNumberOutlined,
  SyncOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  CloseOutlined,
  SearchOutlined,
  FileOutlined,
  ApartmentOutlined,
  UploadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { apiService } from '../../../services/apiService';
import { userService } from '../../../services/userService';
import { DbmlEditor } from '../components/DbmlEditor';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Custom icons
const SortDescendingOutlined: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <span style={style}>↕</span>
);
const CaretDownOutlined: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <span style={style}>▼</span>
);

interface ProjectDetails {
  projectId: string;
  projectName: string;
  projectCode: string;
  description: string;
  creatorName: string;
  creatorAvatarUrl: string;
  createdDate: number;
  lastUpdatedDate: number;
  dbmlContent: string;
  ownerId?: string;
}

interface VersionInfo {
  id: string;
  projectId: string;
  codeVersion: number;
  changeLogId: string;
  diffChange: string;
  changeLog: {
    changeLogId: string;
    codeChangeLog: string;
    content: string;
    createdDate: string;
    createdBy: string;
    creatorName: string;
    creatorAvatarUrl: string;
  };
  content: string;
  createdDate: string;
  createdBy: string;
}

interface ChangelogItem {
  changeLogId: string;
  projectId: string;
  content: string;
  codeChangeLog: string;
  createdDate: number;
  createdBy: string;
  modifiedDate: number;
  modifiedBy: string;
  creatorName: string;
  creatorAvatarUrl: string;
  modifierName: string;
  modifierAvatarUrl: string;
}

interface TableStats {
  tableCount: number;
  fieldCount: number;
  updateCount: number;
}

// Interface for mock data
interface MockChangelogItem {
  changeLogId: string;
  codeChangeLog: string;
  createdDate: number;
  creatorName: string;
  creatorAvatarUrl: string;
}

interface RecentActivityItem {
  codeChangeLog: string;
  createdDate: number | string;
  creatorAvatarUrl: string;
  creatorName?: string;
  diffChange?: string;
  id?: string;
  userId?: string;
}

// Interface for parsed table structure
interface TableColumn {
  name: string;
  type: string;
  note?: string;
}

interface TableStructure {
  name: string;
  columns: TableColumn[];
  isExpanded?: boolean;
  note?: string;
}

interface SchemaStructure {
  name: string;
  tables: TableStructure[];
  isExpanded?: boolean;
}

const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('wiki');
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [changelogs, setChangelogs] = useState<ChangelogItem[]>([]);
  const [changelogLoading, setChangelogLoading] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [compareVersions, setCompareVersions] = useState<{from: string, to: string}>({ from: '', to: '' });
  const [tableStats, setTableStats] = useState<TableStats>({ tableCount: 0, fieldCount: 0, updateCount: 0 });
  const [currentDbmlContent, setCurrentDbmlContent] = useState<string>('');
  const [schemaStructure, setSchemaStructure] = useState<SchemaStructure[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredSchemaStructure, setFilteredSchemaStructure] = useState<SchemaStructure[]>([]);
  const [creatorInfo, setCreatorInfo] = useState<{ fullName: string; avatarUrl: string } | null>(null);
  const [versionCreators, setVersionCreators] = useState<Record<string, { fullName: string; avatarUrl: string }>>({});

  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchVersions();
      fetchChangelogs();
    }
  }, [projectId]);

  // Fetch user information for versions' creators
  useEffect(() => {
    if (versions.length > 0) {
      const fetchVersionCreators = async () => {
        const creatorsMap: Record<string, { fullName: string; avatarUrl: string }> = {};

        for (const version of versions) {
          const userId = version.createdBy || version.changeLog?.createdBy;
          if (userId && !creatorsMap[userId]) {
            try {
              const userInfo = await userService.getUserById(userId);
              if (userInfo) {
                creatorsMap[userId] = {
                  fullName: userInfo.fullName,
                  avatarUrl: userInfo.avatarUrl
                };
              }
            } catch (error) {
              console.error(`Error fetching user info for user ${userId}:`, error);
            }
          }
        }

        setVersionCreators(creatorsMap);
      };

      fetchVersionCreators();
    }
  }, [versions]);

  const fetchProjectDetails = async () => {
    try {
      const response = await apiService.get<ProjectDetails>(`/api/v1/projects/${projectId}`);
      setProject(response);

      // Get owner information if ownerId exists
      if (response.ownerId) {
        try {
          // The enhanced userService will handle redirects and system users automatically
          const ownerInfo = await userService.getUserById(response.ownerId);
          if (ownerInfo) {
            setCreatorInfo({ fullName: ownerInfo.fullName, avatarUrl: ownerInfo.avatarUrl });
          }
        } catch (error) {
          console.error('Error fetching owner info:', error);
        }
      }

      // Calculate stats from DBML content
      if (response.dbmlContent) {
        calculateStats(response.dbmlContent);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      message.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await apiService.get<VersionInfo[]>(`/api/v1/versions/project/${projectId}`);
      setVersions(response);

      // Set the latest version as selected
      if (response.length > 0) {
        setSelectedVersion(response[0].codeVersion.toString());
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      message.error('Failed to load versions');
    }
  };

  const fetchChangelogs = async () => {
    setChangelogLoading(true);
    try {
      const response = await apiService.get<ChangelogItem[]>(`/api/v1/changelogs/project/${projectId}`);
      setChangelogs(response);
    } catch (error) {
      console.error('Error fetching changelogs:', error);
      message.error('Failed to load changelog history');
    } finally {
      setChangelogLoading(false);
    }
  };

  const calculateStats = (dbmlContent: string) => {
    // Count tables from the parsed schema structure
    const parsedSchemas = parseDbmlContent(dbmlContent);
    const tableCount = parsedSchemas.reduce((total, schema) => total + schema.tables.length, 0);

    // Count fields from the parsed schema structure
    const fieldCount = parsedSchemas.reduce((total, schema) => {
      return total + schema.tables.reduce((tableTotal, table) => {
        return tableTotal + table.columns.length;
      }, 0);
    }, 0);

    setTableStats({
      tableCount,
      fieldCount,
      updateCount: versions.length || 1 // Use versions length or default to 1
    });
  };

  const formatDate = (timestamp: number | string) => {
    if (typeof timestamp === 'string') {
      return moment(timestamp).format('MMM DD, YYYY HH:mm');
    }
    return moment(timestamp).format('MMM DD, YYYY HH:mm');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleEdit = () => {
    navigate(`/dbml-editor/${projectId}`);
  };

  // Filter schema structure based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSchemaStructure(schemaStructure);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    const filtered = schemaStructure.map(schema => {
      // Filter tables that match the search term
      const filteredTables = schema.tables.filter(table =>
        table.name.toLowerCase().includes(lowerSearchTerm) ||
        table.columns.some(col => col.name.toLowerCase().includes(lowerSearchTerm))
      );

      // Create a new schema with only the filtered tables
      return {
        ...schema,
        tables: filteredTables,
        isExpanded: filteredTables.length > 0 // Auto-expand schemas with matching tables
      };
    }).filter(schema => schema.tables.length > 0);

    setFilteredSchemaStructure(filtered);
  }, [searchTerm, schemaStructure]);

  // Function to parse DBML content and extract table structure
  const parseDbmlContent = (dbmlContent: string) => {
    if (!dbmlContent) return [];

    const schemas: SchemaStructure[] = [];
    let currentSchema: SchemaStructure = { name: 'public', tables: [], isExpanded: true };

    // Simple regex-based parsing (in a real app, use a proper DBML parser)
    const tableRegex = /Table\s+(?:([a-zA-Z0-9_]+)\.)?([a-zA-Z0-9_]+)\s*{([^}]*)}/g;
    let tableMatch;

    while ((tableMatch = tableRegex.exec(dbmlContent)) !== null) {
      const schemaName = tableMatch[1] || 'public';
      const tableName = tableMatch[2];
      const tableContent = tableMatch[3];

      // Find or create schema
      let schema = schemas.find(s => s.name === schemaName);
      if (!schema) {
        schema = { name: schemaName, tables: [], isExpanded: schemaName === 'public' };
        schemas.push(schema);
      }

      // Parse columns
      const columns: TableColumn[] = [];
      const columnRegex = /\s*([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)(?:\s+\[note:\s*'([^']*)')?/g;
      let columnMatch;

      // Extract table note if exists
      const tableNoteRegex = /\[note:\s*'([^']*)'/;
      const tableNoteMatch = tableContent.match(tableNoteRegex);
      const tableNote = tableNoteMatch ? tableNoteMatch[1] : '';

      while ((columnMatch = columnRegex.exec(tableContent)) !== null) {
        columns.push({
          name: columnMatch[1],
          type: columnMatch[2],
          note: columnMatch[3] || ''
        });
      }

      schema.tables.push({
        name: tableName,
        columns,
        isExpanded: false,
        note: tableNote
      });
    }

    // If no schemas were found, use the mock data
    if (schemas.length === 0) {
      return [{
        name: 'public',
        tables: [
          {
            name: 'project',
            columns: [
              { name: 'id', type: 'uuid', note: 'Primary key for project' },
              { name: 'name', type: 'varchar', note: 'Project name' }
            ],
            isExpanded: false,
            note: 'Projects information'
          },
          {
            name: 'ChangeLog',
            columns: [
              { name: 'change_log_id', type: 'string', note: 'Primary key' },
              { name: 'project_id', type: 'string', note: 'Reference to project' },
              { name: 'content', type: 'string', note: 'Change content' },
              { name: 'code_change_log', type: 'string', note: 'Code changes' },
              { name: 'created_date', type: 'timestamp', note: 'Creation timestamp' },
              { name: 'created_by', type: 'string', note: 'Creator ID' },
              { name: 'modified_date', type: 'timestamp', note: 'Last modified timestamp' },
              { name: 'modified_by', type: 'string', note: 'Modifier ID' }
            ],
            isExpanded: true,
            note: 'Tracks changes to projects'
          },
          {
            name: 'Version',
            columns: [
              { name: 'id', type: 'uuid', note: 'Primary key' },
              { name: 'project_id', type: 'uuid', note: 'Reference to project' },
              { name: 'version', type: 'integer', note: 'Version number' }
            ],
            isExpanded: false,
            note: 'Project versions'
          },
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'uuid', note: 'Primary key' },
              { name: 'username', type: 'varchar', note: 'User login name' },
              { name: 'email', type: 'varchar', note: 'User email address' }
            ],
            isExpanded: false,
            note: 'User information'
          },
          {
            name: 'project_access',
            columns: [
              { name: 'id', type: 'uuid', note: 'Primary key' },
              { name: 'project_id', type: 'uuid', note: 'Reference to project' },
              { name: 'user_id', type: 'uuid', note: 'Reference to user' },
              { name: 'access_level', type: 'varchar', note: 'Level of access' }
            ],
            isExpanded: false,
            note: 'Project access permissions'
          }
        ],
        isExpanded: true
      }];
    }

    return schemas;
  };

  const handleVersionChange = (value: string) => {
    setSelectedVersion(value);

    // Find the selected version data
    const selectedVersionData = versions.find(v => v.codeVersion.toString() === value);
    if (selectedVersionData) {
      console.log('Selected version:', selectedVersionData);

      // Update the current DBML content
      setCurrentDbmlContent(selectedVersionData.content);

      // Parse the DBML content to extract table structure
      const parsedSchemas = parseDbmlContent(selectedVersionData.content);
      setSchemaStructure(parsedSchemas);
    }
  };

  // Toggle schema expansion
  const toggleSchemaExpansion = (schemaIndex: number) => {
    setSchemaStructure(prevSchemas => {
      const newSchemas = [...prevSchemas];
      newSchemas[schemaIndex].isExpanded = !newSchemas[schemaIndex].isExpanded;
      return newSchemas;
    });
  };

  // Toggle table expansion
  const toggleTableExpansion = (schemaIndex: number, tableIndex: number) => {
    setSchemaStructure(prevSchemas => {
      const newSchemas = [...prevSchemas];
      newSchemas[schemaIndex].tables[tableIndex].isExpanded =
        !newSchemas[schemaIndex].tables[tableIndex].isExpanded;
      return newSchemas;
    });
  };

  useEffect(() => {
    if (project?.dbmlContent) {
      setCurrentDbmlContent(project.dbmlContent);
      const parsedSchemas = parseDbmlContent(project.dbmlContent);
      setSchemaStructure(parsedSchemas);
      setFilteredSchemaStructure(parsedSchemas);
    }
  }, [project]);

  // When versions are loaded, update the content with the selected version
  useEffect(() => {
    if (versions.length > 0 && selectedVersion) {
      const selectedVersionData = versions.find(v => v.codeVersion.toString() === selectedVersion);
      if (selectedVersionData) {
        setCurrentDbmlContent(selectedVersionData.content);
        const parsedSchemas = parseDbmlContent(selectedVersionData.content);
        setSchemaStructure(parsedSchemas);
        setFilteredSchemaStructure(parsedSchemas);

        // Update tableStats when versions are loaded
        const tableCount = parsedSchemas.reduce((total, schema) => total + schema.tables.length, 0);
        const fieldCount = parsedSchemas.reduce((total, schema) => {
          return total + schema.tables.reduce((tableTotal, table) => {
            return tableTotal + table.columns.length;
          }, 0);
        }, 0);

        setTableStats({
          tableCount,
          fieldCount,
          updateCount: versions.length
        });
      }
    }
  }, [versions, selectedVersion]);

  // Render project info directly in the main content area
  const renderProjectInfo = () => {
    if (!project) return <Spin size="large" />;

    return (
      <div className="project-info-container" style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '4px',
        border: '1px solid #e8e8e8',
        marginBottom: '24px'
      }}>
        <Title level={2} style={{ fontSize: '28px', marginBottom: '24px' }}>{project.projectName || 'Project 1'}</Title>

        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>Creator:</Text>
            <Space>
              <Avatar
                size="small"
                src={creatorInfo?.avatarUrl}
                icon={!creatorInfo?.avatarUrl ? <UserOutlined /> : undefined}
                style={{ marginRight: '8px' }}
              />
              <Text>{creatorInfo?.fullName || project.creatorName || 'quandev03'}</Text>
            </Space>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>Date created:</Text>
            <Text>{project.createdDate ? formatDate(project.createdDate) : 'April 16th 2025'}</Text>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>Project code:</Text>
            <Text>{project.projectCode || 'PRJ001'}</Text>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>Last updated:</Text>
            <Text>{project.lastUpdatedDate ? formatDate(project.lastUpdatedDate) : '18 hours ago'}</Text>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>Database type:</Text>
            <Text>PostgreSQL</Text>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>Version:</Text>
            <Text>{selectedVersion || '4'} (Latest)</Text>
          </div>
          <div style={{ width: '100%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>Description:</Text>
            <Text>{project.description || 'This project contains database documentation for the application.'}</Text>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            Edit Project
          </Button>
        </div>
      </div>
    );
  };

  // Wiki tab content
  const renderWikiTab = () => {
    if (!project) return null;

    const mockRecentActivities: RecentActivityItem[] = [
      { id: 'mock-1', userId: 'mock-user-1', codeChangeLog: '4', createdDate: Date.now() - 19*60*60*1000, creatorAvatarUrl: '' },
      { id: 'mock-2', userId: 'mock-user-2', codeChangeLog: '3', createdDate: Date.now() - 19*60*60*1000, creatorAvatarUrl: '' },
    ];

    return (
      <div className="wiki-container">
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col span={12}>
            <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>Recent activities</Text>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              {(versions.length > 0 ? versions.slice(0, 2).map(v => ({
                id: v.id,
                userId: v.createdBy || v.changeLog?.createdBy,
                codeChangeLog: v.codeVersion.toString(),
                createdDate: v.createdDate,
                creatorAvatarUrl: v.changeLog?.creatorAvatarUrl || '',
                creatorName: v.changeLog?.creatorName || '',
                diffChange: v.diffChange
              })) : mockRecentActivities).map((item, index) => {
                const userInfo = item.userId ? versionCreators[item.userId] : null;

                return (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: index === 0 ? '1px solid #e8e8e8' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Text style={{ marginRight: '16px' }}>
                        {item.createdDate ? formatDate(item.createdDate) : '19 hours ago'}
                      </Text>
                      <Text strong>Version {item.codeChangeLog}</Text>
                      {index === 0 && (
                        <Tag color="red" style={{ marginLeft: '8px', fontSize: '11px' }}>NEW</Tag>
                      )}
                    </div>
                    <Avatar
                      src={userInfo?.avatarUrl || item.creatorAvatarUrl}
                      icon={!(userInfo?.avatarUrl || item.creatorAvatarUrl) ? <UserOutlined /> : undefined}
                    />
                  </div>
                );
              })}
              <div style={{ padding: '8px 0', textAlign: 'center', borderTop: '1px solid #e8e8e8' }}>
                <Button type="link" onClick={() => setActiveTab('changelog')} style={{ fontSize: '14px' }}>view more</Button>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>Schema note</Text>
            <div style={{
              border: '1px solid #e8e8e8',
              borderRadius: '4px',
              padding: '16px',
              height: '152px'
            }}>
            </div>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card
              style={{ textAlign: 'center', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <TableOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Title level={2} style={{ margin: 0, fontSize: '36px', color: '#262626' }}>{tableStats.tableCount}</Title>
              </div>
              <Text style={{ fontSize: '14px', color: '#595959' }}>Tables</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              style={{ textAlign: 'center', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <FieldNumberOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Title level={2} style={{ margin: 0, fontSize: '36px', color: '#262626' }}>{tableStats.fieldCount}</Title>
              </div>
              <Text style={{ fontSize: '14px', color: '#595959' }}>Fields</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              style={{ textAlign: 'center', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <EditOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Title level={2} style={{ margin: 0, fontSize: '36px', color: '#262626' }}>{tableStats.updateCount}</Title>
              </div>
              <Text style={{ fontSize: '14px', color: '#595959' }}>Updates</Text>
            </Card>
          </Col>
        </Row>

        <div>
          <Row style={{
            fontWeight: 'bold',
            padding: '8px 0',
            borderBottom: '1px solid #e8e8e8'
          }}>
            <Col span={8}>Name</Col>
            <Col span={8}>Table notes</Col>
            <Col span={8}>Last Update</Col>
          </Row>

          {schemaStructure.flatMap(schema =>
            schema.tables.map((table, tableIndex) => {
              // Find the latest version that modified this table
              // In a real app, you would have more precise tracking of which tables were modified in each version
              const latestVersion = versions.length > 0 ? versions[0] : null;

              return (
                <Row key={`table-list-${schema.name}-${tableIndex}`} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Col span={8} style={{ display: 'flex', alignItems: 'center' }}>
                    <TableOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    {table.name}
                  </Col>
                  <Col span={8}>{table.note || `Table for ${table.name} data`}</Col>
                  <Col span={8} style={{ display: 'flex', alignItems: 'center' }}>
                    <ClockCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    {latestVersion?.createdDate ? formatDate(latestVersion.createdDate) :
                     (project?.lastUpdatedDate ? formatDate(project.lastUpdatedDate) : '19 hours ago')}
                  </Col>
                </Row>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Diagram tab content
  const renderDiagramTab = () => {
    if (!project) return null;

    const handlePublishToDbdocs = () => {
      // Xử lý khi người dùng nhấn nút Publish to Dbdocs
      message.success('Publishing to Dbdocs...');
      // Thêm logic publish thực tế ở đây
    };

    return (
      <div style={{ padding: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Text style={{ marginRight: '4px', fontSize: '13px' }}>
            {project?.creatorName || 'quandev03'}/{project?.projectName || 'Project 1'} • <Text strong style={{ fontSize: '13px' }}>{project?.projectCode || 'PRJ001'}</Text>
          </Text>

          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handlePublishToDbdocs}
          >
            Publish to Dbdocs
          </Button>
        </div>

        <div style={{ padding: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', minHeight: '400px' }}>
          {/* Nội dung diagram hiện tại */}
          <div style={{ textAlign: 'center', color: '#999', marginTop: '160px' }}>
            <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>Database diagram will be displayed here</div>
          </div>
        </div>
      </div>
    );
  };

  // Changelog tab content
  const renderChangelogTab = () => {
    if (changelogLoading) return <Spin />;

    // Mock data with proper typing for when no versions are available
    const mockVersions: VersionInfo[] = [
      {
        id: 'mock-1',
        projectId: projectId || '',
        codeVersion: 4,
        changeLogId: 'cl-1',
        diffChange: '',
        changeLog: {
          changeLogId: 'cl-1',
          codeChangeLog: '4',
          content: 'Added new tables',
          createdDate: new Date().toISOString(),
          createdBy: 'user-1',
          creatorName: 'quandev03',
          creatorAvatarUrl: ''
        },
        content: '',
        createdDate: new Date(Date.now() - 19*60*60*1000).toISOString(),
        createdBy: 'user-1'
      },
      {
        id: 'mock-2',
        projectId: projectId || '',
        codeVersion: 3,
        changeLogId: 'cl-2',
        diffChange: '',
        changeLog: {
          changeLogId: 'cl-2',
          codeChangeLog: '3',
          content: 'Updated schema',
          createdDate: new Date().toISOString(),
          createdBy: 'user-1',
          creatorName: 'quandev03',
          creatorAvatarUrl: ''
        },
        content: '',
        createdDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
        createdBy: 'user-1'
      },
      {
        id: 'mock-3',
        projectId: projectId || '',
        codeVersion: 2,
        changeLogId: 'cl-3',
        diffChange: '',
        changeLog: {
          changeLogId: 'cl-3',
          codeChangeLog: '2',
          content: 'Initial schema setup',
          createdDate: new Date().toISOString(),
          createdBy: 'user-1',
          creatorName: 'quandev03',
          creatorAvatarUrl: ''
        },
        content: '',
        createdDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
        createdBy: 'user-1'
      }
    ];

    return (
      <div style={{ padding: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Text style={{ marginRight: '4px', fontSize: '13px' }}>
            {project?.creatorName || 'quandev03'}/{project?.projectName || 'Project 1'} • <Text strong style={{ fontSize: '13px' }}>{project?.projectCode || 'PRJ001'}</Text>
          </Text>
        </div>

        <Card title="Version History" style={{ marginBottom: '24px' }}>
          <List
            itemLayout="horizontal"
            dataSource={versions}
            renderItem={(item, index) => {
              const userId = item.createdBy || item.changeLog?.createdBy;
              const userInfo = userId ? versionCreators[userId] : null;

              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={userInfo?.avatarUrl || item.changeLog?.creatorAvatarUrl}
                        icon={!(userInfo?.avatarUrl || item.changeLog?.creatorAvatarUrl) ? <UserOutlined /> : undefined}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text strong>Version {item.codeVersion}</Text>
                        {index === 0 && <Tag color="red" style={{ marginLeft: '8px' }}>LATEST</Tag>}
                      </div>
                    }
                    description={
                      <div>
                        <div>{item.changeLog?.content || 'Updated database schema'}</div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '4px' }}>
                          {item.createdDate ? formatDate(item.createdDate) : 'Unknown date'} by {userInfo?.fullName || item.changeLog?.creatorName || 'Unknown'}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      </div>
    );
  };

  // Render the sidebar with schema and table structure
  const renderSidebar = () => {
    return (
      <div style={{
        padding: '12px 0',
        height: 'calc(100vh - 112px)',
        overflow: 'auto',
        fontSize: '12px'
      }}>
        <div style={{ padding: '0 12px' }}>
          <Input
            placeholder="Search tables, fields..."
            style={{ marginBottom: '12px' }}
            prefix={<SearchOutlined />}
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '12px', fontSize: '11px' }}>
          {filteredSchemaStructure.map((schema, schemaIndex) => (
            <div key={`schema-${schemaIndex}`}>
              <div
                style={{
                  padding: '4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f5f5f5'
                }}
                onClick={() => toggleSchemaExpansion(schemaIndex)}
              >
                <CaretDownOutlined
                  style={{
                    marginRight: '6px',
                    fontSize: '9px',
                    transform: schema.isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s'
                  }}
                />
                <Text strong style={{ fontSize: '11px' }}>{schema.name}</Text>
              </div>

              {schema.isExpanded && schema.tables.map((table, tableIndex) => (
                <div key={`table-${schemaIndex}-${tableIndex}`}>
                  <Tooltip title={table.note || `Table: ${table.name}`} placement="right">
                    <div
                      style={{
                        padding: '4px 12px',
                        paddingLeft: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: searchTerm && table.name.toLowerCase().includes(searchTerm.toLowerCase())
                          ? '#e6f7ff'
                          : 'transparent'
                      }}
                      onClick={() => toggleTableExpansion(schemaIndex, tableIndex)}
                    >
                      <CaretDownOutlined
                        style={{
                          marginRight: '6px',
                          fontSize: '9px',
                          transform: table.isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                      <Text strong style={{ fontSize: '11px' }}>{table.name}</Text>
                    </div>
                  </Tooltip>

                  {table.isExpanded && table.columns.map((column, columnIndex) => (
                    <Tooltip
                      key={`column-${schemaIndex}-${tableIndex}-${columnIndex}`}
                      title={
                        <div>
                          <div><strong>Name:</strong> {column.name}</div>
                          <div><strong>Type:</strong> {column.type}</div>
                          {column.note && <div><strong>Note:</strong> {column.note}</div>}
                        </div>
                      }
                      placement="right"
                    >
                      <div
                        style={{
                          padding: '3px 6px 3px 0',
                          paddingLeft: '42px',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: searchTerm && column.name.toLowerCase().includes(searchTerm.toLowerCase())
                            ? '#e6f7ff'
                            : 'transparent'
                        }}
                      >
                        <span style={{ marginRight: '4px', fontSize: '10px', color: '#999' }}>□</span>
                        <Text style={{ fontSize: '11px' }}>{column.name}</Text>
                        <Text style={{ fontSize: '10px', color: '#999', marginLeft: '4px' }}>({column.type})</Text>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Create options for version selector from fetched versions
  const versionOptions = versions.map(version => ({
    value: version.codeVersion.toString(),
    label: `Version ${version.codeVersion}${version.codeVersion === Math.max(...versions.map(v => v.codeVersion)) ? ' (Latest)' : ''}`
  }));

  // If no versions are loaded yet, provide a default option
  if (versionOptions.length === 0) {
    versionOptions.push({ value: '4', label: 'Version 4 (Latest)' });
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#ff5252',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              marginRight: '8px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/projects')}
          >
            <span>V</span>
          </div>
          <div>
            <Text strong style={{ fontSize: '16px', marginRight: '10px', display: 'block' }}>{project?.projectName || 'Project 1'}</Text>
            <Text style={{ fontSize: '12px', color: '#888', display: 'block' }}>Code: {project?.projectCode || 'PRJ001'}</Text>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<DownloadOutlined />}
            style={{ marginRight: '8px' }}
          >
            Share
          </Button>
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            shape="circle"
            style={{ marginRight: '8px' }}
          />
          <Avatar
            src= {creatorInfo?.avatarUrl}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </Header>

      <div style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Select
          value={selectedVersion}
          onChange={handleVersionChange}
          style={{ width: 150, marginRight: '16px' }}
          options={versionOptions}
          loading={loading}
        />

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          style={{ flex: 1, marginBottom: 0 }}
          centered
          tabBarStyle={{ borderBottom: 'none' }}
          tabBarGutter={30}
          items={[
            {
              key: 'wiki',
              label: (
                <div style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: activeTab === 'wiki' ? '2px solid #1890ff' : 'none'
                }}>
                  <BookOutlined style={{ marginRight: '6px' }} />
                  Wiki
                </div>
              )
            },
            {
              key: 'diagram',
              label: (
                <div style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: activeTab === 'diagram' ? '2px solid #1890ff' : 'none'
                }}>
                  <ProjectOutlined style={{ marginRight: '6px' }} />
                  Diagram
                </div>
              )
            },
            {
              key: 'changelog',
              label: (
                <div style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: activeTab === 'changelog' ? '2px solid #1890ff' : 'none'
                }}>
                  <HistoryOutlined style={{ marginRight: '6px' }} />
                  Changelog
                </div>
              )
            }
          ]}
        />
      </div>

      <Layout style={{ background: '#fff', display: 'flex', flexDirection: 'row' }}>
        {/* Sidebar with schema and table structure */}
        <div style={{
          width: '180px',
          minWidth: '180px',
          borderRight: '1px solid #f0f0f0',
          height: 'calc(100vh - 112px)',
          overflow: 'auto'
        }}>
          {renderSidebar()}
        </div>

        {/* Main content */}
        <Content style={{ height: 'calc(100vh - 112px)', overflow: 'auto', padding: '16px', flex: 1 }}>
          {activeTab === 'wiki' &&
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <Text style={{ marginRight: '4px', fontSize: '13px' }}>
                  {project?.creatorName || 'quandev03'}/{project?.projectName || 'Project 1'} • <Text strong style={{ fontSize: '13px' }}>{project?.projectCode || 'PRJ001'}</Text>
                </Text>
              </div>
              {renderProjectInfo()}
              {renderWikiTab()}
            </div>
          }
          {activeTab === 'diagram' && renderDiagramTab()}
          {activeTab === 'changelog' && renderChangelogTab()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DocumentationPage;
