import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Tooltip, Button } from 'antd';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  FullscreenOutlined
} from '@ant-design/icons';

// Configure Monaco Editor to use local files
loader.config({
  paths: {
    vs: '/node_modules/monaco-editor/min/vs',
  },
});

interface DbmlEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  type?: string;
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
  background-color: #1e1e1e;
  color: #fff;
`;

const EditorPane = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
`;

const CodeEditorPane = styled.div<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: width 0.2s ease;
`;

const StatusBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #007acc;
  color: white;
  padding: 2px 10px;
  font-size: 12px;
  z-index: 20;
  text-align: right;
`;

const DiagramPane = styled.div<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
  color: #333;
  position: relative;
  transition: width 0.2s ease;
`;

const Resizer = styled.div`
  width: 10px;
  height: 100%;
  background-color: #2d2d2d;
  cursor: col-resize;
  z-index: 30;
  &:hover {
    background-color: #3d3d3d;
  }
`;

const DiagramContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #f5f5f5;
`;

const DiagramCanvas = styled.div<{ scale: number }>`
  position: relative;
  width: 3000px;
  height: 3000px;
  transform-origin: 0 0;
  transform: scale(${props => props.scale});
`;

const TableCard = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 280px;
  cursor: move;
  z-index: 10;
`;

const TableHeader = styled.div`
  background: #1890ff;
  color: white;
  padding: 10px;
  font-weight: bold;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
`;

const TableContent = styled.div`
  padding: 0;
`;

const TableRow = styled.div<{ isEven: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;
  background-color: ${props => props.isEven ? '#f9f9f9' : 'white'};
`;

const FieldName = styled.div`
  display: flex;
  align-items: center;
`;

const FieldType = styled.div`
  color: #666;
  font-size: 0.9em;
`;

const RelationshipLine = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 3000px;
  height: 3000px;
  pointer-events: none;
  z-index: 5;
`;

const ZoomControls = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const MiniMap = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 150px;
  height: 100px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 100;
  overflow: hidden;
`;

const MiniMapContent = styled.div`
  transform: scale(0.1);
  transform-origin: 0 0;
  width: 1000%;
  height: 1000%;
  position: relative;
`;

