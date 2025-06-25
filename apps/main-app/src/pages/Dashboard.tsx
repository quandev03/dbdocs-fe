import React from 'react';
import { Button, Card, Avatar, Descriptions, Badge, Space, Divider } from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  MailOutlined, 
  SafetyOutlined,
  GithubOutlined,
  GoogleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const getProviderIcon = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'google':
        return <GoogleOutlined style={{ color: '#4285F4' }} />;
      case 'github':
        return <GithubOutlined style={{ color: '#333' }} />;
      default:
        return <UserOutlined />;
    }
  };

  const getProviderBadgeColor = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'google':
        return 'blue';
      case 'github':
        return 'default';
      default:
        return 'purple';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500">Loading user information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <DatabaseOutlined className="text-2xl text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">DBDocs Dashboard</h1>
            </div>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card 
              title="Profile Information" 
              className="shadow-sm"
              extra={<Badge 
                color={getProviderBadgeColor(user.provider)} 
                text={user.provider?.toUpperCase() || 'UNKNOWN'} 
              />}
            >
              <div className="text-center mb-6">
                <Avatar 
                  size={80} 
                  src={user.pictureUrl} 
                  icon={<UserOutlined />}
                  className="mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <Divider />

              <Descriptions column={1} size="small">
                <Descriptions.Item 
                  label={<><UserOutlined className="mr-1" />User ID</>}
                >
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {user.id}
                  </code>
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<><MailOutlined className="mr-1" />Email</>}
                >
                  {user.email}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<><SafetyOutlined className="mr-1" />Provider</>}
                >
                  <Space>
                    {getProviderIcon(user.provider)}
                    {user.provider?.charAt(0).toUpperCase() + (user.provider?.slice(1) || '')}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Welcome & Actions Card */}
          <div className="lg:col-span-2">
            <Card title="Welcome Back!" className="shadow-sm mb-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Hello, {user.name}! 👋
                </h2>
                <p className="text-gray-600 mb-6">
                  You have successfully logged in to DBDocs using {user.provider}. 
                  Start managing your database documentation today.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <Button 
                    type="primary" 
                    size="large" 
                    className="h-12"
                    onClick={() => navigate('/projects')}
                  >
                    View Projects
                  </Button>
                  <Button 
                    type="default" 
                    size="large" 
                    className="h-12"
                    onClick={() => navigate('/create')}
                  >
                    Create New Project
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-gray-600">Projects</div>
              </Card>
              <Card className="text-center shadow-sm">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-gray-600">Documents</div>
              </Card>
              <Card className="text-center shadow-sm">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-gray-600">Collaborators</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Activity" className="mt-8 shadow-sm">
          <div className="text-center py-12 text-gray-500">
            <DatabaseOutlined className="text-4xl mb-4 opacity-50" />
            <p>No recent activity yet. Start creating your first project!</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 