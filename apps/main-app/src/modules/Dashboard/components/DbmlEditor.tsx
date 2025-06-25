import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Tooltip, Button, Popover, Space, Menu, Modal } from 'antd';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  MoreOutlined,
  BgColorsOutlined
} from '@ant-design/icons';

// Configure Monaco Editor to use CDN (more reliable)
loader.config({
  'vs/nls': {
    availableLanguages: {
      '*': 'en',
    },
  },
});

export interface DbmlEditorProps {
  initialValue?: string;
  dbmlContent?: string;
  projectId?: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  type?: string;
  showDiagramOnly?: boolean;
}

interface TableField {
  name: string;
  type: string;
  isPk: boolean;
  note?: string;
}

interface TableData {
  name: string;
  fields: TableField[];
  x: number;
  y: number;
  color?: string;
}

interface Relationship {
  from: {
    table: string;
    field: string;
  };
  to: {
    table: string;
    field: string;
  };
  type: string;
}

const EditorContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #1e293b;
  border-radius: 12px;
  overflow: hidden;
`;

const EditorPane = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  background-color: #ffffff;
  border: none;
  box-shadow: none;
`;

const CodeEditorPane = styled.div<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  overflow: hidden;
  position: relative;
  transform-origin: left center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background-color: #1e1e1e;
  border-right: 1px solid #e8eef7;
`;

const StatusBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #1e1e1e;
  color: #64748b;
  padding: 4px 16px;
  font-size: 12px;
  z-index: 20;
  text-align: right;
  border-top: 1px solid #374151;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
`;

const DiagramPane = styled.div<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  overflow: hidden;
  background-color: #f8fafc;
  color: #1e293b;
  position: relative;
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex: ${props => props.width === '100%' ? 1 : 'none'};
  border-left: 1px solid #e8eef7;
`;

const Resizer = styled.div`
  width: 10px;
  height: 100%;
  background-color: #e8eef7;
  cursor: col-resize;
  z-index: 30;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e8eef7;
  transition: all 0.2s ease;
  &:hover {
    background-color: #4285f4;
  }
  &:hover::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 30px;
    background-color: #ffffff;
    border-radius: 1px;
  }
`;

const ToggleButton = styled.div`
  position: absolute;
  height: 44px;
  width: 32px;
  background-color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4285f4;
  cursor: pointer;
  z-index: 31;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15);
  border: 1px solid #e8eef7;
  transition: all 0.2s ease;
  &:hover {
    background-color: #4285f4;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.25);
  }
  &:active {
    transform: translateY(0);
  }
`;

const DiagramContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #f8fafc;
`;

const DiagramCanvas = styled.div<{ scale: number }>`
  position: relative;
  width: 3000px;
  height: 3000px;
  transform-origin: 0 0;
  transform: scale(${props => props.scale});
  background-color: #f8fafc;
  background-image: 
    radial-gradient(circle, #e2e8f0 1px, transparent 1px);
  background-size: 20px 20px;
`;

const TableCard = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
  width: 280px;
  cursor: move;
  z-index: 10;
  border: 1px solid #e8eef7;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`;

const TableHeader = styled.div<{ color?: string }>`
  background: ${props => props.color || '#4285f4'};
  color: white;
  padding: 12px 16px;
  font-weight: 600;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const TableName = styled.div`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
`;

const TableMenuButton = styled.div`
  opacity: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const TableWrapper = styled.div`
  position: relative;

  &:hover ${TableMenuButton} {
    opacity: 1;
  }
`;

const TableContent = styled.div`
  padding: 0;
`;

const TableRow = styled.div<{ isEven: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #e8eef7;
  background-color: ${props => props.isEven ? '#f8fafc' : '#ffffff'};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #e8eef7;
  }
  
  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const FieldName = styled.div`
  display: flex;
  align-items: center;
  color: #1e293b;
  font-weight: 500;
  font-size: 13px;
`;

const FieldType = styled.div`
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RelationshipLine = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;

  path {
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.8;
  }
`;

const ZoomControls = styled.div`
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
  background-color: #ffffff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eef7;

  .ant-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background-color: #ffffff;
    color: #4285f4;
    transition: all 0.2s ease;
    font-weight: 500;
    
    &:hover {
      background-color: #4285f4;
      color: #ffffff;
      border-color: #4285f4;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(66, 133, 244, 0.25);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
`;

const MiniMap = styled.div`
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 220px;
  height: 160px;
  background-color: #ffffff;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  overflow: hidden;
  z-index: 20;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const MiniMapContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform: scale(0.05);
  transform-origin: 0 0;
`;