const ViewportIndicator = styled.div<{ x: number; y: number; width: number; height: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 2px solid #1890ff;
  background: rgba(24, 144, 255, 0.1);
  z-index: 101;
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

export const DbmlEditor: React.FC<DbmlEditorProps> = ({
  initialValue = '',
  onChange,
  height = '100vh',
  readOnly = false,
  type = 'dbml'
}) => {
  const [editorValue, setEditorValue] = useState<string>(initialValue);
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
  const [straightLines, setStraightLines] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStartPos, setPanStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStartScroll, setPanStartScroll] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
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
    editorRef.current = editor;

    // Register a custom language
    monacoInstance.languages.register({ id: 'dbml' });

    // Register a tokens provider for the language
    monacoInstance.languages.setMonarchTokensProvider('dbml', {
      tokenizer: {
        root: [
          [/Table|Ref|Project|TableGroup|enum/, "keyword"],
          [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],
          [/varchar|int|timestamp|boolean|text|longtext/, "type"],
          [/note:|pk|primary key|unique|not null|increment/, "predefined"],
          [/".*?"/, "string"],
          [/{|}|[|]|'|"|:|`/, "delimiter.bracket"],
          [/\/\/.*/, "comment"],
        ],
      },
    });

    // Update cursor position
    editor.onDidChangeCursorPosition(e => {
      setCursorPosition(e.position);
    });
  };

  // Parse initial value
  useEffect(() => {
    if (initialValue) {
      setEditorValue(initialValue);
      try {
        const parsed = parseDbml(initialValue);
        setTables(parsed.tables);
        setRelationships(parsed.relationships);
      } catch (error) {
        console.error('Error parsing initial DBML:', error);
      }
    }
  }, [initialValue]);
  
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
    setStraightLines(prev => !prev);
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
    
    const fromX = fromTable.x + 280; // Right side of the table
    const fromY = fromTable.y + headerHeight + fieldHeight * fromFieldIndex + fieldHeight / 2;
    
    const toX = toTable.x; // Left side of the table
    const toY = toTable.y + headerHeight + fieldHeight * toFieldIndex + fieldHeight / 2;
    
    return { fromX, fromY, toX, toY };
  };
  
  // Draw arrow based on relationship type and line style
  const getArrowPath = (coords: { fromX: number, fromY: number, toX: number, toY: number }, type: string) => {
    const { fromX, fromY, toX, toY } = coords;
    
    // Path for the line
    let path = '';
    
    if (straightLines) {
      // Orthogonal line with segments
      path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      // Control points for curve
      const midX = (fromX + toX) / 2;
      path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
    }
    
    // Arrow head
    const arrowSize = 8;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Adjust arrow position to be at the end of the line
    const arrowX = toX;
    const arrowY = toY;
    
    // Draw different arrow heads based on relationship type
    if (type === '>') {
      // One-to-many: arrow at 'to' side
      path += ` M ${arrowX} ${arrowY} L ${arrowX - arrowSize * Math.cos(angle - Math.PI/6)} ${arrowY - arrowSize * Math.sin(angle - Math.PI/6)} L ${arrowX - arrowSize * Math.cos(angle + Math.PI/6)} ${arrowY - arrowSize * Math.sin(angle + Math.PI/6)} Z`;
    } else if (type === '<') {
      // Many-to-one: arrow at 'from' side
      path += ` M ${fromX} ${fromY} L ${fromX + arrowSize * Math.cos(angle - Math.PI/6 + Math.PI)} ${fromY + arrowSize * Math.sin(angle - Math.PI/6 + Math.PI)} L ${fromX + arrowSize * Math.cos(angle + Math.PI/6 + Math.PI)} ${fromY + arrowSize * Math.sin(angle + Math.PI/6 + Math.PI)} Z`;
    } else if (type === '<>') {
      // Many-to-many: arrows at both sides
      path += ` M ${arrowX} ${arrowY} L ${arrowX - arrowSize * Math.cos(angle - Math.PI/6)} ${arrowY - arrowSize * Math.sin(angle - Math.PI/6)} L ${arrowX - arrowSize * Math.cos(angle + Math.PI/6)} ${arrowY - arrowSize * Math.sin(angle + Math.PI/6)} Z`;
      path += ` M ${fromX} ${fromY} L ${fromX + arrowSize * Math.cos(angle - Math.PI/6 + Math.PI)} ${fromY + arrowSize * Math.sin(angle - Math.PI/6 + Math.PI)} L ${fromX + arrowSize * Math.cos(angle + Math.PI/6 + Math.PI)} ${fromY + arrowSize * Math.sin(angle + Math.PI/6 + Math.PI)} Z`;
    }
    
    return path;
  };
  
  // Get color for relationship line based on type
  const getRelationshipColor = (type: string) => {
    switch (type) {
      case '>': return '#1890ff'; // One-to-many: blue
      case '<': return '#52c41a'; // Many-to-one: green
      case '-': return '#722ed1'; // One-to-one: purple
      case '<>': return '#fa8c16'; // Many-to-many: orange
      default: return '#666666'; // Default: gray
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

  return (
    <EditorContainer style={{ height }}>
      <EditorPane ref={containerRef}>
        <CodeEditorPane width={`${paneRatio * 100}%`}>
          <Editor
            height="100%"
            language="dbml"
            theme="vs-dark"
            value={editorValue}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              readOnly: readOnly,
              wordWrap: 'on',
              minimap: { enabled: false },
            }}
          />
          <StatusBar>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </StatusBar>
        </CodeEditorPane>
        <Resizer 
          ref={resizerRef}
          onMouseDown={handleMouseDown}
        />
        <DiagramPane width={`${(1 - paneRatio) * 100}%`}>
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
                        markerEnd="url(#arrowhead)" 
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
                  onMouseDown={(e) => handleTableMouseDown(e, table.name)}
                >
                  <TableHeader>{table.name}</TableHeader>
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
                    background: '#1890ff',
                    border: '1px solid #096dd9'
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
            <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
            <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
            <Button icon={<FullscreenOutlined />} onClick={fitToView} title="Fit to view" />
            <Button onClick={toggleLineStyle} title="Toggle line style">
              {straightLines ? '⟹' : '⟿'}
            </Button>
          </ZoomControls>
        </DiagramPane>
      </EditorPane>
    </EditorContainer>
  );
};

export default DbmlEditor; 