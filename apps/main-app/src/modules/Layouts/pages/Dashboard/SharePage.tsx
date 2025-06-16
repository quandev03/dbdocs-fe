import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Dropdown, Menu, Typography, Avatar, Space, Layout, Badge, Tooltip, Spin, Empty, Modal, Form } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
import type { AlignType } from 'rc-table/lib/interface';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  BookOutlined, 
  MoreOutlined, 
  StarFilled, 
  MenuUnfoldOutlined, 
  UserOutlined,
  ShareAltOutlined,
  KeyOutlined,
  MenuFoldOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import AuthRedirect from '../../../../components/AuthRedirect';
import { apiService } from '../../../../services/apiService';
import '../../../Layouts/styles/Dashboard.css';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

// Define project interface based on actual API response
interface Project {
  projectId: string;
  projectCode: string;
  description: string;
  passwordShare: string;
  visibility: number;
  ownerId: string;
  createdDate: string;
  createdBy: string;
  modifiedDate: string | null;
  modifiedBy: string | null;
  sharedBy?: string;
  owner?: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  latestModification?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerAvatarUrl?: string;
}

const SharePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [projectSearchText, setProjectSearchText] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('shared');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // New Project Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createProjectForm] = Form.useForm();
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  
  console.log('Current user information (SharePage):', user);
  
  // Fetch shared projects from API
  const fetchSharedProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Project[]>('/api/v1/projects/shared');
      console.log('Shared projects:', response);
      setProjects(response || []);
    } catch (err: any) {
      console.error('Error fetching shared projects:', err);
      setError(err.message || 'Failed to load shared projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch shared projects on component mount
  useEffect(() => {
    fetchSharedProjects();
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width <= 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get user avatar for a given user object or owner information
  const getUserAvatarByInfo = (name?: string, email?: string, avatarUrl?: string) => {
    // If user has an avatar URL
    if (avatarUrl) {
      return <Avatar src={avatarUrl} />;
    }
    
    // If user has a name, use first letter
    if (name) {
      return (
        <Avatar style={{ backgroundColor: '#1890ff' }}>
          {name[0].toUpperCase()}
        </Avatar>
      );
    }
    
    // If user has email, use first letter of email
    if (email) {
      return (
        <Avatar style={{ backgroundColor: '#1890ff' }}>
          {email[0].toUpperCase()}
        </Avatar>
      );
    }
    
    // Default avatar
    return (
      <Avatar style={{ backgroundColor: '#87d068' }}>
        <UserOutlined />
      </Avatar>
    );
  };
  
  // Get user avatar display for logged in user
  const getUserAvatar = () => {
    return getUserAvatarByInfo(user?.name, user?.email, user?.avatarUrl);
  };

  // Get user display name
  const getUserDisplayName = () => {
    return user?.name || user?.email || 'User';
  };

  // Filter projects based on search text
  const filteredProjects = projectSearchText
    ? projects.filter(p => p.projectCode.toLowerCase().includes(projectSearchText.toLowerCase()))
    : projects;

  const handleCreateProject = () => {
    // Open create project modal instead of navigating
    setCreateModalVisible(true);
  };

  const handleViewProject = (projectId: string) => {
    // Navigate to project details page
    navigate(`/projects/${projectId}`);
  };

  const handleMenuItemClick = (menuKey: string) => {
    setActiveMenuItem(menuKey);
    
    // Handle navigation based on menu item
    switch(menuKey) {
      case 'api-tokens':
        navigate('/settings/api-tokens');
        break;
      case 'shared':
        navigate('/share');
        break;
      case 'my-projects':
        navigate('/');
        break;
      default:
        // Default behavior stays on the current page
        break;
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/login');
    }
  };

  // Submit create project form
  const handleCreateProjectSubmit = async (values: any) => {
    setProjectSubmitting(true);
    try {
      console.log('Creating project with values:', values);
      
      // Call API to create project
      const response = await apiService.post('/api/v1/projects', values);
      console.log('Project created:', response);
      
      // Clear form and close modal
      createProjectForm.resetFields();
      setCreateModalVisible(false);
      
      // Refresh projects list
      fetchSharedProjects();
      
    } catch (err: any) {
      console.error('Error creating project:', err);
      // Handle error (could show notification here)
    } finally {
      setProjectSubmitting(false);
    }
  };
  
  // Close modal and reset form
  const handleCancelCreate = () => {
    createProjectForm.resetFields();
    setCreateModalVisible(false);
  };

  const columns = [
    {
      title: 'Name project',
      dataIndex: 'projectCode',
      key: 'projectCode',
      align: 'center' as AlignType,
      render: (text: string, record: Project) => (
        <span className="project-name">{text}</span>
      )
    },
    {
      title: 'Shared by',
      key: 'owner',
      responsive: ['md' as Breakpoint],
      align: 'center' as AlignType,
      render: (_: any, record: Project) => {
        console.log('Rendering owner for project:', record.projectCode, record);
        
        // Lấy thông tin owner từ các trường có thể có trong API response
        const ownerName = record.ownerName || 
                          (record.owner?.name) || 
                          '';
                          
        const ownerEmail = record.ownerEmail || 
                           (record.owner?.email) || 
                           '';
                           
        const ownerAvatar = record.ownerAvatarUrl || record.owner?.avatarUrl;
        
        console.log('Owner avatar URL:', ownerAvatar);
        
        return (
          <Tooltip title={
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '8px' }}>
                {ownerAvatar ? (
                  <Avatar 
                    src={ownerAvatar} 
                    size={64}
                    icon={<UserOutlined />} 
                    onError={() => {
                      console.log('Avatar load failed:', ownerAvatar);
                      return true; // Use fallback
                    }}
                  />
                ) : (
                  getUserAvatarByInfo(ownerName, ownerEmail, undefined)
                )}
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {ownerName || 'Unknown'}
              </div>
              <div>{ownerEmail || ''}</div>
            </div>
          }>
            <div style={{ cursor: 'pointer' }}>
              {ownerAvatar ? (
                <Avatar 
                  src={ownerAvatar} 
                  icon={<UserOutlined />}
                  onError={() => {
                    console.log('Avatar load failed (small):', ownerAvatar);
                    return true; // Use fallback
                  }}
                />
              ) : (
                getUserAvatarByInfo(ownerName, ownerEmail, undefined)
              )}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Last modified',
      dataIndex: 'latestModification',
      key: 'latestModification',
      responsive: ['lg' as Breakpoint],
      align: 'center' as AlignType,
      render: (text: string | null, record: Project) => 
        formatDate(record.latestModification || record.modifiedDate || record.createdDate)
    },
    {
      title: 'Created at',
      dataIndex: 'createdDate',
      key: 'createdDate',
      responsive: ['xl' as Breakpoint],
      align: 'center' as AlignType,
      render: (text: string) => formatDate(text)
    },
    {
      title: '',
      key: 'actions',
      align: 'center' as AlignType,
      render: (_: any, record: Project) => (
        <Space className="action-buttons">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              shape="circle" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dbml-editor/${record.projectId}`);
              }} 
            />
          </Tooltip>
          <Tooltip title="View Docs">
            <Button 
              type="text" 
              icon={<BookOutlined />} 
              shape="circle" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${record.projectId}/docs`);
              }} 
            />
          </Tooltip>
          <Dropdown 
            menu={{
              items: [
                { key: '1', icon: <SearchOutlined />, label: 'View details' },
                { key: '2', icon: <EditOutlined />, label: 'Rename' },
                { type: 'divider' },
                { key: '3', icon: <LogoutOutlined />, label: 'Delete', danger: true }
              ]
            }}
            trigger={['click']}
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />} 
              shape="circle" 
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const DashboardContent = () => (
    <div className="dashboard-container">
      <Header className="top-header" style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {windowWidth <= 768 && (
            <Button 
              type="text" 
              icon={sidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />} 
              onClick={toggleSidebar} 
              className="header-action-button"
              style={{ marginRight: '16px' }}
            />
          )}
          <div className="logo-text" onClick={() => navigate('/')}>DBDocs</div>
        </div>
        
        <Input 
          className="search-header-input"
          placeholder="Search diagram" 
          prefix={<SearchOutlined />} 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: windowWidth <= 768 ? '150px' : '300px', margin: '0 20px' }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tooltip title="Help">
            <Button 
              type="text" 
              icon={<QuestionCircleOutlined />} 
              shape="circle" 
              className="header-action-button"
              onClick={() => navigate('/help')}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
                { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: handleLogout }
              ]
            }}
            trigger={['click']}
          >
            <div className="user-dropdown">
              {getUserAvatar()}
              {windowWidth > 480 && (
                <span style={{ marginLeft: '8px', fontWeight: 500 }}>
                  {getUserDisplayName()}
                </span>
              )}
            </div>
          </Dropdown>
        </div>
      </Header>
      
      <div className={`left-sidebar ${sidebarVisible ? 'visible' : ''}`}>
        <div 
          className={`sidebar-menu-item ${activeMenuItem === 'new-project' ? 'menu-item-active' : ''}`}
          onClick={() => {
            handleMenuItemClick('new-project');
            handleCreateProject();
          }}
        >
          <div className="sidebar-icon">
            <PlusOutlined />
          </div>
          New Project
        </div>
        
        <div className="sidebar-divider" />
        
        <div 
          className={`sidebar-menu-item ${activeMenuItem === 'my-projects' ? 'menu-item-active' : ''}`}
          onClick={() => handleMenuItemClick('my-projects')}
        >
          <div className="sidebar-icon">
            <StarFilled className="star-icon" />
          </div>
          My Projects
        </div>
        
        <div 
          className={`sidebar-menu-item ${activeMenuItem === 'shared' ? 'menu-item-active' : ''}`}
          onClick={() => handleMenuItemClick('shared')}
        >
          <div className="sidebar-icon">
            <ShareAltOutlined />
          </div>
          <span>Shared with me</span>
        </div>
        
        <div className="sidebar-divider" />
        
        <div 
          className={`sidebar-menu-item ${activeMenuItem === 'api-tokens' ? 'menu-item-active' : ''}`}
          onClick={() => handleMenuItemClick('api-tokens')}
        >
          <div className="sidebar-icon">
            <KeyOutlined />
          </div>
          <span>API Tokens</span>
        </div>
      </div>
      
      <div className="content-wrapper">
        <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={4} style={{ margin: 0 }}>Shared Projects</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateProject}
            className="new-project-button"
          >
            New Project
          </Button>
        </div>
        
        <div className="project-list-container fade-in">
          <div className="table-header">
            <Typography.Text strong>Shared with me ({loading ? '...' : filteredProjects.length})</Typography.Text>
            <Input 
              placeholder="Search projects" 
              prefix={<SearchOutlined />} 
              style={{ width: 200 }}
              value={projectSearchText}
              onChange={e => setProjectSearchText(e.target.value)}
              disabled={loading}
            />
          </div>
          
          {loading ? (
            <div className="loading-container">
              <Spin />
              <div style={{ marginTop: '10px' }}>Loading shared projects...</div>
            </div>
          ) : error ? (
            <div className="error-container">
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={
                  <span style={{ color: '#ff4d4f' }}>
                    {error}
                  </span>
                }
              />
            </div>
          ) : filteredProjects.length > 0 ? (
            <Table 
              columns={columns} 
              dataSource={filteredProjects} 
              pagination={false}
              rowKey="projectId"
              onRow={(record) => ({
                onClick: () => handleViewProject(record.projectId),
                className: 'project-row'
              })}
              className="fade-in"
            />
          ) : (
            <div className="empty-state">
              <Empty description={
                <span>
                  {projectSearchText ? 'No shared projects match your search' : 'No shared projects found'}
                </span>
              } />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Wrap the dashboard with AuthRedirect to ensure only authenticated users can access it
  return (
    <AuthRedirect
      authenticatedRedirect="/"
      unauthenticatedRedirect="/login"
      requireAuth={true}
    >
      <DashboardContent />
      
      {/* Create Project Modal */}
      <Modal
        title="Create New Project"
        open={createModalVisible}
        onCancel={handleCancelCreate}
        footer={null}
        destroyOnClose
        width={500}
        centered
        maskClosable={false}
        bodyStyle={{ padding: '20px' }}
      >
        <Form
          form={createProjectForm}
          layout="vertical"
          onFinish={handleCreateProjectSubmit}
          requiredMark={false}
          style={{ maxWidth: '100%' }}
        >
          <Form.Item
            name="projectCode"
            label="Project Code"
            rules={[
              { required: true, message: 'Please enter project code' },
              { min: 3, message: 'Project code must be at least 3 characters' },
              { max: 15, message: 'Project code cannot exceed 15 characters' },
              { 
                pattern: /^[a-zA-Z0-9_-]+$/, 
                message: 'Project code can only contain letters, numbers, underscores and hyphens' 
              }
            ]}
            tooltip="Project code must be 3-15 characters with no spaces or special characters"
          >
            <Input 
              placeholder="Enter project code" 
              maxLength={15} 
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter project description' }
            ]}
            style={{ marginBottom: '30px' }}
          >
            <Input.TextArea 
              placeholder="Enter project description" 
              rows={4}
              showCount 
              maxLength={200}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '10px', 
              marginTop: '20px',
              marginBottom: '10px'
            }}>
              <Button onClick={handleCancelCreate}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={projectSubmitting}
              >
                Create Project
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </AuthRedirect>
  );
};

export default SharePage; 