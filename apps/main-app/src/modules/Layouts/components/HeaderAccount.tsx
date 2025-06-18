import React from 'react';
import { Avatar, Dropdown, Menu, message } from 'antd';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../../contexts/AuthContext';

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  background-color: #f0f2f5;
  color: #1677ff;
`;

const UserDropdown = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const UserInfo = styled.div`
  margin-left: 8px;
  margin-right: 8px;
`;

const UserName = styled.div`
  font-weight: 500;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

const HeaderAccount: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        message.success('Logged out successfully');
        navigate('/login');
      } else {
        message.error(result.error || 'Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Failed to logout');
    }
  };

  const menu = (
    <Menu
      items={[
        {
          key: 'profile',
          label: 'Profile',
          icon: <User size={16} />,
          onClick: () => navigate('/profile'),
        },
        {
          key: 'logout',
          label: 'Logout',
          icon: <LogOut size={16} />,
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <UserDropdown>
        <UserAvatar>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </UserAvatar>
        {user && (
          <UserInfo>
            <UserName>{user.name || 'User'}</UserName>
            <UserEmail>{user.email || ''}</UserEmail>
          </UserInfo>
        )}
      </UserDropdown>
    </Dropdown>
  );
};

export default HeaderAccount; 