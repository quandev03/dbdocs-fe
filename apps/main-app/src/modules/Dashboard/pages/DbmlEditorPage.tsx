import React, { useState, useEffect, useCallback } from 'react';
import { Button, Layout, Space, Typography, Spin, message, Alert, Modal, Select, Dropdown, Menu, Drawer, List, Avatar, Tag, Tooltip, Radio, Input, Form, Divider, Popover, Empty } from 'antd';
import {
  DownloadOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  ImportOutlined,
  ExportOutlined,
  CloudUploadOutlined,
  DownOutlined,
  RollbackOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  UserAddOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  BookOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/apiService';
import { DbmlEditor } from '../components/DbmlEditor';
import { checkProjectPermission, PermissionLevel, getPermissionText } from '../services/projectAccess.service';
import { getProjectVersions, VersionInfo } from '../services/changelog.service';
import useWindowSize from '../../../hooks/useWindowSize';
import moment from 'moment';
import Logo from '../../../components/common/Logo';
import SettingsPopup from '../../../components/SettingsPopup';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import './EditorPage.css';
import { API_CONFIG } from '../../../config';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;

// ... (Toàn bộ các interface và enum giữ nguyên) ...
// Define the project data interface
interface ProjectData {
  projectId: string;
  projectCode: string;
  dbmlContent?: string;
  description?: string;
  visibility?: number;
}

// Define API response interface
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Define Changelog interface
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

// Enum for database dialects
enum DatabaseDialect {
  MySQL = 1,
  MariaDB = 2,
  PostgreSQL = 3,
  OracleDB = 4,
  SQLServer = 5
}

// Interface for DDL generation response
interface DDLResponse {
  projectId: string;
  fromVersion?: number | null;
  toVersion?: number;
  dialect: number;
  ddlScript: string;
}

// Interface for version creation response
interface VersionResponse {
  id: string;
  projectId: string;
  codeVersion: number;
  changeLogId: string;
  diffChange: string;
  changeLog: ChangelogItem;
  content: string;
  createdDate: string;
  createdBy: string;
}

// Enum for export action
enum ExportAction {
  Download = 'download',
  Copy = 'copy'
}

// Interface for share form
interface ShareFormValues {
  recipient: string;
  permission: PermissionLevel.EDIT | PermissionLevel.VIEW;
}

// Interface for project access response
interface ProjectAccessResponse {
  id: string;
  projectId: string;
  identifier: string;
  permission: number;
  userEmail: string;
  userName: string;
  avatarUrl: string;
  createdDate: string;
  createdBy: string;
}

// Use ProjectAccessResponse directly instead of an empty interface
type ProjectAccessItem = ProjectAccessResponse;

export const DbmlEditorPage: React.FC = () => {
  const [dbmlCode, setDbmlCode] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [projectCode, setProjectCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [permissionLevel, setPermissionLevel] = useState<number | null>(null);
  const [permissionChecked, setPermissionChecked] = useState<boolean>(false);
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState<boolean>(true);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState<boolean>(false);
  const [changelogs, setChangelogs] = useState<ChangelogItem[]>([]);
  const [changelogLoading, setChangelogLoading] = useState<boolean>(false);
  const [currentChangelogCode, setCurrentChangelogCode] = useState<string>('');
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [pendingDbmlChange, setPendingDbmlChange] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);
  const [selectedChangelog, setSelectedChangelog] = useState<ChangelogItem | null>(null);
  const [exportDDLModalVisible, setExportDDLModalVisible] = useState<boolean>(false);
  const [selectedDialect, setSelectedDialect] = useState<DatabaseDialect>(DatabaseDialect.MySQL);
  const [generatingDDL, setGeneratingDDL] = useState<boolean>(false);
  const [exportAction, setExportAction] = useState<ExportAction>(ExportAction.Download);
  const [generatedDDL, setGeneratedDDL] = useState<string>('');
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [inviting, setInviting] = useState<boolean>(false);
  const [form] = Form.useForm<ShareFormValues>();
  const [projectAccesses, setProjectAccesses] = useState<ProjectAccessItem[]>([]);
  const [loadingAccesses, setLoadingAccesses] = useState<boolean>(false);
  const [editAccessId, setEditAccessId] = useState<string | null>(null);
  const [editPermission, setEditPermission] = useState<number>(1);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [selectedAccess, setSelectedAccess] = useState<ProjectAccessItem | null>(null);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const [publishingToDbdocs, setPublishingToDbdocs] = useState<boolean>(false);
  const [publishSuccessModalVisible, setPublishSuccessModalVisible] = useState<boolean>(false);
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [visibility, setVisibility] = useState<number>(1); // 1: Public, 2: Private , 3. Protected password

  // Validation state
  const [isDbmlValid, setIsDbmlValid] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Determine if we should show text labels based on screen width
  const showLabels = width > 1100;

  useEffect(() => {
    if (projectId) {
      checkPermissionAndFetchData();
    }
  }, [projectId]);

  // Hiển thị thông báo quyền trong 3 giây
  useEffect(() => {
    if (permissionLevel !== null) {
      setShowPermissionAlert(true);
      const timer = setTimeout(() => {
        setShowPermissionAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [permissionLevel]);

  // Kiểm tra quyền và tải dữ liệu ban đầu
  const checkPermissionAndFetchData = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      // Kiểm tra quyền truy cập
      const permissionResponse = await checkProjectPermission(projectId);
      console.log("Permission check response:", permissionResponse);
      setPermissionLevel(permissionResponse.permissionLevel);
      setPermissionChecked(true);

      // Nếu không có quyền truy cập, không cần tải dữ liệu dự án
      if (permissionResponse.permissionLevel === PermissionLevel.DENIED) {
        setLoading(false);
        return;
      }

      // Nếu có quyền truy cập, tải dữ liệu dự án, changelog và version
      await Promise.all([
        fetchProjectData(),
        fetchChangelogs(),
        fetchVersions()
      ]);
    } catch (error) {
      console.error('Error checking permission:', error);
      message.error('Failed to check project access');
      setLoading(false);
    }
  };

  // Tải thông tin cơ bản của dự án
  const fetchProjectData = async () => {
    if (!projectId) return;

    try {
      // Replace with your actual API endpoint
      const response = await apiService.get<ApiResponse<ProjectData>>(`/api/v1/projects/${projectId}`);

      const projectData = response.data;
      if (projectData) {
        setProjectName(projectData.projectCode || 'Untitled Project');
        setProjectCode(projectData.projectCode || '');
        setVisibility(projectData.visibility || 1)
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      message.error('Failed to load project data');
    }
  };

  // Tải danh sách phiên bản
  const fetchVersions = async () => {
    if (!projectId) return;

    try {
      const versionsList = await getProjectVersions(projectId);
      setVersions(versionsList);
      if (currentVersion) {
        const existingVersion = versionsList.find(v => v.id === currentVersion);
        if (!existingVersion && versionsList.length > 0) {
          setCurrentVersion(versionsList[0].id);
          setDbmlCode(versionsList[0].content);
          setCurrentChangelogCode('');
          setHasChanges(false);
        }
      }
      else if (versionsList.length > 0 && !currentChangelogCode) {
        setCurrentVersion(versionsList[0].id);
        setDbmlCode(versionsList[0].content);
        setHasChanges(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching versions:', error);
      message.error('Failed to load version history');
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(dbmlCode);
    message.success('DBML code copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([dbmlCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'diagram'}.dbml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!projectId) return;

    setLoading(true);
    try {

      // Tạo changelog mới
      await apiService.post('/api/v1/changelogs', {
        projectId: projectId,
        content: dbmlCode
      });

      message.success('Project saved successfully and new changelog created');
      setHasChanges(false);

      // Xóa thông tin version đã chọn để hiển thị changelog mới nhất
      setCurrentVersion('');

      // Refresh version history và changelog sau khi lưu
      await Promise.all([
        fetchVersions(),
        fetchChangelogs()
      ]);
    } catch (error) {
      console.error('Error saving project:', error);
      message.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Debounce onChange for better performance
  const handleDbmlChange = useCallback(
    (newCode: string) => {
    setDbmlCode(newCode);
    setHasChanges(true);
    },
    [] // No dependencies needed for simple setState
  );

  // Handle DBML validation changes
  const handleValidationChange = useCallback(
    (isValid: boolean, errors: string[]) => {
      setIsDbmlValid(isValid);
      setValidationErrors(errors);
    },
    []
  );

  // Xử lý khi người dùng muốn quay về một changelog
  const handleApplyChangelog = (changelog: ChangelogItem) => {
    // Không cần xác nhận nếu đang ở changelog này
    if (changelog.codeChangeLog === currentChangelogCode) {
      return;
    }

    // Lưu changelog được chọn và hiển thị popup xác nhận
    setSelectedChangelog(changelog);
    setConfirmModalVisible(true);
  };

  // Xác nhận quay về changelog
  const confirmChangelogRevert = () => {
    if (selectedChangelog) {
      setDbmlCode(selectedChangelog.content);
      setCurrentChangelogCode(selectedChangelog.codeChangeLog);
      setHasChanges(false);
      message.success(`Reverted to v${selectedChangelog.codeChangeLog}`);
      setHistoryDrawerVisible(false);

      // Khi quay về một changelog, xóa thông tin về version đã chọn
      setCurrentVersion('');
    }
    setConfirmModalVisible(false);
    setSelectedChangelog(null);
  };

  // Hủy quay về changelog
  const cancelChangelogRevert = () => {
    setSelectedChangelog(null);
    setConfirmModalVisible(false);
  };

  // Xử lý khi chọn version
  const handleVersionChange = async (versionId: string) => {
    // Nếu có thay đổi chưa lưu, hiển thị xác nhận
    if (hasChanges) {
      confirm({
        title: 'Unsaved Changes',
        icon: <ExclamationCircleOutlined />,
        content: 'You have unsaved changes. Switching versions will discard these changes. Do you want to continue?',
        onOk: async () => {
          await loadVersionContent(versionId);
        },
        onCancel: () => {
          // Reset lại giá trị select box
          setCurrentVersion(currentVersion);
        },
      });
    } else {
      await loadVersionContent(versionId);
    }
  };

  // Tải nội dung của một phiên bản cụ thể
  const loadVersionContent = async (versionId: string) => {
    // Don't show full page loading for version content changes
    try {
      // Tìm phiên bản trong danh sách đã tải
      const selectedVersion = versions.find(v => v.id === versionId);

      if (selectedVersion) {
        setDbmlCode(selectedVersion.content);
        setCurrentVersion(versionId);
        setHasChanges(false);
        // Khi chọn version, xóa thông tin về changelog hiện tại
        setCurrentChangelogCode('');
        console.log('✅ Version content loaded successfully');
      }
    } catch (error) {
      console.error('Error loading version content:', error);
      message.error('Failed to load version content');
    }
  };

  // Fetch changelogs
  const fetchChangelogs = async () => {
    if (!projectId) return;

    setChangelogLoading(true);
    try {
      const response = await apiService.get<ChangelogItem[]>(`/api/v1/changelogs/project/${projectId}`);
      setChangelogs(response);

      // Lấy changelog mới nhất nếu có
      if (response.length > 0) {
        const latestChangelog = response[0]; // Giả sử API trả về danh sách đã sắp xếp theo thứ tự mới nhất

        // Chỉ cập nhật nội dung và hiển thị changelog mới nhất nếu không có version được chọn
        if (!currentVersion) {
          setDbmlCode(latestChangelog.content);
          setCurrentChangelogCode(latestChangelog.codeChangeLog);
          setHasChanges(false);
        }
      }
    } catch (error) {
      console.error('Error fetching changelogs:', error);
      message.error('Failed to load changelog history');
    } finally {
      setChangelogLoading(false);
    }
  };

  // Handle history button click
  const handleHistoryClick = () => {
    setHistoryDrawerVisible(true);
    fetchChangelogs();
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return moment(timestamp).format('MMM DD, YYYY HH:mm');
  };

  // Handle export DDL button click
  const handleExportDDLClick = () => {
    setExportDDLModalVisible(true);
  };

  // Handle dialect change
  const handleDialectChange = (value: number) => {
    setSelectedDialect(value as DatabaseDialect);
  };

  // Handle export action change
  const handleExportActionChange = (e: any) => {
    setExportAction(e.target.value);
  };

  // Handle copy DDL script
  const handleCopyDDL = () => {
    navigator.clipboard.writeText(generatedDDL);
    message.success('DDL script copied to clipboard');
    setExportDDLModalVisible(false);
  };

  // Generate DDL
  const handleGenerateDDL = async () => {
    if (!projectId) {
      message.error('Project ID is missing');
      return;
    }

    setGeneratingDDL(true);
    try {
      let response: DDLResponse;

      // Determine which API to call based on whether we're using version or changelog
      if (currentVersion) {
        // Find the version number from the selected version
        const selectedVersion = versions.find(v => v.id === currentVersion);
        if (!selectedVersion || selectedVersion.codeVersion === undefined) {
          throw new Error('Version information is missing');
        }

        // Call API for version-based DDL
        response = await apiService.post<DDLResponse>('/api/v1/versions/generate-single-ddl', {
          projectId: projectId,
          versionNumber: selectedVersion.codeVersion,
          dialect: selectedDialect
        });
      } else if (currentChangelogCode) {
        // Call API for changelog-based DDL
        response = await apiService.post<DDLResponse>('/api/v1/versions/generate-changelog-ddl', {
          projectId: projectId,
          changeLogCode: currentChangelogCode,
          dialect: selectedDialect
        });
      } else {
        throw new Error('No version or changelog selected');
      }

      // Process the DDL script based on selected action
      if (response && response.ddlScript) {
        setGeneratedDDL(response.ddlScript);

        if (exportAction === ExportAction.Download) {
          // Download the DDL script
          const dialectName = getDatabaseDialectName(selectedDialect);
          const fileName = `${projectCode || 'diagram'}_${dialectName.toLowerCase()}.sql`;
          downloadTextAsFile(response.ddlScript, fileName);
          message.success('DDL script generated and downloaded successfully');
          setExportDDLModalVisible(false);
        } else {
          // Just show success message, user will copy manually
          message.success('DDL script generated successfully');
        }
      } else {
        throw new Error('Failed to generate DDL script');
      }
    } catch (error) {
      console.error('Error generating DDL:', error);
      message.error('Failed to generate DDL script');
    } finally {
      setGeneratingDDL(false);
    }
  };

  // Helper function to get database dialect name
  const getDatabaseDialectName = (dialect: DatabaseDialect): string => {
    switch (dialect) {
      case DatabaseDialect.MySQL:
        return 'MySQL';
      case DatabaseDialect.MariaDB:
        return 'MariaDB';
      case DatabaseDialect.PostgreSQL:
        return 'PostgreSQL';
      case DatabaseDialect.OracleDB:
        return 'OracleDB';
      case DatabaseDialect.SQLServer:
        return 'SQLServer';
      default:
        return 'Unknown';
    }
  };

  // Helper function to download text as file
  const downloadTextAsFile = (text: string, fileName: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fetch project accesses
  const fetchProjectAccesses = async () => {
    if (!projectId) return;

    setLoadingAccesses(true);
    try {
      const response = await apiService.get<ProjectAccessItem[]>(`/api/v1/project-access/list/${projectId}`);

      if (response && Array.isArray(response)) {
        setProjectAccesses(response);
      }
    } catch (error: any) {
      console.error('Error fetching project accesses:', error);

      if (error.response?.status === 403) {
        message.error('You do not have permission to view shared users');
      } else {
        message.error('Failed to load shared users');
      }
    } finally {
      setLoadingAccesses(false);
    }
  };

  // Handle share button click
  const handleShareClick = () => {
    setShareModalVisible(true);
    fetchProjectAccesses();
  };

  // Handle publish to dbdocs
  const handlePublishToDbdocs = async () => {
    if (!projectId) return;

    setPublishingToDbdocs(true);
    try {
      //
      if(hasChanges){
        // Tạo changelog mới
        await apiService.post('/api/v1/changelogs', {
          projectId: projectId,
          content: dbmlCode
        });
      }

      // Call the publish API endpoint
      const response = await apiService.post<{url: string}>(`/api/v1/versions`, {
        projectId: projectId
      });

      // Set the published URL (assuming the API returns a URL)
      const publishUrl = response.url || `${API_CONFIG.BASE_URL_FE}/project/${visibility}/${projectId}/docs`;
      setPublishedUrl(publishUrl);

      // Refresh versions after publishing
      await fetchVersions();

      // Show success modal
      setPublishSuccessModalVisible(true);
    } catch (error) {
      console.error('Error publishing to dbdocs:', error);
      message.error('Failed to publish project to dbdocs.io');
    } finally {
      setPublishingToDbdocs(false);
    }
  };

  // Handle share invite
  const handleShareInvite = async (values: ShareFormValues) => {
    if (!projectId) {
      message.error('Project ID is missing');
      return;
    }

    setInviting(true);
    try {
      // Call API to invite user
      const response = await apiService.post<ProjectAccessResponse>('/api/v1/project-access/add-user', {
        projectId: projectId,
        emailOrUsername: values.recipient,
        permission: values.permission === PermissionLevel.VIEW ? 2 : 3 // 2: View, 3: Edit
      });

      // If successful, show success message with user information
      if (response && response.userName) {
        const displayName = response.userName;
        const displayEmail = response.userEmail ? ` (${response.userEmail})` : '';
        message.success(`${displayName}${displayEmail} has been invited to the project`);
      } else {
        message.success(`Invitation sent to ${values.recipient}`);
      }

      form.resetFields();
      // Refresh the list of project accesses
      fetchProjectAccesses();
    } catch (error: any) {
      console.error('Error inviting user:', error);

      // Handle different error cases
      if (error.response) {
        switch (error.response.status) {
          case 404:
            message.error('User not found. Please check the email or username.');
            break;
          case 403:
            message.error('You do not have permission to invite users to this project.');
            break;
          case 400:
            message.error('This user already has access to the project.');
            break;
          case 500:
            message.error('Server error. Please try again later.');
            break;
          default:
            message.error('Failed to send invitation');
        }
      } else {
        message.error('Failed to send invitation. Please check your connection.');
      }
    } finally {
      setInviting(false);
    }
  };

  // Show edit modal
  const showEditModal = (access: ProjectAccessItem) => {
    setSelectedAccess(access);
    setEditPermission(access.permission);
    setEditModalVisible(true);
  };

  // Handle edit permission
  const handleEditPermission = async () => {
    if (!selectedAccess || !projectId) return;

    setProcessingAction(true);
    try {
      await apiService.put('/api/v1/project-access/permission', {
        projectId: projectId,
        identifier: selectedAccess.identifier,
        permission: editPermission
      });

      const displayName = selectedAccess.userName || 'User';
      const displayEmail = selectedAccess.userEmail ? ` (${selectedAccess.userEmail})` : '';
      message.success(`Permission updated for ${displayName}${displayEmail}`);
      setEditModalVisible(false);
      // Refresh the list
      fetchProjectAccesses();
    } catch (error: any) {
      console.error('Error updating permission:', error);

      if (error.response?.status === 403) {
        message.error('You do not have permission to change user access');
      } else {
        message.error('Failed to update permission');
      }
    } finally {
      setProcessingAction(false);
    }
  };

  // Show delete modal
  const showDeleteModal = (access: ProjectAccessItem) => {
    setSelectedAccess(access);
    setDeleteModalVisible(true);
  };

  // Handle delete access
  const handleDeleteAccess = async () => {
    if (!selectedAccess || !projectId) return;

    setProcessingAction(true);
    try {
      await apiService.delete(`/api/v1/project-access/${projectId}/${selectedAccess.identifier}`);

      const displayName = selectedAccess.userName || 'User';
      const displayEmail = selectedAccess.userEmail ? ` (${selectedAccess.userEmail})` : '';
      message.success(`Access removed for ${displayName}${displayEmail}`);
      setDeleteModalVisible(false);
      // Refresh the list
      fetchProjectAccesses();
    } catch (error: any) {
      console.error('Error removing access:', error);

      if (error.response?.status === 403) {
        message.error('You do not have permission to remove user access');
      } else {
        message.error('Failed to remove access');
      }
    } finally {
      setProcessingAction(false);
    }
  };

  // Get permission text
  const getPermissionText = (permission: number) => {
    switch (permission) {
      case 1:
        return 'Owner';
      case 2:
        return 'View';
      case 3:
        return 'Edit';
      case 4:
        return 'Denied';
      default:
        return 'Unknown';
    }
  };

  // Xác định xem người dùng có quyền chỉnh sửa hay không
  const canEdit = permissionLevel === PermissionLevel.OWNER || permissionLevel === PermissionLevel.EDIT;

  console.log("Permission level:", permissionLevel);
  console.log("Can edit:", canEdit);
  console.log("PermissionLevel.OWNER:", PermissionLevel.OWNER);
  console.log("PermissionLevel.EDIT:", PermissionLevel.EDIT);

  // Kiểm tra nếu người dùng không có quyền truy cập
  if (permissionChecked && permissionLevel === PermissionLevel.DENIED) {
    return (
      <Layout style={{ height: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            style={{ marginRight: '15px' }}
            onClick={handleBack}
          />
          <Title level={3} style={{ margin: 0 }}>Access Denied</Title>
        </Header>
        <Content style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert
            message="Access Denied"
            description="Bạn không có quyền truy cập dự án này."
            type="error"
            showIcon
            icon={<LockOutlined />}
            style={{ maxWidth: '500px' }}
            action={
              <Button type="primary" onClick={handleBack}>
                Quay lại
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  if (loading && !dbmlCode) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Loading project..." />
      </div>
    );
  }

  return (
    <Layout className="dbml-editor-layout">
      <Header className="editor-header">
        <div className="editor-header-left">
          <SettingsPopup
            showExitButton={true}
            onExit={() => navigate('/')}
            placement="bottomLeft"
          >
            <div className="editor-logo" style={{ cursor: 'pointer', marginRight: 16 }}>
              <Logo variant="icon" width={96} height={96} />
            </div>
          </SettingsPopup>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="editor-back-btn"
          >
            {t('editor.back')}
          </Button>
          <div className="project-title">
            <Title level={4} style={{ margin: 0, marginLeft: 16 }}>{projectName}</Title>
            {permissionLevel === PermissionLevel.VIEW && (
              <Tag color="blue" style={{ marginLeft: 8 }}>{t('editor.viewOnly')}</Tag>
            )}
          </div>
        </div>

        <div className="editor-header-right">
          {canEdit && (
            <Space>
              <Button
                type={hasChanges ? "primary" : "default"}
                icon={<CloudUploadOutlined />}
                onClick={handleSave}
                disabled={!hasChanges || loading || !isDbmlValid}
                className="editor-action-btn"
                title={!isDbmlValid ? `Cannot save: ${validationErrors.join(', ')}` : undefined}
              >
                {showLabels && t('editor.saveChanges')}
              </Button>
              <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />
            </Space>
          )}

          <Space className="editor-actions">
            <Tooltip title="Project History">
              <Button
                icon={<HistoryOutlined />}
                onClick={handleHistoryClick}
                className="editor-action-btn"
              >
                {showLabels && t('editor.history')}
              </Button>
            </Tooltip>

            <Dropdown
              menu={{
                items: [
                  {
                    key: 'dbml',
                    label: t('editor.downloadDbml'),
                    icon: <DownloadOutlined />,
                    onClick: handleDownload
                  },
                  {
                    key: 'copy',
                    label: t('editor.copyDbml'),
                    icon: <CopyOutlined />,
                    onClick: handleCopyCode
                  },
                  {
                    key: 'ddl',
                    label: t('editor.exportSqlDdl'),
                    icon: <DatabaseOutlined />,
                    onClick: handleExportDDLClick
                  }
                ]
              }}
              trigger={['click']}
            >
              <Button className="editor-action-btn">
                <Space>
                  <ExportOutlined />
                  {showLabels && t('editor.export')}
                  <DownOutlined style={{ fontSize: 12 }} />
                </Space>
              </Button>
            </Dropdown>

            <Tooltip title="Share Project">
              <Button
                icon={<ShareAltOutlined />}
                onClick={handleShareClick}
                className="editor-action-btn"
              >
                {showLabels && t('editor.share')}
              </Button>
            </Tooltip>

            <Tooltip title={!isDbmlValid ? `Cannot publish: ${validationErrors.join(', ')}` : "Publish to dbdocs.io"}>
              <Button
                type="primary"
                icon={<BookOutlined />}
                onClick={handlePublishToDbdocs}
                loading={publishingToDbdocs}
                disabled={!isDbmlValid}
                className="editor-action-btn"
                style={{ backgroundColor: '#1677ff' }}
              >
                {showLabels && t('editor.publishToDbdocs')}
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Header>

      <Content className="editor-content">
        {loading ? (
          <div className="editor-loading">
            <Spin size="large" tip={t('editor.loadingEditor')} />
          </div>
        ) : permissionLevel === PermissionLevel.DENIED ? (
          <div className="editor-denied">
            <Alert
              message={t('editor.accessDenied')}
              description={t('editor.noPermission')}
              type="error"
              showIcon
              action={
                <Button size="small" type="primary" onClick={handleBack}>
                  {t('editor.goBack')}
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {showPermissionAlert && (
              <Alert
                message={`You have ${getPermissionText(permissionLevel ?? 0)} access to this project.`}
                type="info"
                showIcon
                closable
                onClose={() => setShowPermissionAlert(false)}
                style={{ marginBottom: 16 }}
              />
            )}

            <div className="editor-toolbar">
              <div>
                <Text strong>{t('editor.version')}: </Text>
                <Select
                  value={currentVersion || undefined}
                  loading={loading}
                  style={{ width: 180 }}
                  onChange={handleVersionChange}
                  placeholder={t('editor.selectVersion')}
                >
                  {versions.map(v => (
                    <Select.Option key={v.id} value={v.id}>
                      {`Version ${v.codeVersion}`}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="editor-wrapper">
              <DbmlEditor
                initialValue={dbmlCode || ''}
                onChange={handleDbmlChange}
                onValidationChange={handleValidationChange}
                readOnly={!canEdit}
                type="dbml"
              />
            </div>
          </>
        )}
      </Content>

      {/* History Drawer */}
      <Drawer
        title={t('editor.projectHistory')}
        placement="right"
        width={500}
        open={historyDrawerVisible}
        onClose={() => setHistoryDrawerVisible(false)}
      >
        {changelogLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
            <div style={{ marginTop: 16 }}>{t('editor.loadingHistory')}</div>
          </div>
        ) : changelogs.length === 0 ? (
          <Empty description={t('editor.noHistoryRecords')} />
        ) : (
          <List
            className="changelog-list"
            dataSource={changelogs}
            renderItem={(item) => (
              <List.Item
                className="changelog-item"
                actions={[
                  <Tooltip title={t('editor.viewThisVersion')}>
                    <Button
                      size="small"
                      icon={<BookOutlined />}
                      onClick={() => handleApplyChangelog(item)}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.creatorAvatarUrl ? (
                      <Avatar src={item.creatorAvatarUrl} />
                    ) : (
                      <Avatar icon={<UserOutlined />} />
                    )
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.creatorName || t('editor.unknownUser')}</span>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatDate(item.createdDate)}
                      </Text>
                    </div>
                  }
                  // description={item.content || t('editor.noDescription')}
                />
                <Text strong={true} style={{ fontSize: 14, marginTop: 4 }}>{`V${item.codeChangeLog}`}</Text>
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* Export DDL Modal */}
      <Modal
        title={t('editor.generateSqlDdl')}
        open={exportDDLModalVisible}
        onOk={exportAction === ExportAction.Download ? handleGenerateDDL : handleCopyDDL}
        onCancel={() => setExportDDLModalVisible(false)}
        okText={exportAction === ExportAction.Download ? t('editor.generateDownload') : t('editor.copyToClipboard')}
        confirmLoading={generatingDDL}
        width={700}
      >
        <div style={{ marginBottom: '20px' }}>
          <p>Generate SQL DDL script for the selected database type:</p>

          <div style={{ marginTop: '16px' }}>
            <Select
              style={{ width: '100%' }}
              value={selectedDialect}
              onChange={handleDialectChange}
              options={[
                { label: 'MySQL', value: DatabaseDialect.MySQL },
                { label: 'MariaDB', value: DatabaseDialect.MariaDB },
                { label: 'PostgreSQL', value: DatabaseDialect.PostgreSQL },
                { label: 'Oracle DB', value: DatabaseDialect.OracleDB },
                { label: 'SQL Server', value: DatabaseDialect.SQLServer }
              ]}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <Radio.Group onChange={handleExportActionChange} value={exportAction}>
              <Radio value={ExportAction.Download}>{t('editor.downloadSqlFile')}</Radio>
              <Radio value={ExportAction.Copy}>{t('editor.copyToClipboard')}</Radio>
            </Radio.Group>
          </div>

          <div style={{ marginTop: '16px' }}>
            {currentVersion && (
              <Alert
                message={`Generating DDL for version ${versions.find(v => v.id === currentVersion)?.codeVersion}`}
                type="info"
                showIcon
              />
            )}
            {currentChangelogCode && !currentVersion && (
              <Alert
                message={`Generating DDL for changelog v${currentChangelogCode}`}
                type="info"
                showIcon
              />
            )}
            {!currentVersion && !currentChangelogCode && (
              <Alert
                message={t('editor.selectVersionFirst')}
                type="warning"
                showIcon
              />
            )}
          </div>

          {generatedDDL && exportAction === ExportAction.Copy && (
            <div style={{ marginTop: '16px' }}>
              <Typography.Text strong>Generated SQL:</Typography.Text>
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  maxHeight: '200px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}
              >
                {generatedDDL}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={t('editor.confirmRevert')}
        open={confirmModalVisible}
        onOk={confirmChangelogRevert}
        onCancel={cancelChangelogRevert}
        okText={t('editor.yesRevert')}
        cancelText={t('editor.cancel')}
      >
        <p>{t('editor.confirmRevertText')}{selectedChangelog?.codeChangeLog}?</p>
        {hasChanges && (
          <Alert
            message={t('editor.warning')}
            description={t('editor.unsavedChanges')}
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Modal>

      {/* Share Modal */}
      <Modal
        title={t('editor.shareProject')}
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            {t('editor.close')}
          </Button>
        ]}
        width={600}
      >
        <div>
          {permissionLevel === PermissionLevel.OWNER && (
            <>
              <Typography.Title level={5}>{t('editor.addPeople')}</Typography.Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleShareInvite}
                initialValues={{ permission: PermissionLevel.VIEW }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Form.Item
                    name="recipient"
                    style={{ flex: 1, marginBottom: '10px' }}
                    rules={[
                      { required: true, message: 'Please enter an email or username' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder={t('editor.enterEmailUsername')}
                    />
                  </Form.Item>

                  <Form.Item
                    name="permission"
                    style={{ width: '120px', marginBottom: '10px' }}
                    rules={[{ required: true, message: t('editor.required') }]}
                  >
                    <Select>
                      <Select.Option value={PermissionLevel.VIEW}>{t('editor.viewOnly')}</Select.Option>
                      <Select.Option value={PermissionLevel.EDIT}>{t('editor.edit')}</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item style={{ marginBottom: '10px' }}>
                    <Button
                      type="primary"
                      loading={inviting}
                      onClick={() => form.submit()}
                      icon={<UserAddOutlined />}
                    >
                      {t('editor.invite')}
                    </Button>
                  </Form.Item>
                </div>
              </Form>

              <Divider style={{ margin: '16px 0' }} />
            </>
          )}

          <Typography.Title level={5}>{t('editor.peopleWithAccess')}</Typography.Title>

          {loadingAccesses ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin tip={t('editor.loading')} />
            </div>
          ) : (
            <List
              dataSource={projectAccesses}
              renderItem={(item) => (
                <List.Item
                  actions={
                    permissionLevel === PermissionLevel.OWNER
                      ? [
                          <Popover
                            key="more"
                            content={
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={() => showEditModal(item)}
                                  style={{ textAlign: 'left' }}
                                >
                                  Change permission
                                </Button>
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => showDeleteModal(item)}
                                  style={{ textAlign: 'left' }}
                                >
                                  Remove access
                                </Button>
                              </div>
                            }
                            trigger="click"
                            placement="bottomRight"
                          >
                            <Button type="text" icon={<MoreOutlined />} />
                          </Popover>
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatarUrl} icon={!item.avatarUrl && <UserOutlined />} />}
                    title={
                      <div>
                        {item.userName || 'Unnamed User'}
                        {item.permission === 1 && (
                          <Tag color="gold" style={{ marginLeft: 8, fontSize: '11px' }}>OWNER</Tag>
                        )}
                        {item.userEmail && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {item.userEmail}
                          </div>
                        )}
                      </div>
                    }
                    description={
                      <Tag color={item.permission === 3 ? 'green' : item.permission === 2 ? 'blue' : 'gold'}>
                        {getPermissionText(item.permission)}
                      </Tag>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No users have been shared with yet' }}
            />
          )}
        </div>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        title="Edit Permission"
        open={editModalVisible}
        onOk={handleEditPermission}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={processingAction}
      >
        <div style={{ marginBottom: '20px' }}>
          <p>Change permission for {selectedAccess?.userName || 'User'}</p>
          {selectedAccess?.userEmail && (
            <p style={{ color: '#666', marginTop: '-10px' }}>{selectedAccess.userEmail}</p>
          )}

          <Select
            style={{ width: '100%' }}
            value={editPermission}
            onChange={(value) => setEditPermission(value)}
          >
            <Select.Option value={2}>View only</Select.Option>
            <Select.Option value={3}>Edit</Select.Option>
          </Select>
        </div>
      </Modal>

      {/* Delete Access Modal */}
      <Modal
        title="Remove Access"
        open={deleteModalVisible}
        onOk={handleDeleteAccess}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={processingAction}
      >
        <p>Are you sure you want to remove {selectedAccess?.userName || 'User'}'s access to this project?</p>
        {selectedAccess?.userEmail && (
          <p style={{ color: '#666', marginTop: '-10px' }}>{selectedAccess.userEmail}</p>
        )}
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Publish success modal */}
      <Modal
        title="Published to dbdocs.io"
        open={publishSuccessModalVisible}
        onOk={() => setPublishSuccessModalVisible(false)}
        onCancel={() => setPublishSuccessModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPublishSuccessModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="view"
            type="primary"
            onClick={() => {
              window.open(publishedUrl, '_blank');
            }}
          >
            View Documentation
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <BookOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
          <p style={{ fontSize: 16 }}>
            Your project has been successfully published to dbdocs.io!
          </p>
          <Input.TextArea
            value={publishedUrl}
            readOnly
            autoSize={{ minRows: 1, maxRows: 2 }}
            style={{ marginTop: 16, marginBottom: 16 }}
          />
          <p>
            You can share this link with others to view your database documentation.
          </p>
        </div>
      </Modal>
    </Layout>
  );
};

export default DbmlEditorPage;