const ViewportIndicator = styled.div<{x: number, y: number, width: number, height: number}>`
  position: absolute;
  top: ${props => props.y}px;
  left: ${props => props.x}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 2px solid #4285f4;
  background-color: rgba(66, 133, 244, 0.15);
  border-radius: 4px;
`;

// Simple parser to extract table names and fields from DBML
const parseDbml = (dbmlCode: string) => {
  const tables: TableData[] = [];
  const relationships: Relationship[] = [];

  // Extract tables using regex
  const tableRegex = /Table\s+([a-zA-Z0-9._]+)(?:\s+as\s+([a-zA-Z0-9_]+))?\s*{([^}]*)}/g;
  let tableMatch;
  let tableIndex = 0;

  while ((tableMatch = tableRegex.exec(dbmlCode)) !== null) {
    const tableName = tableMatch[1];
    const tableContent = tableMatch[3];

    const fields: TableField[] = [];

    // Parse fields
    const fieldLines = tableContent.split('\n').filter(line => line.trim() !== '');

    for (const line of fieldLines) {
      // Skip comments and non-field lines
      if (line.trim().startsWith('//') || line.trim().startsWith('Indexes')) continue;

      const fieldParts = line.trim().split(/\s+/);
      if (fieldParts.length >= 2) {
        const fieldName = fieldParts[0];
        const fieldType = fieldParts[1];

        const isPk = line.includes('[pk') || line.includes('primary key');

        // Extract note if available
        let note;
        const noteMatch = line.match(/note:\s*['"]([^'"]*)['"]/);
        if (noteMatch) {
          note = noteMatch[1];
        }

        fields.push({
          name: fieldName,
          type: fieldType,
          isPk,
          note
        });

        // Check for inline relationship definition [Ref: > users.id]
        const refMatch = line.match(/\[Ref:\s*([<>-]+)\s+([a-zA-Z0-9._]+)\.([a-zA-Z0-9_]+)\]/);
        if (refMatch) {
          const relationType = refMatch[1];
          const toTable = refMatch[2];
          const toField = refMatch[3];

          relationships.push({
            from: {
              table: tableName,
              field: fieldName
            },
            to: {
              table: toTable,
              field: toField
            },
            type: relationType
          });
        }
      }
    }

    tables.push({
      name: tableName,
      fields,
      x: 100 + (tableIndex % 3) * 320,
      y: 100 + Math.floor(tableIndex / 3) * 250
    });

    tableIndex++;
  }

  // Extract traditional relationships (still support both syntaxes)
  const refRegex = /Ref:\s*([a-zA-Z0-9._]+)\.([a-zA-Z0-9_]+)\s*([<>-]+)\s*([a-zA-Z0-9._]+)\.([a-zA-Z0-9_]+)/g;
  let refMatch;

  while ((refMatch = refRegex.exec(dbmlCode)) !== null) {
    const fromTable = refMatch[1];
    const fromField = refMatch[2];
    const relationType = refMatch[3];
    const toTable = refMatch[4];
    const toField = refMatch[5];

    relationships.push({
      from: {
        table: fromTable,
        field: fromField
      },
      to: {
        table: toTable,
        field: toField
      },
      type: relationType
    });
  }

  return { tables, relationships };
};

// Thêm các màu có sẵn để người dùng chọn
const TABLE_COLORS = [
  '#1890ff', // Default blue
  '#13c2c2', // Cyan
  '#52c41a', // Green
  '#faad14', // Gold
  '#fa8c16', // Orange
  '#722ed1', // Purple
  '#eb2f96', // Magenta
  '#f5222d', // Red
  '#2f54eb', // Geekblue
  '#fadb14', // Yellow
];

// Tạo component ColorButton để hiển thị màu
const ColorButton = styled.button<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #d9d9d9;
  cursor: pointer;
  margin: 2px;
  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }
