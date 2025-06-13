import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Dropdown, Menu, Typography, Avatar, Space, Layout, Badge, Tooltip, Spin, Empty } from 'antd';
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
import { useAuth } from '../../../contexts/AuthContext';
import '../styles/HomePage.css';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [projectSearchText, setProjectSearchText] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('my-projects');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  
  // Mock data for projects
  const projects = [
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
  ];

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
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

  const columns = [
    {
      title: 'Name project',
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
      title: 'Last modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      responsive: ['md']
    },
    {
      title: 'Created at',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['lg']
    },
    {
      title: '',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space className="action-buttons">
          <Tooltip title="Edit">
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
          <Tooltip title="View Docs">
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
                <Menu.Item key="1" icon={<SearchOutlined />}>View details</Menu.Item>
                <Menu.Item key="2" icon={<EditOutlined />}>Rename</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3" icon={<LogoutOutlined />} danger>Delete</Menu.Item>
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
  ];

  const renderSidebarIcon = (icon: React.ReactNode, menuKey: string) => {
    return (
      <div style={{ marginRight: '10px', fontSize: '16px', opacity: activeMenuItem === menuKey ? 1 : 0.7 }}>
        {icon}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Header className="top-header" style={{ background: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Help">
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
                <Menu.Item key="profile" icon={<UserOutlined />}>Profile</Menu.Item>
                <Menu.Item key="settings" icon={<SettingOutlined />}>Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="logout" icon={<LogoutOutlined />} danger onClick={handleLogout}>Logout</Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <div className="user-dropdown">
              <Avatar style={{ backgroundColor: '#1890ff' }}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </Avatar>
              {windowWidth > 480 && (
                <span style={{ marginLeft: '8px', fontWeight: 500 }}>
                  {user?.email || 'quandev03@gmail.com'}
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
          className={`sidebar-menu-item featured ${activeMenuItem === 'my-projects' ? 'menu-item-active' : ''}`}
          onClick={() => handleMenuItemClick('my-projects')}
        >
          <div className="sidebar-icon">
            <StarFilled className="star-icon" />
          </div>
          My Project
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
          <Title level={4} style={{ margin: 0 }}>Projects</Title>
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
            <Typography.Text strong>All Projects ({loading ? '...' : filteredProjects.length})</Typography.Text>
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
              <Spin tip="Loading projects..." />
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
                  {projectSearchText ? 'No projects match your search' : 'No projects found'}
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