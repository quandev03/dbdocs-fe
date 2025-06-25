import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Table, Dropdown, Menu, Typography, Avatar, Space, Layout, Badge, Tooltip, Spin, Empty, Modal, Form, message } from 'antd';
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
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import AuthRedirect from '../../../../components/AuthRedirect';
import { apiService } from '../../../../services/apiService';

import Logo from '../../../../components/common/Logo';
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
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  // Debug: Log language changes
  console.log('HomePage render - current language:', language);
  console.log('Sample translation:', t('homepage.title'));

  // Track language changes
  useEffect(() => {
    console.log('Language changed to:', language);
  }, [language]);

  const [projectSearchText, setProjectSearchText] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('my-projects');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // New Project Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createProjectForm] = Form.useForm();
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  
  console.log('Current user information (HomePage):', user);
  
  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Project[]>('/api/v1/projects');
      console.log('Projects:', response);
      setProjects(response || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
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
      fetchProjects();
      
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

  // Define columns with useMemo to recalculate when language changes
  const columns = useMemo(() => [
    {
      title: t('homepage.nameProject'),
      dataIndex: 'projectCode',
      key: 'projectCode',
      align: 'center' as AlignType,
      render: (text: string, record: Project) => (
        <span className="project-name">{text}</span>
      )
    },
    {
      title: t('homepage.description'),
      dataIndex: 'description',
      key: 'description',
      responsive: ['md' as Breakpoint],
      align: 'center' as AlignType,
    },
    {
      title: t('homepage.lastModified'),
      dataIndex: 'modifiedDate',
      key: 'modifiedDate',
      responsive: ['lg' as Breakpoint],
      align: 'center' as AlignType,
      render: (text: string | null, record: Project) => 
        formatDate(record.modifiedDate || record.createdDate)
    },
    {
      title: t('homepage.createdAt'),
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
          <Tooltip title={t('homepage.edit')}>
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
          <Tooltip title={t('homepage.viewDocs')}>
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
                { key: '1', icon: <SearchOutlined />, label: t('homepage.viewDetails') },
                { key: '2', icon: <EditOutlined />, label: t('homepage.rename') },
                { type: 'divider' },
                { key: '3', icon: <LogoutOutlined />, label: t('homepage.delete'), danger: true }
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
  ], [t, navigate]);

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
          <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <Logo variant="full" width={100} height={60} />
          </div>
        </div>
        
        <div style={{ flex: 1 }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tooltip title={t('homepage.help')}>
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
                    },
                    { type: 'divider' },
                    { 
                      key: 'api-tokens', 
                      icon: <KeyOutlined />, 
                      label: t('homepage.apiTokens'),
                      onClick: () => handleMenuItemClick('api-tokens')
                    }
                  ]
                },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: t('homepage.logout'), danger: true, onClick: handleLogout }
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
        <div className="sidebar-section">
          <div 
            className={`sidebar-menu-item new-project-item ${activeMenuItem === 'new-project' ? 'menu-item-active' : ''}`}
            onClick={() => {
              handleMenuItemClick('new-project');
              handleCreateProject();
            }}
          >
            <div className="sidebar-icon">
              <PlusOutlined />
            </div>
            <span>{t('homepage.newProject')}</span>
          </div>
        </div>
        
        <div className="sidebar-divider" />
        
        <div className="sidebar-section">
          <div className="sidebar-section-title">{t('homepage.projectsSection').toUpperCase()}</div>
          <div 
            className={`sidebar-menu-item ${activeMenuItem === 'my-projects' ? 'menu-item-active' : ''}`}
            onClick={() => handleMenuItemClick('my-projects')}
          >
            <div className="sidebar-icon">
              <StarFilled className="star-icon" />
            </div>
            <span>{t('homepage.myProjects')}</span>
          </div>
          
          <div 
            className={`sidebar-menu-item ${activeMenuItem === 'shared' ? 'menu-item-active' : ''}`}
            onClick={() => handleMenuItemClick('shared')}
          >
            <div className="sidebar-icon">
              <ShareAltOutlined />
            </div>
            <span>{t('homepage.sharedWithMe')}</span>
          </div>
        </div>
        
        <div className="sidebar-divider" />
        
        <div className="sidebar-section">
          <div className="sidebar-section-title">{t('homepage.settingsSection').toUpperCase()}</div>
          <div 
            className={`sidebar-menu-item ${activeMenuItem === 'api-tokens' ? 'menu-item-active' : ''}`}
            onClick={() => handleMenuItemClick('api-tokens')}
          >
            <div className="sidebar-icon">
              <KeyOutlined />
            </div>
            <span>{t('homepage.apiTokens')}</span>
          </div>
        </div>
      </div>
      
      <div className="content-wrapper">
        <div className="fade-in page-header">
          <div>
            <h1 className="page-title">{t('homepage.projectsTitle')}</h1>
            <p className="page-subtitle">{t('homepage.projectsSubtitle')}</p>
          </div>
        </div>
        
        <div className="project-list-container fade-in">
          <div className="table-header">
            <Typography.Text strong>{t('homepage.allProjects')} ({loading ? '...' : filteredProjects.length})</Typography.Text>
            <Input 
              placeholder={t('homepage.searchProjects')} 
              prefix={<SearchOutlined />} 
              style={{ width: 200 }}
              value={projectSearchText}
              onChange={e => setProjectSearchText(e.target.value)}
              disabled={loading}
            />
          </div>
          
          {loading ? (
            <div className="loading-container">
              <Spin tip={t('homepage.loadingProjects')} />
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
              key={language} // Force re-render on language change
            />
          ) : (
            <div className="empty-state">
              <Empty description={
                <span>
                  {projectSearchText ? t('homepage.noProjectsSearch') : t('homepage.noProjectsFound')}
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
        title={t('homepage.createNewProject')}
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
            label={t('homepage.projectCode')}
            rules={[
              { required: true, message: t('homepage.pleaseEnterProjectCode') },
              { min: 3, message: t('homepage.projectCodeMinLength') },
              { max: 15, message: t('homepage.projectCodeMaxLength') },
              { 
                pattern: /^[a-zA-Z0-9_-]+$/, 
                message: t('homepage.projectCodePattern')
              }
            ]}
            tooltip={t('homepage.projectCodeTooltip')}
          >
            <Input 
              placeholder={t('homepage.enterProjectCode')} 
              maxLength={15} 
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label={t('homepage.description')}
            rules={[
              { required: true, message: t('homepage.pleaseEnterDescription') }
            ]}
            style={{ marginBottom: '30px' }}
          >
            <Input.TextArea 
              placeholder={t('homepage.enterProjectDescription')} 
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
                {t('homepage.cancel')}
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={projectSubmitting}
              >
                {t('homepage.createProject')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </AuthRedirect>
  );
};

export default HomePage;