`;

export const DbmlEditor = React.forwardRef<
  { zoomIn: () => void; zoomOut: () => void; fitToView: () => void },
  DbmlEditorProps
>(({
  initialValue = '',
  dbmlContent,
  projectId,
  onChange,
  height = '90vh',
  readOnly = false,
  type = 'dbml',
  showDiagramOnly = false
}, ref) => {
  const [editorValue, setEditorValue] = useState<string>(dbmlContent || initialValue);
  const [paneRatio, setPaneRatio] = useState<number>(0.5); // 50% code, 50% diagram
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [tables, setTables] = useState<TableData[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [scale, setScale] = useState<number>(0.8);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tablePositions, setTablePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [viewportPos, setViewportPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  const [straightLines, setStraightLines] = useState<boolean>(true);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStartPos, setPanStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStartScroll, setPanStartScroll] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lineStyle, setLineStyle] = useState<'straight' | 'curved' | 'orthogonal'>('straight');
  const [colorPickerVisible, setColorPickerVisible] = useState<string | null>(null);
  const [colorModalVisible, setColorModalVisible] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isEditorVisible, setIsEditorVisible] = useState<boolean>(!showDiagramOnly);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const resizerRef = useRef<HTMLDivElement | null>(null);
  const miniMapRef = useRef<HTMLDivElement | null>(null);

  console.log("DbmlEditor readOnly prop:", readOnly);

  const handleEditorChange = (newValue: string | undefined) => {
    const code = newValue || '';
    setEditorValue(code);

    if (onChange) {
      onChange(code);
    }

    // Parse DBML on change
    try {
      const parsed = parseDbml(code);

      // Preserve positions of existing tables
      const updatedTables = parsed.tables.map(newTable => {
        const existingTable = tables.find(t => t.name === newTable.name);
        if (existingTable) {
          return {
            ...newTable,
            x: existingTable.x,
            y: existingTable.y
          };
        }
        return newTable;
      });

      setTables(updatedTables);
      setRelationships(parsed.relationships);

      // Clear previous markers
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monaco.editor.setModelMarkers(model, 'dbml', []);
        }
      }
    } catch (error: any) {
      console.error('Error parsing DBML:', error);
      // Add error markers to Monaco editor
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const marker: monaco.editor.IMarkerData = {
            startLineNumber: 1, // Simple error marking, can be improved
            startColumn: 1,
            endLineNumber: model.getLineCount(),
            endColumn: model.getLineMaxColumn(model.getLineCount()),
            message: error.message || "Invalid DBML syntax",
            severity: monaco.MarkerSeverity.Error,
          };
          monaco.editor.setModelMarkers(model, 'dbml', [marker]);
        }
      }
    }
  };

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    console.log('Monaco Editor mounted successfully');
    editorRef.current = editor;

    try {
      // Register a custom language (only if not already registered)
      const languages = monacoInstance.languages.getLanguages();
      const dbmlLanguageExists = languages.some(lang => lang.id === 'dbml');
      
      if (!dbmlLanguageExists) {
        monacoInstance.languages.register({ id: 'dbml' });

        // Register a tokens provider for the language with custom colors
        monacoInstance.languages.setMonarchTokensProvider('dbml', {
          tokenizer: {
            root: [
              [/\b(Table|Ref|Project|TableGroup|enum)\b/, "keyword"],
              [/\b(varchar|int|timestamp|boolean|text|longtext|date|json)\b/, "type"],
              [/\b(note|pk|primary key|unique|not null|increment|default|ref)\b/, "predefined"],
              [/'[^']*'/, "string"],
              [/"[^"]*"/, "string"],
              [/\{|\}|\[|\]/, "delimiter.bracket"],
              [/[,;:]/, "delimiter"],
              [/\/\/.*$/, "comment"],
              [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],
              [/\d+/, "number"],
            ],
          },
        });

        // Define custom theme for DBML with dark colors matching the image
        monacoInstance.editor.defineTheme('dbml-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'keyword', foreground: '569CD6' }, // Light blue for Table, Ref, etc.
            { token: 'type', foreground: '4EC9B0' }, // Teal for data types
            { token: 'predefined', foreground: 'DCDCAA' }, // Yellow for note, pk, etc.
            { token: 'string', foreground: 'CE9178' }, // Orange for strings
            { token: 'comment', foreground: '6A9955' }, // Green for comments
            { token: 'identifier', foreground: '9CDCFE' }, // Light blue for identifiers
            { token: 'delimiter.bracket', foreground: 'D4D4D4' }, // Gray for brackets
            { token: 'delimiter', foreground: 'D4D4D4' }, // Gray for delimiters
            { token: 'number', foreground: 'B5CEA8' }, // Light green for numbers
          ],
          colors: {
            'editor.background': '#1E1E1E',
            'editor.foreground': '#D4D4D4',
            'editorLineNumber.foreground': '#858585',
            'editorLineNumber.activeForeground': '#C6C6C6',
          }
        });
      }

      // Set custom theme
      monacoInstance.editor.setTheme('dbml-dark');

      // Configure editor performance options
      editor.updateOptions({
        minimap: { enabled: false }, // Disable minimap for better performance
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        smoothScrolling: true,
        acceptSuggestionOnEnter: 'on',
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        }
      });

      // Update cursor position
      editor.onDidChangeCursorPosition(e => {
        setCursorPosition({
          line: e.position.lineNumber,
          column: e.position.column
        });
      });

      console.log('Monaco Editor configured successfully');
    } catch (error) {
      console.error('Error configuring Monaco Editor:', error);
    }
  };

  // Parse initial value
  useEffect(() => {
    const contentToUse = dbmlContent || initialValue;
    if (contentToUse) {
      setEditorValue(contentToUse);
      try {
        const parsed = parseDbml(contentToUse);
        setTables(parsed.tables);
        setRelationships(parsed.relationships);
      } catch (error) {
        console.error('Error parsing initial DBML:', error);
      }
    }
  }, [initialValue, dbmlContent]);

  // Handle table drag start
  const handleTableMouseDown = (e: React.MouseEvent, tableName: string) => {
    if (e.button !== 0) return; // Only left mouse button

    const tableElement = e.currentTarget as HTMLElement;
    const rect = tableElement.getBoundingClientRect();

    // Calculate offset between mouse position and table top-left corner
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggedTable(tableName);
    setDragStartPos({ x: offsetX, y: offsetY });

    e.preventDefault();
  };

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedTable || !diagramRef.current) return;

    const diagramRect = diagramRef.current.getBoundingClientRect();
    const scrollLeft = diagramRef.current.scrollLeft;
    const scrollTop = diagramRef.current.scrollTop;

    // Calculate new position considering scroll position, scale, and drag offset
    const x = (e.clientX - diagramRect.left + scrollLeft) / scale - dragStartPos.x;
    const y = (e.clientY - diagramRect.top + scrollTop) / scale - dragStartPos.y;

    setTables(prevTables =>
      prevTables.map(table =>
        table.name === draggedTable
          ? { ...table, x, y }
          : table
      )
    );
  }, [draggedTable, scale, dragStartPos]);

  // Handle mouse up to end dragging
  const handleMouseUp = useCallback(() => {
    setDraggedTable(null);
  }, []);

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (draggedTable) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedTable, handleMouseMove, handleMouseUp]);

  // Update viewport position for minimap
  useEffect(() => {
    const updateViewport = () => {
      if (diagramRef.current) {
        const diagramRect = diagramRef.current.getBoundingClientRect();
        const scrollLeft = diagramRef.current.scrollLeft;
        const scrollTop = diagramRef.current.scrollTop;

        setViewportPos({
          x: scrollLeft / scale,
          y: scrollTop / scale
        });
      }
    };

    const diagram = diagramRef.current;
    if (diagram) {
      diagram.addEventListener('scroll', updateViewport);
      window.addEventListener('resize', updateViewport);
      updateViewport();
    }

    return () => {
      if (diagram) {
        diagram.removeEventListener('scroll', updateViewport);
        window.removeEventListener('resize', updateViewport);
      }
    };
  }, [scale]);

  // Zoom in function
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  };

  // Zoom out function
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.3));
  };

  // Reset zoom
  const resetZoom = () => {
    setScale(1.0);
  };

  // Fit diagram to view
  const fitToView = () => {
    if (!diagramRef.current) return;

    // Find diagram bounds
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    if (tables.length === 0) {
      setScale(1.0);
      return;
    }

    tables.forEach(table => {
      minX = Math.min(minX, table.x);
      minY = Math.min(minY, table.y);
      maxX = Math.max(maxX, table.x + 280); // table width
      maxY = Math.max(maxY, table.y + table.fields.length * 36 + 40); // header + fields
    });

    // Add padding
    minX -= 50;
    minY -= 50;
    maxX += 50;
    maxY += 50;

    const diagramWidth = diagramRef.current.clientWidth;
    const diagramHeight = diagramRef.current.clientHeight;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) {
      setScale(1.0);
      return;
    }

    // Calculate scale to fit
    const scaleX = diagramWidth / contentWidth;
    const scaleY = diagramHeight / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1.0); // Cap at 1.0 to prevent too much zoom

    setScale(newScale);

    // Scroll to center
    setTimeout(() => {
      if (diagramRef.current) {
        diagramRef.current.scrollLeft = (minX * newScale);
        diagramRef.current.scrollTop = (minY * newScale);
      }
    }, 50);
  };

  // Toggle line style
  const toggleLineStyle = () => {
    // Rotate through the three line styles
    if (lineStyle === 'straight') {
      setLineStyle('curved');
    } else if (lineStyle === 'curved') {
      setLineStyle('orthogonal');
    } else {
      setLineStyle('straight');
    }
  };

  // Find coordinates for relationship lines
  const getRelationshipCoordinates = (relationship: Relationship) => {
    const fromTable = tables.find(t => t.name === relationship.from.table);
    const toTable = tables.find(t => t.name === relationship.to.table);

    if (!fromTable || !toTable) return null;

    // Find field positions
    const fromFieldIndex = fromTable.fields.findIndex(f => f.name === relationship.from.field);
    const toFieldIndex = toTable.fields.findIndex(f => f.name === relationship.to.field);

    if (fromFieldIndex === -1 || toFieldIndex === -1) return null;

    // Calculate field y positions (header height + field height * index)
    const headerHeight = 40;
    const fieldHeight = 36;

    const tableWidth = 280;

    // Determine table positions
    const fromTableCenterX = fromTable.x + tableWidth/2;
    const fromTableCenterY = fromTable.y + headerHeight + (fromTable.fields.length * fieldHeight)/2;

    const toTableCenterX = toTable.x + tableWidth/2;
    const toTableCenterY = toTable.y + headerHeight + (toTable.fields.length * fieldHeight)/2;

    // Calculate central positions for fields
    const fromY = fromTable.y + headerHeight + fieldHeight * fromFieldIndex + fieldHeight / 2;
    const toY = toTable.y + headerHeight + fieldHeight * toFieldIndex + fieldHeight / 2;

    // Determine which sides of the tables to connect based on their relative positions
    let fromX, toX;

    // Check if tables are more horizontal or vertical to each other
    const dx = Math.abs(toTableCenterX - fromTableCenterX);
    const dy = Math.abs(toTableCenterY - fromTableCenterY);

    if (dx > dy) {
      // Tables are more horizontally aligned
      if (fromTableCenterX < toTableCenterX) {
        // FromTable is to the left of ToTable
        fromX = fromTable.x + tableWidth; // Right side of fromTable
        toX = toTable.x; // Left side of toTable
      } else {
        // FromTable is to the right of ToTable
        fromX = fromTable.x; // Left side of fromTable
        toX = toTable.x + tableWidth; // Right side of toTable
      }
    } else {
      // Tables are more vertically aligned
      if (fromTableCenterY < toTableCenterY) {
        // FromTable is above ToTable
        fromX = fromTable.x + (relationship.from.field === relationship.to.field ? 40 : 80); // Offset from left edge
        toX = toTable.x + (relationship.from.field === relationship.to.field ? 40 : 120); // Offset from left edge
      } else {
        // FromTable is below ToTable
        fromX = fromTable.x + (relationship.from.field === relationship.to.field ? 120 : 200); // Offset from left edge
        toX = toTable.x + (relationship.from.field === relationship.to.field ? 200 : 160); // Offset from left edge
      }
    }

    return { fromX, fromY, toX, toY };
  };

  // Draw arrow based on relationship type and line style
  const getArrowPath = (coords: { fromX: number, fromY: number, toX: number, toY: number }, type: string) => {
    const { fromX, fromY, toX, toY } = coords;

    // Path for the line
    let path = '';

    // Hướng từ điểm bắt đầu đến điểm kết thúc
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (lineStyle === 'straight') {
      // Simple straight line
      path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else if (lineStyle === 'curved') {
      // Bezier curve with improved control points
      // Tính toán độ cong dựa trên khoảng cách giữa 2 điểm
      const controlLen = Math.min(distance * 0.4, 150);

      // Tính toán hướng ra cho đường cong
      const isHorizontal = Math.abs(dx) > Math.abs(dy);

      if (isHorizontal) {
        // Đường cong ngang
      path = `M ${fromX} ${fromY} C ${fromX + controlLen} ${fromY}, ${toX - controlLen} ${toY}, ${toX} ${toY}`;
      } else {
        // Đường cong dọc với offset để tránh chồng lên schema
        const offsetX = 30;
        const midY = (fromY + toY) / 2;

        // Xác định xem nên offset về bên nào
        const fromOffsetX = dx > 0 ? fromX + offsetX : fromX - offsetX;
        const toOffsetX = dx > 0 ? toX + offsetX : toX - offsetX;

        path = `M ${fromX} ${fromY}
                Q ${fromOffsetX} ${fromY} ${fromOffsetX} ${fromY + (midY - fromY) * 0.3}
                L ${fromOffsetX} ${midY}
                L ${toOffsetX} ${midY}
                Q ${toOffsetX} ${toY - (toY - midY) * 0.3} ${toX} ${toY}`;
      }
    } else if (lineStyle === 'orthogonal') {
      // Orthogonal line with improved routing
      const isHorizontal = Math.abs(dx) > Math.abs(dy);
      const radius = 15; // Corner radius

      if (isHorizontal) {
        // Horizontal dominant routing
      const midX = (fromX + toX) / 2;

      path = `M ${fromX} ${fromY}
              H ${midX - radius}
              Q ${midX} ${fromY} ${midX} ${fromY + (toY > fromY ? radius : -radius)}
              V ${toY - (toY > fromY ? radius : -radius)}
              Q ${midX} ${toY} ${midX + radius} ${toY}
              H ${toX}`;
      } else {
        // Vertical dominant routing - use offset to avoid crossing tables
        const offsetX = 40; // Offset to avoid schema

        // Xác định xem nên offset về bên nào
        const direction = dx > 0 ? 1 : -1;
        const fromOffsetX = fromX + (offsetX * direction);
        const toOffsetX = toX + (offsetX * direction);

        path = `M ${fromX} ${fromY}
                H ${fromOffsetX}
                V ${toY}
                H ${toX}`;
      }
    }

    // Arrow head
    const arrowSize = 8;

    // Calculate angle for arrow heads based on connection approach
    let arrowAngle;

    if (lineStyle === 'orthogonal') {
      // For orthogonal, arrow head direction depends on the final segment
      if (Math.abs(dx) > Math.abs(dy)) {
        // Last segment is horizontal
        arrowAngle = dx > 0 ? 0 : Math.PI;
      } else {
        // Last segment is vertical
        arrowAngle = dy > 0 ? Math.PI/2 : -Math.PI/2;
      }
    } else {
      // For curved and straight, use the direct angle
      arrowAngle = Math.atan2(toY - fromY, toX - fromX);
    }

    // Draw different arrow heads based on relationship type
    if (type === '>') {
      // One-to-many: arrow at 'to' side
      path += ` M ${toX} ${toY} L ${toX - arrowSize * Math.cos(arrowAngle - Math.PI/6)} ${toY - arrowSize * Math.sin(arrowAngle - Math.PI/6)} L ${toX - arrowSize * Math.cos(arrowAngle + Math.PI/6)} ${toY - arrowSize * Math.sin(arrowAngle + Math.PI/6)} Z`;
    } else if (type === '<') {
      // Many-to-one: arrow at 'from' side
      const fromArrowAngle = arrowAngle + Math.PI;
      path += ` M ${fromX} ${fromY} L ${fromX + arrowSize * Math.cos(fromArrowAngle - Math.PI/6)} ${fromY + arrowSize * Math.sin(fromArrowAngle - Math.PI/6)} L ${fromX + arrowSize * Math.cos(fromArrowAngle + Math.PI/6)} ${fromY + arrowSize * Math.sin(fromArrowAngle + Math.PI/6)} Z`;
    } else if (type === '<>') {
      // Many-to-many: arrows at both sides
      path += ` M ${toX} ${toY} L ${toX - arrowSize * Math.cos(arrowAngle - Math.PI/6)} ${toY - arrowSize * Math.sin(arrowAngle - Math.PI/6)} L ${toX - arrowSize * Math.cos(arrowAngle + Math.PI/6)} ${toY - arrowSize * Math.sin(arrowAngle + Math.PI/6)} Z`;

      const fromArrowAngle = arrowAngle + Math.PI;
      path += ` M ${fromX} ${fromY} L ${fromX + arrowSize * Math.cos(fromArrowAngle - Math.PI/6)} ${fromY + arrowSize * Math.sin(fromArrowAngle - Math.PI/6)} L ${fromX + arrowSize * Math.cos(fromArrowAngle + Math.PI/6)} ${fromY + arrowSize * Math.sin(fromArrowAngle + Math.PI/6)} Z`;
    }

    return path;
  };

  // Get color based on relationship type
  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'one-to-one':
        return '#4285f4';
      case 'one-to-many':
        return '#34a853';
      case 'many-to-one':
        return '#fbbc05';
      case 'many-to-many':
        return '#ea4335';
      default:
        return '#4285f4';
    }
  };

  // Get label for line style button
  const getLineStyleLabel = () => {
    switch (lineStyle) {
      case 'straight': return '━━━';
      case 'curved': return '⟿';
      case 'orthogonal': return '┏━┓';
      default: return '━━━';
    }
  };

  // Handle resizing
  const handleResizerMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;

    // Calculate percentages
    const leftPercentage = (mouseX / containerWidth) * 100;
    const rightPercentage = 100 - leftPercentage;

    // Set minimum sizes (20%)
    if (leftPercentage < 20 || rightPercentage < 20) return;

    setPaneRatio(leftPercentage / 100);

    // Refresh editor when resizing stops
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [isDragging]);

  const handleResizerMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleResizerMouseMove);
    document.removeEventListener('mouseup', handleResizerMouseUp);

    // Refresh editor after resize
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [handleResizerMouseMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleResizerMouseMove);
    document.addEventListener('mouseup', handleResizerMouseUp);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizerMouseMove);
      document.removeEventListener('mouseup', handleResizerMouseUp);
    };
  }, [handleResizerMouseMove, handleResizerMouseUp]);

  // Hàm xử lý thay đổi màu bảng
  const handleTableColorChange = (tableName: string, color: string) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.name === tableName ? { ...table, color } : table
      )
    );
    // Đóng modal sau khi chọn màu
    setColorModalVisible(false);
  };

  // Hàm mở modal chọn màu
  const openColorPicker = (tableName: string) => {
    setSelectedTable(tableName);
    setColorModalVisible(true);
  };

  // Toggle editor visibility
  const toggleEditor = () => {
    // Toggle editor visibility state
    setIsEditorVisible(!isEditorVisible);

    // Adjust pane ratio with smooth transition
    if (isEditorVisible) {
      // If currently visible -> hide
      setPaneRatio(0.01);
    } else {
      // If currently hidden -> show
      setPaneRatio(0.5);
    }

    // Refresh editor layout after animation completes
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.layout();
      }, 300);
    }
  };

  // Fit diagram to view when tables are loaded
  useEffect(() => {
    if (tables.length > 0) {
      // Add a small delay to ensure the diagram is rendered
      const timer = setTimeout(() => {
        fitToView();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [tables.length, showDiagramOnly]);

  // Expose zoom methods via ref
  React.useImperativeHandle(ref, () => ({
    zoomIn: () => {
      zoomIn();
    },
    zoomOut: () => {
      zoomOut();
    },
    fitToView: () => {
      fitToView();
    }
  }));

  // Return the JSX element
  return (
    <EditorContainer style={{ height }}>
      <EditorPane ref={containerRef}>
        {!showDiagramOnly && (
          <>
            <CodeEditorPane
              width={`${paneRatio * 100}%`}
              style={{
                opacity: isEditorVisible ? 1 : 0,
                transform: isEditorVisible ? 'translateX(0) scaleX(1)' : 'translateX(-50px) scaleX(0.9)',
                pointerEvents: isEditorVisible ? 'auto' : 'none'
              }}
            >
          <Editor
            height="100%"
            language="dbml"
            theme="dbml-dark"
            value={editorValue}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            loading={<div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              background: '#1e1e1e',
              color: '#d4d4d4'
            }}>
              <div>
                <div>⚡ Loading Editor...</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Please wait a moment</div>
              </div>
            </div>}
            options={{
              readOnly: readOnly,
              wordWrap: 'on',
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineHeight: 22,
              tabSize: 2,
              insertSpaces: true,
              renderLineHighlight: 'line',
              selectOnLineNumbers: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              contextmenu: false // Disable context menu for performance
            }}
          />
          <StatusBar>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </StatusBar>
        </CodeEditorPane>
        <Resizer
          ref={resizerRef}
          onMouseDown={handleMouseDown}
              style={{ display: isEditorVisible ? 'flex' : 'block', width: isEditorVisible ? '10px' : '4px' }}
            >
              <ToggleButton onClick={(e) => {
                e.stopPropagation(); // Ngăn không cho sự kiện click lan sang resizer
                toggleEditor();
              }}
              style={{
                transform: `rotate(${isEditorVisible ? 0 : 180}deg)`,
                transition: 'transform 0.3s ease'
              }}
              >
                {isEditorVisible ? '◀' : '▶'}
              </ToggleButton>
            </Resizer>
          </>
        )}
        <DiagramPane width={showDiagramOnly ? '100%' : (isEditorVisible ? `${(1 - paneRatio) * 100}%` : '100%')}>
          <DiagramContainer ref={diagramRef}>
            <DiagramCanvas scale={scale}>
              {/* Relationship lines */}
              <RelationshipLine>
                {relationships.map((rel, index) => {
                  const coords = getRelationshipCoordinates(rel);
                  if (!coords) return null;

                  const path = getArrowPath(coords, rel.type);
                  const color = getRelationshipColor(rel.type);

                  return (
                    <g key={`rel-${index}`}>
                      <path
                        d={path}
                        stroke={color}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={rel.type === '-' ? '5,3' : undefined}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={path}
                        stroke="transparent"
                        strokeWidth="10"
                        fill="none"
                      />
                    </g>
                  );
                })}
              </RelationshipLine>

              {/* Tables */}
              {tables.map((table, tableIndex) => (
                <TableCard
                  key={tableIndex}
                  x={table.x}
                  y={table.y}
                  onMouseDown={(e) => {
                    // Chỉ xử lý kéo thả khi click vào bảng, không phải vào nút menu
                    if (!e.currentTarget.querySelector('.table-menu-trigger')?.contains(e.target as Node)) {
                      handleTableMouseDown(e, table.name);
                    }
                  }}
                >
                  <TableWrapper>
                    <TableHeader color={table.color}>
                      <TableName>{table.name}</TableName>
                      <Popover
                        trigger="click"
                        placement="rightTop"
                        title="Tùy chọn bảng"
                        content={
                          <Menu
                            style={{ border: 'none', boxShadow: 'none', minWidth: '120px' }}
                            items={[
                              {
                                key: 'change-color',
                                icon: <BgColorsOutlined />,
                                label: 'Đổi màu',
                                onClick: () => openColorPicker(table.name)
                              }
                            ]}
                          />
                        }
                      >
                        <TableMenuButton className="table-menu-trigger">
                          <MoreOutlined style={{ color: 'white', fontSize: '16px' }} />
                        </TableMenuButton>
                      </Popover>
                    </TableHeader>
                    <TableContent>
                      {table.fields.map((field, fieldIndex) => (
                        <Tooltip
                          key={fieldIndex}
                          title={field.note || `${field.name}: ${field.type}`}
                          placement="right"
                        >
                          <TableRow isEven={fieldIndex % 2 === 0}>
                            <FieldName>
                              {field.isPk && <span style={{ color: '#faad14', marginRight: '5px' }}>🔑</span>}
                              {field.name}
                            </FieldName>
                            <FieldType>{field.type}</FieldType>
                          </TableRow>
                        </Tooltip>
                      ))}
                    </TableContent>
                  </TableWrapper>
                </TableCard>
              ))}
            </DiagramCanvas>
          </DiagramContainer>

          {/* MiniMap */}
          <MiniMap>
            <MiniMapContent>
              {tables.map((table, tableIndex) => (
                <div
                  key={`mini-${tableIndex}`}
                  style={{
                    position: 'absolute',
                    left: table.x,
                    top: table.y,
                    width: 280,
                    height: table.fields.length * 36 + 40,
                    background: table.color || '#1890ff',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
              ))}
              <ViewportIndicator
                x={viewportPos.x}
                y={viewportPos.y}
                width={280}
                height={tables.length * 36 + 40}
              />
            </MiniMapContent>
          </MiniMap>

          {/* Zoom controls */}
          <ZoomControls>
            <Button icon={<ZoomInOutlined />} onClick={zoomIn} title="Zoom in"/>
            <Button icon={<ZoomOutOutlined />} onClick={zoomOut} title="Zoom out"/>
            <Button icon={<FullscreenOutlined />} onClick={fitToView} title="Fit to view" />
            <Button
              onClick={toggleLineStyle}
              title="Thay đổi kiểu đường nối"
              icon={<span style={{ fontSize: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{getLineStyleLabel()}</span>}
            />
          </ZoomControls>
        </DiagramPane>
      </EditorPane>

      {/* Modal chọn màu */}
      <Modal
        title="Chọn màu cho bảng"
        open={colorModalVisible}
        onCancel={() => setColorModalVisible(false)}
        footer={null}
        width={300}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {TABLE_COLORS.map(color => (
            <Button
              key={color}
              type="text"
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                margin: '4px',
                backgroundColor: color,
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
              }}
              onClick={() => selectedTable && handleTableColorChange(selectedTable, color)}
            />
          ))}
        </div>
      </Modal>
    </EditorContainer>
  );
});

export default DbmlEditor;
