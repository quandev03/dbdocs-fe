import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Table, Dropdown, Menu, Typography, Avatar, Space, Layout, Badge, Tooltip, Spin, Empty, message, Divider } from 'antd';
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
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import '../styles/HomePage.css';
import { apiService } from '../../../services/apiService';
import Logo from '../../../components/common/Logo';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

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
  const [searchText, setSearchText] = useState('');
  const [projectSearchText, setProjectSearchText] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('my-projects');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Project 1',
      lastModified: 'Today at 1:30pm',
      createdAt: 'Tomorrow at 8am',
      status: 'active'
    },
    {
      id: '2',
      name: 'Project 1',
      lastModified: 'Today at 1:30pm',
      createdAt: 'Tomorrow at 8am',
      status: 'active'
    },
    {
      id: '3',
      name: 'Project 1',
      lastModified: 'Today at 1:30pm',
      createdAt: 'Tomorrow at 8am',
      status: 'active'
    },
    {
      id: '4',
      name: 'Project 1',
      lastModified: 'Today at 1:30pm',
      createdAt: 'Tomorrow at 8am',
      status: 'active'
    },
    {
      id: '5',
      name: 'Project 1',
      lastModified: 'Today at 1:30pm',
      createdAt: 'Tomorrow at 8am',
      status: 'active'
    }
  ]);

  // Format date with relative time
  const formatDate = (timestamp: number | string) => {
    if (!timestamp) return 'N/A';
    
    // Create date object directly since timestamp is already in milliseconds
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    
    // Less than 1 minute: show in seconds
    if (diffMin < 1) {
      return `${diffSec} giây trước`;
    }
    
    // Less than 1 hour: show in minutes
    if (diffHour < 1) {
      return `${diffMin} phút trước`;
    }
    
    // Less than 1 day: show in hours
    if (diffDay < 1) {
      return `${diffHour} giờ trước`;
    }
    
    // Less than 1 month: show in days
    if (diffMonth < 1) {
      return `${diffDay} ngày trước`;
    }
    
    // More than 1 month: show in dd/MM/yyyy format
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Call API to get projects list
      const response = await apiService.get<any[]>('/api/v1/projects');
      
      // Transform API data to UI format
      const formattedProjects = response.map((project: any) => ({
        id: project.projectId,
        name: project.projectName || project.projectCode || 'Unnamed Project',
        lastModified: project.modifiedDate ? formatDate(project.modifiedDate) : 'N/A',
        createdAt: project.createdDate ? formatDate(project.createdDate) : 'N/A',
        status: 'active',
        description: project.description || ''
      }));
      
      setProjects(formattedProjects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      message.error('Failed to load projects');
      setLoading(false);
    }
  };

  // Load projects when component mounts
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

  // Filter projects based on search text
  const filteredProjects = projectSearchText
    ? projects.filter(p => p.name.toLowerCase().includes(projectSearchText.toLowerCase()))
    : projects;

  const handleCreateProject = () => {
    // Navigate to project creation page
    navigate('/projects/new');
  };

  const handleViewProject = (projectId: string) => {
    // Navigate to project details page
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setLoading(true);
      await apiService.delete(`/api/v1/projects/${projectId}`);
      message.success('Project deleted successfully');
      // Refresh projects list after deletion
      await fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      if (err.response?.status === 403) {
        message.error('You do not have permission to delete this project');
      } else if (err.response?.status === 404) {
        message.error('Project not found');
      } else {
        message.error('Failed to delete project');
      }
      setLoading(false);
    }
  };

  const handleMenuItemClick = (menuKey: string) => {
    setActiveMenuItem(menuKey);
    
    // Handle navigation based on menu item
    switch(menuKey) {
      case 'api-tokens':
        navigate('/settings/api-tokens');
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

  const columns = useMemo(() => [
    {
      title: t('homepage.nameProject'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Badge className={record.status === 'active' ? 'badge-dot-active' : 'badge-dot-inactive'} status="default" />
          <span className="project-name">{text}</span>
        </Space>
      )
    },
    {
      title: t('homepage.lastModified'),
      dataIndex: 'lastModified',
      key: 'lastModified',
      responsive: ['md'] as any
    },
    {
      title: t('homepage.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg'] as any
    },
    {
      title: '',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space className="action-buttons">
          <Tooltip title={t('homepage.edit')}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              shape="circle" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${record.id}/edit`);
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
                navigate(`/projects/${record.id}/docs`);
              }} 
            />
          </Tooltip>
          <Dropdown 
            overlay={
              <Menu>
                <Menu.Item key="1" icon={<SearchOutlined />}>{t('homepage.viewDetails')}</Menu.Item>
                {/* <Menu.Item key="2" icon={<EditOutlined />}>Rename</Menu.Item> */}
                <Menu.Divider />
                <Menu.Item
                key="3" 
                icon={<LogoutOutlined />} 
                danger
                onClick={() => {
                  handleDeleteProject(record.id);
                }}
                >
                  {t('homepage.delete')}
                  </Menu.Item>
              </Menu>
            } 
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
  ], [t, navigate, handleDeleteProject]);

  const renderSidebarIcon = (icon: React.ReactNode, menuKey: string) => {
    return (
      <div style={{ marginRight: '10px', fontSize: '16px', opacity: activeMenuItem === menuKey ? 1 : 0.7 }}>
        {icon}
      </div>
    );
  };

  return (
    <div className="dashboard-container" key={language}>
      <Header className="top-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {windowWidth <= 768 && (
            <Button 
              type="text" 
              icon={sidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />} 
              onClick={toggleSidebar} 
              className="header-action-button"
              style={{ marginRight: '10px' }}
            />
          )}
          <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <Logo variant="full" width={100} height={60} />
          </div>
        </div>
        
                <div style={{ flex: 1 }} />
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={t('homepage.help')}>
            <Button 
              type="text" 
              icon={<QuestionCircleOutlined />} 
              shape="circle" 
              className="header-action-button"
              style={{ marginRight: '10px' }}
              onClick={() => navigate('/help')}
            />
          </Tooltip>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="profile" icon={<UserOutlined />}>{t('homepage.profile')}</Menu.Item>
                <Menu.SubMenu key="settings" icon={<SettingOutlined />} title={t('homepage.settings')}>
                  <Menu.Item 
                    key="theme" 
                    icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? t('homepage.darkMode') : t('homepage.lightMode')}
                  </Menu.Item>
                  <Menu.Item 
                    key="language" 
                    icon={<GlobalOutlined />}
                    onClick={toggleLanguage}
                  >
                    {language === 'en' ? t('homepage.vietnamese') : t('homepage.english')}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="api-tokens" icon={<KeyOutlined />} onClick={() => handleMenuItemClick('api-tokens')}>
                    {t('homepage.apiTokens')}
                  </Menu.Item>
                </Menu.SubMenu>
                <Menu.Divider />
                <Menu.Item key="logout" icon={<LogoutOutlined />} danger onClick={handleLogout}>{t('homepage.logout')}</Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <div className="user-dropdown">
              <Avatar style={{ backgroundColor: '#4285f4' }}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </Avatar>
              {windowWidth > 480 && (
                <span style={{ marginLeft: '8px', fontWeight: 500, color: '#475569' }}>
                  {user?.email || 'quandev03@gmail.com'}
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
              <StarFilled className="star-icon" />
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
          ) : filteredProjects.length > 0 ? (
            <Table 
              columns={columns} 
              dataSource={filteredProjects} 
              pagination={false}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => handleViewProject(record.id),
                className: 'project-row'
              })}
              className="fade-in"
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
};

export default HomePage; 