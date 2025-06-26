import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../../services/authService';
import { API_CONFIG } from '../../../config';
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
  Select,
  Modal,
  Dropdown
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
  DatabaseOutlined,
  UploadOutlined,
  ZoomOutOutlined,
  ZoomInOutlined,
  FullscreenOutlined,
  DiffOutlined,
  CodeOutlined,
  ShareAltOutlined,
  LockOutlined,
  GlobalOutlined,
  LinkOutlined,
  TeamOutlined,
  CopyOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { apiService } from '../../../services/apiService';
import { DbmlEditor } from '../components/DbmlEditor';
import MonacoEditor from '@monaco-editor/react';
import * as diff from 'diff';
import CodeCompareModal from './CodeCompareModal';
import axios from 'axios';
import Logo from '../../../components/common/Logo';
import SettingsPopup from '../../../components/SettingsPopup';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import './DocumentationPage.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Custom icons
const SortDescendingOutlined: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <span style={style}>↕</span>
);
const CaretDownOutlined: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <span style={style}>▼</span>
);

interface ProjectDetails {
  projectId: string;
  projectCode: string;
  description: string;
  passwordShare?: string | null;
  visibility?: number;
  ownerEmail?: string;
  ownerAvatarUrl?: string;
  ownerId?: string;
  createdDate: number;
  createdBy: string;
  modifiedDate: number;
  modifiedBy: string;
  // Fields we need for UI but might not be in the API response
  projectName?: string;
  creatorName?: string;
  creatorAvatarUrl?: string;
  dbmlContent?: string;
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

interface ShareFormValues {
  shareType: number;
  passwordShare: string | null;
}

const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('wiki');
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
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
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [isCompareModalVisible, setIsCompareModalVisible] = useState<boolean>(false);
  const [selectedVersionForCompare, setSelectedVersionForCompare] = useState<VersionInfo | null>(null);
  const [previousVersion, setPreviousVersion] = useState<VersionInfo | null>(null);
  const [diffResult, setDiffResult] = useState<string>('');
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const [shareType, setShareType] = useState<number>(1); // Default to public
  const [sharePassword, setSharePassword] = useState<string>('');
  const [sharedLink, setSharedLink] = useState<string>('');
  const [showPasswordField, setShowPasswordField] = useState<boolean>(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isSharedProject, setIsSharedProject] = useState<boolean>(false);
  const [sharedProjectId, setSharedProjectId] = useState<string>('');
  const [sharedProjectType, setSharedProjectType] = useState<number>(0);
  const [accessCall, setAccessCall] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<TableStructure | null>(null);
  const [selectedSchemaName, setSelectedSchemaName] = useState<string>('');

  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Reference to the DbmlEditor component
  const dbmlEditorRef = useRef<any>(null);
  useEffect(() => {
    // Biến cờ để kiểm tra xem component có còn được mount hay không
    let isMounted = true;

    // Định nghĩa một hàm async riêng bên trong để lấy dữ liệu
    const fetchCurrentUser = async () => {
      try {
        console.log("get data user");
        const currentUser = await authService.getCurrentUser();

        console.log("currentUser", currentUser);

        // Chỉ cập nhật state nếu component vẫn còn được mount
        if (isMounted) {
          setCreatorInfo({
            fullName: currentUser?.name || currentUser?.email || 'Unknown User',
            avatarUrl: currentUser?.pictureUrl || '',
          });
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        // Bạn có thể set một state lỗi ở đây nếu cần
        if (isMounted) {
          setCreatorInfo({
            fullName: 'Unknown User',
            avatarUrl: '',
          });
        }
      }
    };

    fetchCurrentUser();

    // Đây là hàm cleanup, nó sẽ chạy khi component unmount
    // Ta sẽ set cờ isMounted thành false để ngăn việc cập nhật state trên một component đã unmount
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (projectId) {
      const path = window.location.pathname;

      // Check if it's a shared project URL format
      if (path.startsWith('/project/')) {
        const parts = path.split('/');
        // Need at least 4 parts for the format /project/:shareType/:projectId
        if (parts.length >= 4) {
          const shareType = parseInt(parts[2], 10);
          const projectId = parts[3];

          setIsSharedProject(true);
          setSharedProjectId(projectId);
          setSharedProjectType(shareType);

          // If password protected, show password modal
          if (shareType === 3) {
            setPasswordModalVisible(true);
          } else {
            // Otherwise, try to access directly
            setLoading(false)
            handleSharedProjectAccess(projectId, shareType);
          }
          console.log("Shared project URL detected:", path, "Share Type:", shareType, "Project ID:", projectId);
        }
      }else{
        setLoading(false)
        console.log("Invalid project URL format:", path);
        fetchProjectDetails();
      }
      fetchVersions();
      fetchChangelogs();
    }
  }, [projectId, loading]);

  // Use static user information for versions' creators
  useEffect(() => {
    if (versions.length > 0) {
      const creatorsMap: Record<string, { fullName: string; avatarUrl: string }> = {};

      for (const version of versions) {
        const userId = version.createdBy || version.changeLog?.createdBy;
        if (userId && !creatorsMap[userId]) {
          // Use the creator information from the version itself
          creatorsMap[userId] = {
            fullName: version.changeLog?.creatorName || 'Unknown User',
            avatarUrl: version.changeLog?.creatorAvatarUrl || ''
          };
        }
      }

      setVersionCreators(creatorsMap);
    }
  }, [versions]);

  const fetchProjectDetails = async () => {
    try {
      // call api with projectId
      const response = await apiService.get<ProjectDetails>(`/api/v1/projects/${projectId}`);

      // Create a normalized project object that works with our UI
      const normalizedProject = {
        ...response,
        projectName: response.projectName || response.projectCode || 'Unnamed Project',
        creatorName: response.creatorName || response.ownerEmail || 'Unknown User',
        creatorAvatarUrl: response.creatorAvatarUrl || response.ownerAvatarUrl || '',
        dbmlContent: response.dbmlContent || ''
      };

      setProject(normalizedProject);

      // Calculate stats from DBML content
      if (normalizedProject.dbmlContent) {
        calculateStats(normalizedProject.dbmlContent);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      message.error('Failed to load project details');
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await apiService.get<VersionInfo[]>(`/api/v1/versions/project/${projectId}`);

      // Log the first version's createdDate to check its format
      if (response.length > 0) {
        console.log('Version timestamp type:', typeof response[0].createdDate);
        console.log('Version timestamp value:', response[0].createdDate);

        // Check if we need to manually convert string dates to numbers
        response.forEach(version => {
          if (typeof version.createdDate === 'string') {
            try {
              // Try to parse the date string directly
              const parsedDate = new Date(version.createdDate);

              // If we got a valid date far from epoch, keep it as string
              // Otherwise, try to parse it as a number
              if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() < 1975) {
                const numTimestamp = parseInt(version.createdDate, 10);
                if (!isNaN(numTimestamp)) {
                  console.log(`Converting timestamp ${version.createdDate} to number: ${numTimestamp}`);
                }
              }
            } catch (e) {
              console.error('Error parsing date:', version.createdDate, e);
            }
          }
        });
      }

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
    if (!timestamp) return 'N/A';

    // Handle timestamp whether it's a number or string
    let date: Date;
    if (typeof timestamp === 'string') {
      // Try to parse as ISO string first
      date = new Date(timestamp);

      // If the date is invalid or near epoch (before 1975), try parsing as a number
      if (isNaN(date.getTime()) || date.getFullYear() < 1975) {
        // Try parsing as a number
        const numTimestamp = parseInt(timestamp, 10);
        if (!isNaN(numTimestamp)) {
          // Check if we need to multiply by 1000 (seconds to milliseconds)
          if (numTimestamp < 10000000000) { // Less than 11 digits means it's in seconds
            date = new Date(numTimestamp * 1000);
          } else {
            date = new Date(numTimestamp);
          }
        }
      }
    } else {
      // Handle numeric timestamp
      // Check if we need to multiply by 1000 (seconds to milliseconds)
      if (timestamp < 10000000000) { // Less than 11 digits means it's in seconds
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }
    }

    // If date is still invalid, return N/A
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return 'N/A';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);

    // Dưới 1 phút thì hiển thị số giây
    if (diffMin < 1) {
      return `${diffSec} giây trước`;
    }

    // Dưới 1 giờ thì hiển thị số phút
    if (diffHour < 1) {
      return `${diffMin} phút trước`;
    }

    // Dưới 1 ngày thì hiển thị số giờ
    if (diffDay < 1) {
      return `${diffHour} giờ trước`;
    }

    // Dưới 1 tháng thì hiển thị số ngày
    if (diffMonth < 1) {
      return `${diffDay} ngày trước`;
    }

    // Trên 1 tháng thì hiển thị theo format dd/MM/yyyy hh:mm
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

    // If no schemas were found, return an empty array instead of mock data
    if (schemas.length === 0) {
      return [];
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
      const currentExpanded = newSchemas[schemaIndex].tables[tableIndex].isExpanded;
      newSchemas[schemaIndex].tables[tableIndex].isExpanded = !currentExpanded;

      console.log(`Toggling table ${tableIndex} in schema ${schemaIndex} from ${currentExpanded} to ${!currentExpanded}`);

      return newSchemas;
    });
  };

