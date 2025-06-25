import React from 'react';
import { Popover, Divider, Space } from 'antd';
import { 
  SettingOutlined, 
  SunOutlined, 
  MoonOutlined, 
  GlobalOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsPopupProps {
  children: React.ReactNode;
  showExitButton?: boolean;
  onExit?: () => void;
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ 
  children, 
  showExitButton = false, 
  onExit,
  placement = 'bottomLeft'
}) => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const settingsContent = (
    <div style={{ width: '200px', padding: '8px 0' }}>
      {/* Theme Toggle */}
      <div
        className="theme-toggle-btn"
        onClick={toggleTheme}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '8px',
          padding: '12px 16px',
          cursor: 'pointer',
          borderRadius: '6px',
          border: 'none',
          background: 'transparent',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Space>
          {theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
          <span>{t('homepage.theme')}</span>
        </Space>
        <span style={{ 
          fontSize: '12px', 
          color: 'var(--text-tertiary)',
          fontWeight: 500 
        }}>
          {theme === 'light' ? t('homepage.lightMode') : t('homepage.darkMode')}
        </span>
      </div>

      {/* Language Toggle */}
      <div
        className="language-toggle-btn"
        onClick={toggleLanguage}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: showExitButton ? '8px' : '0',
          padding: '12px 16px',
          cursor: 'pointer',
          borderRadius: '6px',
          border: 'none',
          background: 'transparent',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Space>
          <GlobalOutlined />
          <span>{t('homepage.language')}</span>
        </Space>
        <span style={{ 
          fontSize: '12px', 
          color: 'var(--text-tertiary)',
          fontWeight: 500 
        }}>
          {language === 'en' ? t('homepage.english') : t('homepage.vietnamese')}
        </span>
      </div>

      {/* Exit Button (if enabled) */}
      {showExitButton && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <div
            onClick={onExit}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              transition: 'background-color 0.2s ease',
              color: 'var(--error-color)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Space>
              <LogoutOutlined />
              <span>{t('docs.exit')}</span>
            </Space>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover
      content={settingsContent}
      trigger="click"
      placement={placement}
      overlayClassName="settings-popup"
      overlayStyle={{
        zIndex: 1000
      }}
    >
      {children}
    </Popover>
  );
};

export default SettingsPopup; 