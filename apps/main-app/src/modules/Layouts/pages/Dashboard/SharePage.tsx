import React, { useState, useEffect } from 'react';
import { Button, Input, Table, Dropdown, Menu, Typography, Avatar, Space, Layout, Badge, Tooltip, Spin, Empty } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';
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
import '../../../Layouts/styles/Dashboard.css';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

const SharePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [projectSearchText, setProjectSearchText] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('shared');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  
  // Mock data for shared projects
  const sharedProjects = [
    {
      id: '1',
      name: 'Shared Project 1',
      lastModified: 'Today at 1:30pm',
      createdAt: 'Tomorrow at 8am',
      status: 'active',
      sharedBy: 'John Doe'
    },
    {
      id: '2',
      name: 'Shared Project 2',
      lastModified: 'Today at 2:30pm',
      createdAt: 'Yesterday at 8am',
      status: 'active',
      sharedBy: 'Jane Smith'
    },
    {
      id: '3',
      name: 'Shared Project 3',
      lastModified: 'Today at 3:30pm',
      createdAt: '2 days ago',
      status: 'active',
      sharedBy: 'Mike Johnson'
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
    ? sharedProjects.filter(p => p.name.toLowerCase().includes(projectSearchText.toLowerCase()))
    : sharedProjects;

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
      title: 'Shared by',
      dataIndex: 'sharedBy',
      key: 'sharedBy',
      responsive: ['md' as Breakpoint]
    },
    {
      title: 'Last modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      responsive: ['lg' as Breakpoint]
    },
    {
      title: 'Created at',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['xl' as Breakpoint]
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
            <Typography.Text strong>All Shared Projects ({loading ? '...' : filteredProjects.length})</Typography.Text>
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
    </AuthRedirect>
  );
};

export default SharePage; 