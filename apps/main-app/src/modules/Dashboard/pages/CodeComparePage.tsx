import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, Row, Col, Collapse } from 'antd';
import { Editor, DiffEditor } from '@monaco-editor/react';
import * as diff from 'diff'; // Vẫn dùng để phân tích văn bản
import { getProjectVersions, VersionInfo } from '../services/changelog.service';

// Icons for the summary (using simple characters or Ant Design Icons if installed)
import { PlusCircleOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'; // Cần cài đặt @ant-design/icons

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Định nghĩa các kiểu thay đổi và biểu tượng
type ChangeType = 'added' | 'removed' | 'modified';

interface SummaryItem {
  type: 'Table' | 'Enum' | 'Ref' | 'Note' | 'Other'; // Thêm các loại đối tượng DBML khác
  name: string; // Tên của bảng, enum, ref, v.v.
  change: ChangeType; // Loại thay đổi: added, removed, modified
  detailCount?: number; // Số lượng thay đổi chi tiết bên trong (ví dụ: số cột thay đổi)
}

// =========================================================
// Hàm phân tích sự thay đổi để tạo summary (Cải tiến)
// Vẫn là MÔ PHỎNG phân tích cú pháp, sử dụng regex đơn giản.
// =========================================================
const analyzeChangesForSummary = (oldContent: string, newContent: string): SummaryItem[] => {
  const summary: SummaryItem[] = [];
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  // Regex cơ bản để nhận diện các đối tượng DBML
  const tableRegex = /^\s*Table\s+([\w\.]+)\s*{/i; // Bắt Public.TableName
  const enumRegex = /^\s*Enum\s+([\w\.]+)\s*{/i;
  const refRegex = /^\s*Ref:\s+([\w\.\s\-<>]+)\s*$/i; // Ref: orders.customer_id > customers.id
  const projectRegex = /^\s*Project\s+([\w\.]+)\s*{/i; // Project my_project {

  // Bước 1: Thu thập tất cả các đối tượng trong cả hai phiên bản
  const extractObjects = (contentLines: string[]) => {
    const objects = new Map<string, { type: string, fullDefinition: string[] }>();
    let currentObject: { type: string, name: string, definitionLines: string[], startIndex: number, endIndex: number } | null = null;
    let braceCount = 0;

    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      const trimmedLine = line.trim();

      // Start of an object
      if (trimmedLine.match(tableRegex)) {
        const match = trimmedLine.match(tableRegex)!;
        currentObject = { type: 'Table', name: match[1], definitionLines: [line], startIndex: i, endIndex: -1 };
        braceCount = (trimmedLine.match(/{/g) || []).length;
      } else if (trimmedLine.match(enumRegex)) {
        const match = trimmedLine.match(enumRegex)!;
        currentObject = { type: 'Enum', name: match[1], definitionLines: [line], startIndex: i, endIndex: -1 };
        braceCount = (trimmedLine.match(/{/g) || []).length;
      } else if (trimmedLine.match(projectRegex)) {
        const match = trimmedLine.match(projectRegex)!;
        currentObject = { type: 'Project', name: match[1], definitionLines: [line], startIndex: i, endIndex: -1 };
        braceCount = (trimmedLine.match(/{/g) || []).length;
      } else if (trimmedLine.match(refRegex)) {
        const match = trimmedLine.match(refRegex)!;
        // Relationships are single-line, treat them as complete objects
        objects.set(`Ref: ${match[1]}`, { type: 'Ref', fullDefinition: [line] });
        currentObject = null; // Reset
      } else if (currentObject) {
        currentObject.definitionLines.push(line);
        braceCount += (trimmedLine.match(/{/g) || []).length;
        braceCount -= (trimmedLine.match(/}/g) || []).length;

        if (braceCount === 0 && trimmedLine.endsWith('}')) { // End of object
          currentObject.endIndex = i;
          objects.set(`${currentObject.type}: ${currentObject.name}`, {
            type: currentObject.type,
            fullDefinition: currentObject.definitionLines,
          });
          currentObject = null;
        }
      }
    }
    return objects;
  };

  const oldObjects = extractObjects(oldLines);
  const newObjects = extractObjects(newLines);

  const allObjectKeys = new Set([...Array.from(oldObjects.keys()), ...Array.from(newObjects.keys())]);

  allObjectKeys.forEach(key => {
    const oldObj = oldObjects.get(key);
    const newObj = newObjects.get(key);

    const [objType, objName] = key.split(': ', 2); // Tách loại và tên

    if (oldObj && !newObj) {
      summary.push({ type: objType as any, name: objName, change: 'removed' });
    } else if (!oldObj && newObj) {
      summary.push({ type: objType as any, name: objName, change: 'added' });
    } else if (oldObj && newObj) {
      // Đối với các đối tượng tồn tại ở cả hai phiên bản, kiểm tra xem có thay đổi nội dung không
      const oldDef = oldObj.fullDefinition.join('\n');
      const newDef = newObj.fullDefinition.join('\n');
      if (oldDef !== newDef) {
        // Có thể tính toán detailCount ở đây bằng cách dùng diff trên fullDefinition
        const internalDiff = diff.diffLines(oldDef, newDef);
        const addedLines = internalDiff.filter(p => p.added).length;
        const removedLines = internalDiff.filter(p => p.removed).length;
        const detailCount = addedLines + removedLines; // Số dòng bị thêm/bớt
        summary.push({ type: objType as any, name: objName, change: 'modified', detailCount: detailCount > 0 ? detailCount : undefined });
      }
    }
  });

  // Sắp xếp các mục tóm tắt theo loại thay đổi (thêm, sửa, xóa) và sau đó theo tên
  summary.sort((a, b) => {
    const order = { 'added': 1, 'modified': 2, 'removed': 3 };
    if (order[a.change] !== order[b.change]) {
      return order[a.change] - order[b.change];
    }
    return a.name.localeCompare(b.name);
  });

  return summary;
};

const CodeComparePage: React.FC = () => {
  const { projectId, versionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null);
  const [previousVersion, setPreviousVersion] = useState<VersionInfo | null>(null);
  const [oldContent, setOldContent] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const versions = await getProjectVersions(projectId!);
        const current = versions.find(v => v.id === versionId);

        if (!current) {
          setLoading(false);
          return;
        }
        setCurrentVersion(current);

        const prev = versions.find(v => v.codeVersion === current.codeVersion - 1);
        setPreviousVersion(prev || null);

        setOldContent(prev?.content || '');
        setNewContent(current.content || '');

      } catch (error) {
        console.error('Lỗi khi tải phiên bản:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [projectId, versionId, navigate]);

  const changeSummary = useMemo(() => {
    if (!loading && currentVersion) {
      return analyzeChangesForSummary(oldContent, newContent);
    }
    return null;
  }, [loading, currentVersion, oldContent, newContent]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  // Helper function to get icon based on change type
  const getChangeIcon = (changeType: ChangeType) => {
    switch (changeType) {
      case 'added':
        return <PlusCircleOutlined style={{ color: '#52c41a' }} />;
      case 'removed':
        return <MinusCircleOutlined style={{ color: '#f5222d' }} />;
      case 'modified':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return null;
    }
  };

  // Helper function to get text color based on change type
  const getChangeTextColor = (changeType: ChangeType) => {
    switch (changeType) {
      case 'added':
        return '#52c41a';
      case 'removed':
        return '#f5222d';
      case 'modified':
        return '#faad14';
      default:
        return '#333';
    }
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#fafbfc' }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>Quay lại</Button>
      <Title level={3} style={{ marginBottom: 16 }}>So sánh mã nguồn</Title>

      <Row gutter={[24, 24]}>
        {/* Cột cho Summary bên trái */}
        <Col span={6}>
          <Card
            title={<Text strong>Tóm tắt thay đổi</Text>}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)', height: '100%' }}
            bodyStyle={{ padding: '0 12px' }} // Điều chỉnh padding cho body Card
          >
            {changeSummary && changeSummary.length > 0 ? (
              <Collapse bordered={false} defaultActiveKey={['summary-panel']} expandIconPosition="end">
                <Panel
                  header={<Text strong>Các thay đổi tổng quan</Text>}
                  key="summary-panel"
                  style={{ borderBottom: 'none' }} // Xóa border dưới cùng của Panel
                >
                  {changeSummary.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 8,
                      fontSize: 14,
                      color: getChangeTextColor(item.change),
                      fontWeight: 500,
                    }}>
                      {getChangeIcon(item.change)}
                      <span style={{ marginLeft: 8 }}>
                        {item.type} <Text code style={{ color: getChangeTextColor(item.change) }}>{item.name}</Text>
                        {item.detailCount !== undefined && item.detailCount > 0 && (
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            ({item.detailCount})
                          </Text>
                        )}
                      </span>
                    </div>
                  ))}
                </Panel>
              </Collapse>
            ) : (
              <Text type="secondary">Không có thay đổi nào giữa các phiên bản.</Text>
            )}
          </Card>
        </Col>

        {/* Cột cho Diff Editor chính bên phải */}
        <Col span={18}>
          <Card
            style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 24px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fff',
              borderRadius: '8px 8px 0 0'
            }}>
              <Text strong>Phiên bản trước: <Text type="secondary">{previousVersion ? `v${previousVersion.codeVersion}` : 'Không có'}</Text></Text>
              <Text strong>Phiên bản hiện tại: <Text type="secondary">{currentVersion ? `v${currentVersion.codeVersion}` : 'Không có'}</Text></Text>
            </div>

            <DiffEditor
              height="70vh"
              language="sql"
              theme="vs"
              original={oldContent || '// Không có phiên bản trước'}
              modified={newContent || '// Nội dung phiên bản hiện tại trống'}
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                contextmenu: false,
                folding: false,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                diffWordWrap: true,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* CSS tùy chỉnh cho Summary Card và Ant Design overrides */}
      <style>{`
        /* Ant Design overrides */
        .ant-collapse-item {
            border-bottom: none !important;
        }
        .ant-collapse-header {
            padding: 12px 0 !important;
            border-bottom: 1px solid #f0f0f0 !important;
            font-weight: 600; /* Làm đậm header */
        }
        .ant-collapse-content-box {
            padding: 12px 0 !important;
        }
        .ant-collapse > .ant-collapse-item:last-child > .ant-collapse-header {
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        .ant-collapse-borderless > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
            padding: 0px 0 !important;
        }
      `}</style>
    </div>
  );
};

export default CodeComparePage;