  // Handle table selection for detail view
  const handleTableSelect = (table: TableStructure, schemaName: string) => {
    setSelectedTable(table);
    setSelectedSchemaName(schemaName);
  };

  // Handle schema selection for database overview
  const handleSchemaSelect = (schemaName: string) => {
    setSelectedTable(null);
    setSelectedSchemaName(schemaName);
  };

  // Handle back to database view
  const handleBackToDatabaseView = () => {
    setSelectedTable(null);
    setSelectedSchemaName('');
  };

  // Render database overview when schema is selected (without specific table)
  const renderDatabaseOverviewContent = () => {
    if (!selectedSchemaName) return null;

    const selectedSchema = schemaStructure.find(s => s.name === selectedSchemaName);
    if (!selectedSchema) return null;

    return (
      <div className="database-overview-content" style={{ padding: '0' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px 24px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #e8e8e8'
        }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToDatabaseView}
            style={{
              marginRight: '12px',
              color: '#1890ff'
            }}
          >
            {t('docs.back')}
          </Button>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              {selectedSchemaName}(dbdocs)
            </Title>
            <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Database Schema • {selectedSchema.tables.length} tables • {selectedSchema.tables.reduce((total, table) => total + table.columns.length, 0)} fields
            </Text>
          </div>
        </div>

        {/* Database statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Statistic
                title="Tables"
                value={selectedSchema.tables.length}
                prefix={<TableOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Statistic
                title="Fields"
                value={selectedSchema.tables.reduce((total, table) => total + table.columns.length, 0)}
                prefix={<FieldNumberOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Statistic
                title="Updates"
                value={tableStats.updateCount}
                prefix={<EditOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Tables list */}
        <Card title="Tables" style={{ marginBottom: '24px' }}>
          <Table
            dataSource={selectedSchema.tables.map((table, index) => ({
              key: index,
              ...table
            }))}
            pagination={false}
            size="middle"
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (name: string, record) => (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: '#1890ff'
                    }}
                    onClick={() => handleTableSelect(record, selectedSchemaName)}
                  >
                    <TableOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <Text strong style={{ color: '#1890ff' }}>{name}</Text>
                  </div>
                )
              },
              {
                title: 'Columns',
                key: 'columns',
                render: (_, record) => (
                  <Text>{record.columns.length}</Text>
                )
              },
              {
                title: 'Table notes',
                dataIndex: 'note',
                key: 'note',
                render: (note: string) => (
                  <Text style={{
                    color: note ? '#595959' : '#bfbfbf',
                    fontStyle: note ? 'normal' : 'italic'
                  }}>
                    {note || 'No notes'}
                  </Text>
                )
              },
              {
                title: 'Last Update',
                key: 'lastUpdate',
                render: () => {
                  const latestVersion = versions.length > 0 ? versions[0] : null;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ClockCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {latestVersion?.createdDate ? formatDate(latestVersion.createdDate) :
                       (project?.modifiedDate ? formatDate(project.modifiedDate) : 'N/A')}
                    </div>
                  );
                }
              }
            ]}
            onRow={(record) => ({
              style: { cursor: 'pointer' },
              onClick: () => handleTableSelect(record, selectedSchemaName)
            })}
          />
        </Card>
      </div>
    );
  };

  // Render table detail in main content area
  const renderTableDetailContent = () => {
    if (!selectedTable) return null;

    return (
      <div className="table-detail-content" style={{ padding: '0' }}>
        {/* Header with back button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px 24px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #e8e8e8'
        }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToDatabaseView}
            style={{
              marginRight: '12px',
              color: '#1890ff'
            }}
          >
            {t('docs.backToDatabase')}
          </Button>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: 0, marginBottom: '4px' }}>
              {selectedTable.name}
            </Title>
            <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Schema: {selectedSchemaName} • {selectedTable.columns.length} columns
            </Text>
          </div>
        </div>

        {/* Table note if exists */}
        {selectedTable.note && (
          <Card style={{ marginBottom: '24px' }}>
            <Text strong>Table Description:</Text>
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#595959' }}>
              {selectedTable.note}
            </div>
          </Card>
        )}

        {/* Table statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Statistic
                title="Total Columns"
                value={selectedTable.columns.length}
                prefix={<FieldNumberOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Statistic
                title="Key Columns"
                value={selectedTable.columns.filter(col =>
                  col.name.toLowerCase().includes('id') &&
                  (col.name.toLowerCase().endsWith('_id') || col.name.toLowerCase() === 'id')
                ).length}
                prefix={<span style={{ color: '#faad14' }}>🔑</span>}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Statistic
                title="Regular Fields"
                value={selectedTable.columns.filter(col =>
                  !(col.name.toLowerCase().includes('id') &&
                    (col.name.toLowerCase().endsWith('_id') || col.name.toLowerCase() === 'id'))
                ).length}
                prefix={<span style={{ color: '#52c41a' }}>●</span>}
              />
            </Card>
          </Col>
        </Row>

        {/* Columns table */}
        <Card title="Table Structure" style={{ marginBottom: '24px' }}>
          <Table
            dataSource={selectedTable.columns.map((col, index) => ({
              key: index,
              ...col
            }))}
            pagination={false}
            size="middle"
            columns={[
              {
                title: 'Column Name',
                dataIndex: 'name',
                key: 'name',
                render: (name: string) => (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {getColumnIcon('', name)}
                    <Text strong style={{ marginLeft: '8px' }}>{name}</Text>
                  </div>
                )
              },
              {
                title: 'Data Type',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => (
                  <Text code style={{
                    backgroundColor: '#f5f5f5',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'Monaco, Consolas, monospace'
                  }}>
                    {type}
                  </Text>
                )
              },
              {
                title: 'Constraints',
                key: 'constraints',
                render: (_, record) => (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {record.name.toLowerCase().includes('id') &&
                     (record.name.toLowerCase().endsWith('_id') || record.name.toLowerCase() === 'id') && (
                      <Tag color="orange" style={{ margin: 0 }}>
                        KEY
                      </Tag>
                    )}
                    {record.type.toLowerCase().includes('not null') && (
                      <Tag color="green" style={{ margin: 0 }}>
                        NOT NULL
                      </Tag>
                    )}
                    {record.type.toLowerCase().includes('unique') && (
                      <Tag color="blue" style={{ margin: 0 }}>
                        UNIQUE
                      </Tag>
                    )}
                  </div>
                )
              },
              {
                title: 'Note',
                dataIndex: 'note',
                key: 'note',
                render: (note: string) => (
                  <Text style={{
                    color: note ? '#595959' : '#bfbfbf',
                    fontStyle: note ? 'normal' : 'italic'
                  }}>
                    {note || 'No notes'}
                  </Text>
                )
              }
            ]}
          />
        </Card>
      </div>
    );
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
      <div
        className="project-info-container"
        key={language} // Force re-render on language change
        style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '4px',
        border: '1px solid #e8e8e8',
        marginBottom: '24px'
      }}>
        <Title level={2} className="project-title">{project.projectName}</Title>

        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>{t('docs.creator')}:</Text>
            <Space>
              <Avatar
                size="small"
                src={project.ownerAvatarUrl}
                icon={!project.ownerAvatarUrl ? <UserOutlined /> : undefined}
                style={{ marginRight: '8px' }}
              />
              <Text>{project.ownerEmail}</Text>
            </Space>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>{t('docs.dateCreated')}:</Text>
            <Text>{project.createdDate ? formatDate(project.createdDate) : 'N/A'}</Text>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>{t('docs.projectCode')}:</Text>
            <Text>{project.projectCode}</Text>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>{t('docs.lastUpdated')}:</Text>
            <Text>{project.modifiedDate ? formatDate(project.modifiedDate) : 'N/A'}</Text>
          </div>
          <div style={{ width: '50%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>{t('docs.version')}:</Text>
            <Text>{selectedVersion || (versions.length > 0 ? versions[0].codeVersion.toString() : 'N/A')} {versions.length > 0 ? `(${t('docs.latest')})` : ''}</Text>
          </div>
          <div style={{ width: '100%', display: 'flex', marginBottom: '16px' }}>
            <Text strong style={{ width: '120px' }}>{t('docs.description')}:</Text>
            {isEditingDescription ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Input.TextArea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  style={{ marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button size="small" onClick={toggleDescriptionEdit}>Cancel</Button>
                  <Button size="small" type="primary" onClick={saveDescription}>Save</Button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                <Text style={{ flex: 1 }}>{project.description || t('docs.noDescription')}</Text>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={toggleDescriptionEdit}
                  style={{ marginLeft: '8px' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Wiki tab content
  const renderWikiTab = () => {
    if (!project) return null;

    // If a table is selected, show table details in content
    if (selectedTable) {
      return renderTableDetailContent();
    }

    // If only schema is selected (without table), show database overview
    if (selectedSchemaName && !selectedTable) {
      return renderDatabaseOverviewContent();
    }

    return (
      <div className="wiki-container">
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>{t('docs.recentActivities')}</Text>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              {(versions.length > 0 ? versions.slice(0, 3).map(v => ({
                id: v.id,
                userId: v.createdBy || v.changeLog?.createdBy,
                codeVersion: v.codeVersion,
                createdDate: v.createdDate,
                creatorAvatarUrl: v.changeLog?.creatorAvatarUrl || '',
                creatorName: v.changeLog?.creatorName || '',
                diffChange: v.diffChange
              })) : []).map((item, index) => {
                const userInfo = item.userId ? versionCreators[item.userId] : null;

                // Log the createdDate to check its value
                console.log(`Activity ${index + 1} createdDate:`, item.createdDate, typeof item.createdDate);

                // Ưu tiên sử dụng avatar từ response trước, sau đó mới dùng từ versionCreators
                const avatarUrl = item.creatorAvatarUrl || (userInfo?.avatarUrl || '');

                // Phân tích thông tin thay đổi từ diffChange
                const changes = parseDiffChange(item.diffChange);

                // Tạo các tag hiển thị dựa trên thông tin thay đổi thực tế
                const tagElements = [];

                if (changes) {
                  // Thêm tag cho bảng được thêm (màu xanh)
                  if (changes.addedTablesCount > 0) {
                    tagElements.push(
                      <Tag key="added-tables" color="success" style={{ margin: 0 }}>
                        <TableOutlined style={{ marginRight: '4px' }} />+ {changes.addedTablesCount}
                      </Tag>
                    );
                  }

                  // Thêm tag cho bảng được sửa (màu vàng)
                  if (changes.modifiedTablesCount > 0) {
                    tagElements.push(
                      <Tag key="modified-tables" color="gold" style={{ margin: 0 }}>
                        <TableOutlined style={{ marginRight: '4px' }} />* {changes.modifiedTablesCount}
                      </Tag>
                    );
                  }

                  // Thêm tag cho bảng bị xóa (màu đỏ)
                  if (changes.removedTablesCount > 0) {
                    tagElements.push(
                      <Tag key="removed-tables" color="error" style={{ margin: 0 }}>
                        <TableOutlined style={{ marginRight: '4px' }} />− {changes.removedTablesCount}
                      </Tag>
                    );
                  }

                  // Thêm tag cho cột được thêm (màu xanh)
                  if (changes.addedColumns > 0) {
                    tagElements.push(
                      <Tag key="added-columns" color="success" style={{ margin: 0 }}>
                        <FieldNumberOutlined style={{ marginRight: '4px' }} />+ {changes.addedColumns}
                      </Tag>
                    );
                  }

                  // Thêm tag cho cột được sửa (màu vàng)
                  if (changes.modifiedColumns > 0) {
                    tagElements.push(
                      <Tag key="modified-columns" color="gold" style={{ margin: 0 }}>
                        <FieldNumberOutlined style={{ marginRight: '4px' }} />* {changes.modifiedColumns}
                      </Tag>
                    );
                  }

                  // Thêm tag cho cột bị xóa (màu đỏ)
                  if (changes.removedColumns > 0) {
                    tagElements.push(
                      <Tag key="removed-columns" color="error" style={{ margin: 0 }}>
                        <FieldNumberOutlined style={{ marginRight: '4px' }} />− {changes.removedColumns}
                      </Tag>
                    );
                  }

                  // Nếu không có thay đổi cụ thể nào được phát hiện nhưng có totalChanges
                  if (tagElements.length === 0 && changes.totalChanges > 0) {
                    tagElements.push(
                      <Tag key="total-changes" style={{ margin: 0, backgroundColor: '#f8f9fa', border: '1px solid #dfe1e5', color: '#5f6368' }}>
                        <EditOutlined style={{ marginRight: '4px' }} />{changes.totalChanges}
                      </Tag>
                    );
                  }
                }

                return (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '24px 16px',
                    borderBottom: index < 2 ? '1px solid #e8e8e8' : 'none',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginRight: '16px'
                      }}>
                        <Text strong>{index + 1}</Text>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ color: '#4285f4', marginRight: '8px', fontWeight: 500, fontSize: '14px' }}>
                            {formatDate(item.createdDate)}
                          </Text>
                          <Text strong style={{ fontSize: '14px' }}>Version {item.codeVersion}</Text>
                          <Text style={{ color: '#999', marginLeft: '8px', fontSize: '14px' }}>#{item.codeVersion}</Text>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {tagElements}
                      </div>
                      <Avatar
                        size="large"
                        src={avatarUrl}
                        icon={!avatarUrl ? <UserOutlined /> : undefined}
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    </div>
                  </div>
                );
              })}
              <div style={{ padding: '12px 0', textAlign: 'center', borderTop: '1px solid #e8e8e8' }}>
                <Button type="link" onClick={() => setActiveTab('changelog')} style={{ fontSize: '14px', color: '#4285f4' }}>
                  {t('docs.viewMore')}
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card
              className="stats-card"
              style={{ textAlign: 'center', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <TableOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Title level={2} style={{ margin: 0 }}>{tableStats.tableCount}</Title>
              </div>
              <Text className="stats-label">{t('docs.tables')}</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              className="stats-card"
              style={{ textAlign: 'center', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <FieldNumberOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Title level={2} style={{ margin: 0 }}>{tableStats.fieldCount}</Title>
              </div>
              <Text className="stats-label">{t('docs.fields')}</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              className="stats-card"
              style={{ textAlign: 'center', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <EditOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </div>
              <div style={{ marginBottom: '4px' }}>
                <Title level={2} style={{ margin: 0 }}>{tableStats.updateCount}</Title>
              </div>
              <Text className="stats-label">{t('docs.updates')}</Text>
            </Card>
          </Col>
        </Row>

        <div>
          <Row style={{
            fontWeight: 'bold',
            padding: '8px 0',
            borderBottom: '1px solid #e8e8e8'
          }}>
            <Col span={8}>{t('docs.name')}</Col>
            <Col span={8}>{t('docs.tableNotes')}</Col>
            <Col span={8}>{t('docs.lastUpdate')}</Col>
          </Row>

          {schemaStructure.flatMap(schema =>
            schema.tables.map((table, tableIndex) => {
              // Find the latest version that modified this table
              // In a real app, you would have more precise tracking of which tables were modified in each version
              const latestVersion = versions.length > 0 ? versions[0] : null;

              return (
                <Row key={`table-list-${schema.name}-${tableIndex}`} style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f6f6f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => handleTableSelect(table, schema.name)}
                >
                  <Col span={8} style={{ display: 'flex', alignItems: 'center' }}>
                    <TableOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                    {table.name}
                  </Col>
                  <Col span={8}>{table.note || ''}</Col>
                  <Col span={8} style={{ display: 'flex', alignItems: 'center' }}>
                    <ClockCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    {latestVersion?.createdDate ? formatDate(latestVersion.createdDate) :
                     (project?.modifiedDate ? formatDate(project.modifiedDate) : 'N/A')}
                  </Col>
                </Row>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (dbmlEditorRef.current && dbmlEditorRef.current.zoomIn) {
      dbmlEditorRef.current.zoomIn();
      setZoomLevel(prev => Math.min(prev + 20, 200));
    }
  };

  const handleZoomOut = () => {
    if (dbmlEditorRef.current && dbmlEditorRef.current.zoomOut) {
      dbmlEditorRef.current.zoomOut();
      setZoomLevel(prev => Math.max(prev - 20, 40));
    }
  };

  const handleFitToView = () => {
    if (dbmlEditorRef.current && dbmlEditorRef.current.fitToView) {
      dbmlEditorRef.current.fitToView();
      setZoomLevel(100);
    }
  };

  // Diagram tab content
  const renderDiagramTab = () => {
    if (!project) return null;

    return (
      <div style={{ height: 'calc(100% - 16px)', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
          <Text style={{ marginRight: '4px', fontSize: '13px' }}>
            <Text strong>{project?.creatorName}</Text>/<Text strong>{project?.projectName}</Text>
          </Text>

          {/* Zoom controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              type="text"
              icon={<ZoomOutOutlined />}
              size="small"
              title="Zoom out"
              onClick={handleZoomOut}
            />
            <Text style={{ margin: '0 4px' }}>{zoomLevel}%</Text>
            <Button
              type="text"
              icon={<ZoomInOutlined />}
              size="small"
              title="Zoom in"
              onClick={handleZoomIn}
            />
            <Button
              type="text"
              icon={<FullscreenOutlined />}
              size="small"
              title="Fit to view"
              onClick={handleFitToView}
            />
          </div>
        </div>

        <div style={{
          flex: 1,
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
          height: 'calc(100vh - 200px)',
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <DbmlEditor
            ref={dbmlEditorRef}
            readOnly={true}
            initialValue={currentDbmlContent}
            projectId={projectId || ''}
            showDiagramOnly={true}
            height="100%"
          />
        </div>
      </div>
    );
  };

  // Add global CSS for hover effect
  const getGlobalStyle = () => {
    return (
      <style dangerouslySetInnerHTML={{
        __html: `
          .version-item:hover .view-code-change-btn {
            display: inline-flex !important;
          }
        `
      }} />
    );
  };

  // Changelog tab content
  const renderChangelogTab = () => {
    if (changelogLoading) return <Spin />;

    // Use real versions or empty array
    const emptyVersions: VersionInfo[] = [];

    return (
      <div className="changelog-container" style={{ padding: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Text style={{ marginRight: '4px', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            <Text strong style={{ fontFamily: 'Inter, sans-serif' }}>{project?.creatorName}</Text>/<Text strong style={{ fontFamily: 'Inter, sans-serif' }}>{project?.projectName}</Text>
          </Text>
        </div>

        <Card title="Version History" style={{ marginBottom: '24px' }}>
          <List
            itemLayout="horizontal"
            dataSource={versions.length > 0 ? versions : emptyVersions}
            renderItem={(item, index) => {
              const userId = item.createdBy || item.changeLog?.createdBy;
              const userInfo = userId ? versionCreators[userId] : null;

              // Ưu tiên sử dụng avatar từ response trước, sau đó mới dùng từ versionCreators
              const avatarUrl = item.changeLog?.creatorAvatarUrl || (userInfo?.avatarUrl || '');

              // Phân tích thông tin thay đổi từ diffChange
              const changes = parseDiffChange(item.diffChange);

              // Tạo các tag hiển thị dựa trên thông tin thay đổi thực tế
              const tagElements = [];

              if (changes) {
                // Thêm tag cho bảng được thêm (màu xanh)
                if (changes.addedTablesCount > 0) {
                  tagElements.push(
                    <Tag key="added-tables" color="success" style={{ margin: 0 }}>
                      <TableOutlined style={{ marginRight: '4px' }} />+ {changes.addedTablesCount}
                    </Tag>
                  );
                }

                // Thêm tag cho bảng được sửa (màu vàng)
                if (changes.modifiedTablesCount > 0) {
                  tagElements.push(
                    <Tag key="modified-tables" color="gold" style={{ margin: 0 }}>
                      <TableOutlined style={{ marginRight: '4px' }} />* {changes.modifiedTablesCount}
                    </Tag>
                  );
                }

                // Thêm tag cho bảng bị xóa (màu đỏ)
                if (changes.removedTablesCount > 0) {
                  tagElements.push(
                    <Tag key="removed-tables" color="error" style={{ margin: 0 }}>
                      <TableOutlined style={{ marginRight: '4px' }} />− {changes.removedTablesCount}
                    </Tag>
                  );
                }

                // Thêm tag cho cột được thêm (màu xanh)
                if (changes.addedColumns > 0) {
                  tagElements.push(
                    <Tag key="added-columns" color="success" style={{ margin: 0 }}>
                      <FieldNumberOutlined style={{ marginRight: '4px' }} />+ {changes.addedColumns}
                    </Tag>
                  );
                }

                // Thêm tag cho cột được sửa (màu vàng)
                if (changes.modifiedColumns > 0) {
                  tagElements.push(
                    <Tag key="modified-columns" color="gold" style={{ margin: 0 }}>
                      <FieldNumberOutlined style={{ marginRight: '4px' }} />* {changes.modifiedColumns}
                    </Tag>
                  );
                }

                // Thêm tag cho cột bị xóa (màu đỏ)
                if (changes.removedColumns > 0) {
                  tagElements.push(
                    <Tag key="removed-columns" color="error" style={{ margin: 0 }}>
                      <FieldNumberOutlined style={{ marginRight: '4px' }} />− {changes.removedColumns}
                    </Tag>
                  );
                }

                // Nếu không có thay đổi cụ thể nào được phát hiện nhưng có totalChanges
                if (tagElements.length === 0 && changes.totalChanges > 0) {
                  tagElements.push(
                    <Tag key="total-changes" style={{ margin: 0, backgroundColor: '#f8f9fa', border: '1px solid #dfe1e5', color: '#5f6368' }}>
                      <EditOutlined style={{ marginRight: '4px' }} />{changes.totalChanges}
                    </Tag>
                  );
                }
              }

              return (
                <List.Item
                  style={{ position: 'relative' }}
                  className="version-item"
                >
                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                    className="version-item-content"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginRight: '16px'
                      }}>
                        <Text strong>{index + 1}</Text>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ color: '#4285f4', marginRight: '8px', fontWeight: 500, fontSize: '14px' }}>
                            {formatDate(item.createdDate)}
                          </Text>
                          <Text strong style={{ fontSize: '14px' }}>Version {item.codeVersion}</Text>
                          <Text style={{ color: '#999', marginLeft: '8px', fontSize: '14px' }}>#{item.codeVersion}</Text>
                          {index === 0 && <Tag color="red" style={{ marginLeft: '8px' }}>LATEST</Tag>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {tagElements}
                      </div>
                      <div style={{ position: 'relative' }} className="view-code-change-container">
                        {/* "View code change" button that appears on hover */}
                        <Button
                          type="primary"
                          ghost
                          icon={<DiffOutlined />}
                          size="small"
                          className="view-code-change-btn"
                          style={{
                            position: 'absolute',
                            right: '50px',
                            top: '0',
                            display: 'none',
                          }}
                        >
                          <Link to={`/projects/${projectId}/compare/${item.id}`}>View code change</Link>
                        </Button>
                      </div>
                      <Avatar
                        size="large"
                        src={avatarUrl}
                        icon={!avatarUrl ? <UserOutlined /> : undefined}
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        </Card>

        {/* Add global CSS styles */}
        {getGlobalStyle()}
      </div>
    );
  };

  // Helper function to get column icon based on type
  const getColumnIcon = (columnType: string, columnName: string) => {
    const name = columnName.toLowerCase();

    // Primary key detection
    if (name.includes('id') && (name.endsWith('_id') || name === 'id')) {
      return <span style={{ color: '#faad14', fontSize: '10px' }}>🔑</span>;
    }

    // Default icon for regular fields - unified design
    return <span style={{ color: '#52c41a', fontSize: '10px' }}>●</span>;
  };

  // Render table detail view
  const renderTableDetail = () => {
    if (!selectedTable) return null;

    return (
      <div className="sidebar-content" style={{
        padding: '0',
        height: 'calc(100vh - 112px)',
        overflow: 'auto',
        backgroundColor: '#fafafa',
        borderRight: '1px solid #e8e8e8'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 12px 12px 12px',
          borderBottom: '1px solid #e8e8e8',
          backgroundColor: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              size="small"
              onClick={handleBackToDatabaseView}
              style={{
                marginRight: '8px',
                color: '#1890ff'
              }}
            />
            <TableOutlined style={{
              marginRight: '8px',
              color: '#1890ff',
              fontSize: '14px'
            }} />
            <Text strong style={{
              fontSize: '13px',
              color: '#262626'
            }}>
              {t('docs.tableDetail')}
            </Text>
          </div>

          {/* Table name and schema */}
          <div style={{ marginBottom: '8px' }}>
            <Text strong style={{
              fontSize: '14px',
              color: '#262626',
              display: 'block'
            }}>
              {selectedTable.name}
            </Text>
            <Text style={{
              fontSize: '11px',
              color: '#8c8c8c'
            }}>
              Schema: {selectedSchemaName}
            </Text>
          </div>

          {/* Table note if exists */}
          {selectedTable.note && (
            <div style={{
              backgroundColor: '#f6f8fa',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '8px',
              fontSize: '11px',
              color: '#586069'
            }}>
              <Text italic>{selectedTable.note}</Text>
            </div>
          )}

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '12px',
            fontSize: '11px',
            color: '#8c8c8c'
          }}>
            <span>
              <FieldNumberOutlined style={{ marginRight: '4px' }} />
              {selectedTable.columns.length} {t('docs.columns')}
            </span>
          </div>
        </div>

        {/* Columns Content */}
        <div style={{ padding: '8px 0' }}>
          {selectedTable.columns.map((column, index) => (
            <div
              key={`column-${index}`}
              style={{
                padding: '8px 12px',
                margin: '2px 4px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #f0f0f0',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f6f6f6';
                e.currentTarget.style.borderColor = '#d9d9d9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                {getColumnIcon(column.type, column.name)}
                <Text strong style={{
                  fontSize: '12px',
                  marginLeft: '8px',
                  color: '#262626',
                  flex: 1
                }}>
                  {column.name}
                </Text>
                <Text style={{
                  fontSize: '10px',
                  color: '#8c8c8c',
                  backgroundColor: '#f5f5f5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'Monaco, Consolas, monospace'
                }}>
                  {column.type}
                </Text>
              </div>

              {/* Column constraints/info */}
              <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap'
              }}>
                {column.name.toLowerCase().includes('id') && (
                  <span style={{
                    fontSize: '9px',
                    backgroundColor: '#fff7e6',
                    color: '#fa8c16',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    border: '1px solid #ffd591'
                  }}>
                    KEY
                  </span>
                )}

                {/* Add more constraint tags as needed */}
                {column.type.toLowerCase().includes('not null') && (
                  <span style={{
                    fontSize: '9px',
                    backgroundColor: '#f6ffed',
                    color: '#52c41a',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    border: '1px solid #b7eb8f'
                  }}>
                    NOT NULL
                  </span>
                )}
              </div>

              {/* Column note if exists */}
              {column.note && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '10px',
                  color: '#8c8c8c',
                  fontStyle: 'italic'
                }}>
                  {column.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the sidebar with schema and table structure
  const renderSidebar = () => {
    return (
      <div className="sidebar-content" style={{
        padding: '0',
        height: 'calc(100vh - 112px)',
        overflow: 'auto',
        backgroundColor: '#fafafa',
        borderRight: '1px solid #e8e8e8'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 12px 12px 12px',
          borderBottom: '1px solid #e8e8e8',
          backgroundColor: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10
      }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <ApartmentOutlined style={{
              marginRight: '8px',
              color: '#1890ff',
              fontSize: '14px'
            }} />
            <Text strong style={{
              fontSize: '13px',
              color: '#262626'
            }}>
              {t('docs.databaseSchema')}
            </Text>
          </div>

          <Input
            placeholder={t('docs.searchTables')}
            style={{
              marginBottom: '8px',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '12px',
            fontSize: '11px',
            color: '#8c8c8c'
          }}>
            <span>
              <TableOutlined style={{ marginRight: '4px' }} />
              {tableStats.tableCount} {t('docs.tables')}
            </span>
            <span>
              <FieldNumberOutlined style={{ marginRight: '4px' }} />
              {tableStats.fieldCount} {t('docs.fields')}
            </span>
          </div>
        </div>

        {/* Schema Content */}
        <div style={{ padding: '8px 0' }}>
          {filteredSchemaStructure.length === 0 ? (
            <div style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: '#8c8c8c',
              fontSize: '12px'
            }}>
              <FileOutlined style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }} />
              {t('docs.noTablesFound')}
            </div>
          ) : (
            filteredSchemaStructure.map((schema, schemaIndex) => (
              <div key={`schema-${schemaIndex}`} style={{ marginBottom: '8px' }}>
                {/* Schema Header */}
              <div
                style={{
                    padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                    backgroundColor: selectedSchemaName === schema.name && !selectedTable ? '#e6f7ff' : '#fff',
                    borderLeft: '3px solid #1890ff',
                    margin: '0 4px',
                    borderRadius: '0 4px 4px 0',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f6f6f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selectedSchemaName === schema.name && !selectedTable ? '#e6f7ff' : '#fff';
                  }}
              >
                  <div
                  style={{
                      marginRight: '8px',
                      fontSize: '10px',
                      color: '#1890ff',
                    transform: schema.isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer',
                      display: 'inline-block'
                  }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSchemaExpansion(schemaIndex);
                    }}
                  >
                    <CaretDownOutlined />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSchemaSelect(schema.name)}
                  >
                    <DatabaseOutlined style={{
                      marginRight: '6px',
                      color: '#1890ff',
                      fontSize: '12px'
                    }} />
                    <Text strong style={{
                      fontSize: '12px',
                      color: '#262626'
                    }}>
                      {schema.name}(dbdocs)
                    </Text>
                  </div>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    color: '#8c8c8c',
                    backgroundColor: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: '8px'
                  }}>
                    {schema.tables.length}
                  </span>
              </div>

                                {/* Tables */}
              {schema.isExpanded && schema.tables.map((table, tableIndex) => (
                  <div key={`table-${schemaIndex}-${tableIndex}`} style={{ marginLeft: '8px' }}>
                  <Tooltip title={table.note || `Table: ${table.name}`} placement="right">
                    <div
                      style={{
                          padding: '6px 12px',
                          paddingLeft: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: searchTerm && table.name.toLowerCase().includes(searchTerm.toLowerCase())
                          ? '#e6f7ff'
                            : (selectedTable && selectedTable.name === table.name ? '#e6f7ff' : '#fff'),
                          borderLeft: '2px solid #52c41a',
                          margin: '2px 4px 2px 12px',
                          borderRadius: '0 4px 4px 0',
                          transition: 'all 0.2s ease',
                          fontSize: '12px'
                      }}
                        onMouseEnter={(e) => {
                          if (!searchTerm || !table.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                            e.currentTarget.style.backgroundColor = '#f6f6f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!searchTerm || !table.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                            e.currentTarget.style.backgroundColor = selectedTable && selectedTable.name === table.name ? '#e6f7ff' : '#fff';
                          }
                        }}
                      >
                        <div
                        style={{
                          marginRight: '6px',
                          fontSize: '9px',
                            color: '#52c41a',
                          transform: table.isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer',
                            display: 'inline-block'
                        }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTableExpansion(schemaIndex, tableIndex);
                          }}
                        >
                          <CaretDownOutlined />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            flex: 1,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleTableSelect(table, schema.name)}
                        >
                          <TableOutlined style={{
                            marginRight: '6px',
                            color: '#52c41a',
                            fontSize: '11px'
                          }} />
                          <Text strong style={{
                            fontSize: '11px',
                            color: '#262626',
                            flex: 1
                          }}>
                            {table.name}
                          </Text>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          color: '#8c8c8c',
                          backgroundColor: '#f0f0f0',
                          padding: '1px 4px',
                          borderRadius: '6px'
                        }}>
                          {table.columns.length}
                        </span>
                    </div>
                  </Tooltip>

                    {/* Columns */}
                  {table.isExpanded && table.columns.map((column, columnIndex) => (
                    <Tooltip
                      key={`column-${schemaIndex}-${tableIndex}-${columnIndex}`}
                      title={
                          <div style={{ fontSize: '11px' }}>
                          <div><strong>Name:</strong> {column.name}</div>
                          <div><strong>Type:</strong> {column.type}</div>
                          {column.note && <div><strong>Note:</strong> {column.note}</div>}
                        </div>
                      }
                      placement="right"
                    >
                      <div
                        style={{
                            padding: '4px 12px',
                            paddingLeft: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: searchTerm && column.name.toLowerCase().includes(searchTerm.toLowerCase())
                            ? '#e6f7ff'
                              : 'transparent',
                            margin: '1px 4px 1px 20px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s ease',
                            cursor: 'default'
                          }}
                          onMouseEnter={(e) => {
                            if (!searchTerm || !column.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                              e.currentTarget.style.backgroundColor = '#f9f9f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!searchTerm || !column.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {getColumnIcon(column.type, column.name)}
                          <Text style={{
                            fontSize: '11px',
                            marginLeft: '6px',
                            color: '#595959',
                            flex: 1
                          }}>
                            {column.name}
                          </Text>
                          <Text style={{
                            fontSize: '10px',
                            color: '#8c8c8c',
                            backgroundColor: '#f5f5f5',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            fontFamily: 'Monaco, Consolas, monospace'
                          }}>
                            {column.type}
                          </Text>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Phân tích thông tin thay đổi từ diffChange
  const parseDiffChange = (diffChange: string) => {
    try {
      if (!diffChange) return null;

      // Parse diffChange JSON
      const diffObj = JSON.parse(diffChange);

      // Parse diffChanges string inside diffObj
      if (diffObj.diffChanges) {
        const diffChanges = JSON.parse(diffObj.diffChanges);

        // Phân tích chi tiết về thay đổi cột
        let addedColumns = 0;
        let modifiedColumns = 0;
        let removedColumns = 0;

        if (diffChanges.tableChanges) {
          // Duyệt qua từng bảng có thay đổi
          Object.keys(diffChanges.tableChanges).forEach(tableId => {
            const tableChanges = diffChanges.tableChanges[tableId];

            // Duyệt qua từng thay đổi trong bảng
            tableChanges.forEach((change: any) => {
              // Kiểm tra loại thay đổi
              if (change.property === 'columns') {
                // Thay đổi liên quan đến cột
                if (change.added) {
                  addedColumns += change.added.length;
                }
                if (change.removed) {
                  removedColumns += change.removed.length;
                }
                if (change.modified) {
                  modifiedColumns += Object.keys(change.modified).length;
                }
              } else if (change.property === 'name' || change.property === 'dataType') {
                // Thay đổi tên hoặc kiểu dữ liệu của cột
                modifiedColumns++;
              }
            });
          });
        }

        return {
          totalChanges: diffChanges.totalChanges || 0,
          addedTables: diffChanges.addedTables || [],
          removedTables: diffChanges.removedTables || [],
          addedTablesCount: diffChanges.addedTables?.length || 0,
          removedTablesCount: diffChanges.removedTables?.length || 0,
          modifiedTablesCount: diffChanges.tableChanges ? Object.keys(diffChanges.tableChanges).length : 0,
          valueChangesCount: diffChanges.valueChangesCount || 0,
          listChangesCount: diffChanges.listChangesCount || 0,
          addedColumns,
          modifiedColumns,
          removedColumns
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing diffChange:', error);
      return null;
    }
  };

  // Handle description edit mode toggle
  const toggleDescriptionEdit = () => {
    if (!isEditingDescription) {
      // Enter edit mode
      setEditedDescription(project?.description || '');
      setIsEditingDescription(true);
    } else {
      // Exit edit mode without saving
      setIsEditingDescription(false);
    }
  };

  // Save edited description
  const saveDescription = async () => {
    if (!project) return;

    try {
      // Here you would typically call an API to update the description
      // For now, we'll just update the local state
      setProject({
        ...project,
        description: editedDescription
      });

      // Exit edit mode
      setIsEditingDescription(false);

      message.success('Description updated successfully');
    } catch (error) {
      console.error('Error updating description:', error);
      message.error('Failed to update description');
    }
  };

  // Function to handle opening the code comparison modal
  const handleViewCodeChange = (version: VersionInfo, index: number) => {
    setSelectedVersionForCompare(version);

    // Get previous version if available
    if (index < versions.length - 1) {
      setPreviousVersion(versions[index + 1]);
    } else {
      // If this is the oldest version, there's no previous version to compare with
      setPreviousVersion(null);
    }

    setIsCompareModalVisible(true);

    // Generate diff if both versions are available
    if (version && index < versions.length - 1) {
      const currentContent = version.content || '';
      const prevContent = versions[index + 1].content || '';
      generateDiff(prevContent, currentContent);
    }
  };

  // Function to calculate diff between two versions
  const generateDiff = (oldContent: string, newContent: string) => {
    const diffResult = diff.createPatch(
      "dbml_changes",
      oldContent,
      newContent,
      "Previous Version",
      "Current Version"
    );
    setDiffResult(diffResult);
  };

  // Function to close the compare modal
  const handleCloseCompareModal = () => {
    setIsCompareModalVisible(false);
    setSelectedVersionForCompare(null);
    setPreviousVersion(null);
  };

  // Add this function to handle the initialization of project sharing
  const initializeProjectSharing = () => {
    // Reset all share-related states
    setShareType(1);
    setSharePassword('');
    setSharedLink('');
    setShowPasswordField(false);
    // Show the modal
    setShareModalVisible(true);
  };

  // Add this function to handle share type selection
  const handleShareTypeChange = (value: number) => {
    setShareType(value);
    setShowPasswordField(value === 3); // Show password field only for protected sharing
  };

  // Add this function to handle the sharing process
  const handleShareProject = async () => {
    if (!project) return;

    setShareLoading(true);
    try {
      const token = localStorage.getItem('dbdocs_token');
      const payload: ShareFormValues = {
        shareType,
        passwordShare: showPasswordField ? sharePassword : null
      };

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/v1/projects/sharing/${project.projectId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.linkDocs) {
        // Use the exact link returned by the API
        setSharedLink(response.data.linkDocs);
        message.success('Project shared successfully');
      } else {
        message.error('Failed to generate sharing link');
      }
    } catch (error) {
      console.error('Error sharing project:', error);
      message.error('Failed to share project');
    } finally {
      setShareLoading(false);
    }
  };

  // Add this function to copy the shared link to clipboard
  const copySharedLink = () => {
    navigator.clipboard.writeText(sharedLink)
      .then(() => {
        message.success('Link copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        message.error('Failed to copy link to clipboard');
      });
  };

  // Add this function to handle shared project access
  const handleSharedProjectAccess = async (projectId: string, shareType: number, password: string | null = null) => {
    try {
      const response = await axios.post(
                  `${API_CONFIG.BASE_URL}/api/v1/projects/shared/${projectId}`,
        {
            passwordShare: password || ""
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('dbdocs_token')}`
          }
        }
      );

      // Process project data similar to fetchProjectDetails
      if (response.data) {
        setProject(response.data);
        if (response.data.dbmlContent) {
          setCurrentDbmlContent(response.data.dbmlContent);
          parseDbmlContent(response.data.dbmlContent);
          calculateStats(response.data.dbmlContent);
        }
      }
    } catch (error: any) {
      console.error('Error accessing shared project:', error);

      if (error.response?.status === 403) {
        if (shareType === 3) {
          // If password protected and access denied, show password modal again
          message.error('Incorrect password');
          setPasswordModalVisible(true);
        } else {
          // For other types, just show access denied
          message.error('You do not have permission to access this project');
          navigate('/');
        }
      } else {
        message.error('Failed to load project');
        navigate('/');
      }
    }
  };

  // Add this function to handle password submission for shared projects
  const handlePasswordSubmit = () => {
    if (passwordInput.trim()) {
      handleSharedProjectAccess(sharedProjectId, sharedProjectType, passwordInput);
      setPasswordModalVisible(false);
    } else {
      message.warning('Please enter a password');
    }
  };

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
    <Layout className="documentation-page" style={{ minHeight: '100vh' }}>
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
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ marginRight: '12px' }}
          />
          <div
            className="header-logo"
            style={{
              marginRight: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => navigate('/')}
          >
            <Logo variant="icon" width={80} height={32} />
          </div>
          <div>
            <Text strong style={{ fontSize: '16px', marginRight: '10px', display: 'block', fontFamily: 'Inter, sans-serif' }}>{project?.projectName || 'Project 1'}</Text>
            <Text style={{ fontSize: '12px', color: '#888', display: 'block', fontFamily: 'Inter, sans-serif' }}>Code: {project?.projectCode || 'PRJ001'}</Text>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<ShareAltOutlined />}
            onClick={initializeProjectSharing}
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
          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <UserOutlined />, label: t('homepage.profile') },
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: t('homepage.settings'),
                  children: [
                    {
                      key: 'theme',
                      icon: theme === 'light' ? <MoonOutlined /> : <SunOutlined />,
                      label: theme === 'light' ? t('homepage.darkMode') : t('homepage.lightMode'),
                      onClick: toggleTheme
                    },
                    {
                      key: 'language',
                      icon: <GlobalOutlined />,
                      label: language === 'en' ? t('homepage.vietnamese') : t('homepage.english'),
                      onClick: toggleLanguage
                    }
                  ]
                },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: t('homepage.logout'), danger: true }
              ]
            }}
            trigger={['click']}
          >
          <Avatar
              src={creatorInfo?.avatarUrl}
            style={{ cursor: 'pointer' }}
          />
          </Dropdown>
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
                  {t('docs.wiki')}
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
                  {t('docs.diagram')}
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
                  {t('docs.changelog')}
                </div>
              )
            }
          ]}
          key={language} // Force re-render on language change
        />
      </div>

      <Layout style={{ background: '#fff', display: 'flex', flexDirection: 'row' }}>
        {/* Sidebar with schema and table structure */}
        <div style={{
          width: '260px',
          minWidth: '260px',
          height: 'calc(100vh - 112px)',
          overflow: 'hidden'
        }}>
          {renderSidebar()}
        </div>

        {/* Main content */}
        <Content style={{ height: 'calc(100vh - 112px)', overflow: 'auto', padding: '16px', flex: 1 }}>
          {activeTab === 'wiki' &&
            <div>
              <div className="project-breadcrumb" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <Text style={{ marginRight: '4px' }}>
                  <Text strong>{project?.ownerEmail || 'unknown'}</Text>/<Text strong>{project?.projectCode || 'Project'}</Text>
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

      {/* Use the new CodeCompareModal component */}
      <CodeCompareModal
        isVisible={isCompareModalVisible}
        onClose={handleCloseCompareModal}
        currentVersion={selectedVersionForCompare}
        previousVersion={previousVersion}
        diffResult={diffResult}
      />

      {/* Share Project Modal */}
      <Modal
        title="Share Project"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Share Type:</Text>
            <Select
              value={shareType}
              onChange={handleShareTypeChange}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value={1}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GlobalOutlined style={{ marginRight: 8 }} />
                  Public (Anyone with the link can view)
                </div>
              </Option>
              <Option value={2}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  Private (Only specific users can view)
                </div>
              </Option>
              <Option value={3}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <LockOutlined style={{ marginRight: 8 }} />
                  Password Protected
                </div>
              </Option>
            </Select>
          </div>

          {showPasswordField && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>Password:</Text>
              <Input.Password
                placeholder="Enter password for protection"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          {sharedLink ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Share Link:</Text>
                <Input
                  value={sharedLink}
                  readOnly
                  addonAfter={
                    <CopyOutlined
                      onClick={copySharedLink}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  style={{ marginTop: 8 }}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <Button onClick={() => setShareModalVisible(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setShareModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleShareProject}
                loading={shareLoading}
                disabled={showPasswordField && !sharePassword}
              >
                Share
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Password Input Modal for Shared Projects */}
      <Modal
        title="Password Required"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          navigate('/');
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setPasswordModalVisible(false);
              navigate('/');
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={shareLoading}
            onClick={handlePasswordSubmit}
          >
            Submit
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>This project is password protected. Please enter the password to continue:</Text>
          <Input.Password
            placeholder="Enter password"
            style={{ marginTop: 16 }}
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onPressEnter={handlePasswordSubmit}
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default DocumentationPage;
