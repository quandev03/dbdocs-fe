import React from 'react';
import { Modal, Typography } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';

const { Text } = Typography;

interface CodeCompareModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentVersion: any;
  previousVersion: any;
  diffResult: string;
}

const CodeCompareModal: React.FC<CodeCompareModalProps> = ({
  isVisible,
  onClose,
  currentVersion,
  previousVersion,
  diffResult
}) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CodeOutlined style={{ marginRight: 8 }} />
          <span>Compare Changes</span>
          {currentVersion && previousVersion && (
            <span style={{ marginLeft: 8, fontWeight: 'normal', fontSize: '14px' }}>
              (Version {previousVersion.codeVersion} → Version {currentVersion.codeVersion})
            </span>
          )}
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={1200}
      style={{ top: 20 }}
      bodyStyle={{ padding: '0', height: 'calc(90vh - 108px)' }}
    >
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        {/* Unified diff view section */}
        <div style={{ flex: '0 0 30%', borderBottom: '1px solid #e8e8e8', overflow: 'auto' }}>
          <div style={{ padding: '12px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
            <Text strong>Changes Overview</Text>
          </div>
          <div style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
            <MonacoEditor
              language="diff"
              theme="vs"
              value={diffResult}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
              height="100%"
            />
          </div>
        </div>
        
        {/* Split diff view section */}
        <div style={{ flex: '1 1 70%', display: 'flex', overflow: 'hidden' }}>
          {/* Previous version */}
          <div style={{ flex: '1 1 50%', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
              <Text strong>
                Previous Version
                {previousVersion && ` (${previousVersion.codeVersion})`}
              </Text>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <MonacoEditor
                language="sql"
                theme="vs"
                value={previousVersion?.content || 'No previous version available for comparison.'}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
                height="100%"
              />
            </div>
          </div>
          
          {/* Current version */}
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
              <Text strong>
                Current Version
                {currentVersion && ` (${currentVersion.codeVersion})`}
              </Text>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <MonacoEditor
                language="sql"
                theme="vs"
                value={currentVersion?.content || ''}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                }}
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CodeCompareModal; 