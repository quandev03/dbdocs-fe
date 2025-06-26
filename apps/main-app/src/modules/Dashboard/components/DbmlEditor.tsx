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
  BgColorsOutlined,
  CloseOutlined,
  AppstoreOutlined
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
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
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
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #374151;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
`;

const StatusBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ErrorIndicator = styled.div<{ hasErrors: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.hasErrors ? '#f87171' : '#64748b'};
  cursor: ${props => props.hasErrors ? 'pointer' : 'default'};
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.hasErrors ? '#374151' : 'transparent'};
  }
  
  .error-icon {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const DiagramPane = styled.div<{ width: string }>`
  width: ${props => props.width};
  height: 100%;
  max-height: 100vh;
  overflow: hidden;
  background-color: #f8fafc;
  color: #1e293b;
  position: relative;
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex: ${props => props.width === '100%' ? 1 : 'none'};
  border-left: 1px solid #e8eef7;
  box-sizing: border-box;
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
  max-height: 100%;
  overflow: auto;
  background-color: #f8fafc;
  min-height: 400px;
  box-sizing: border-box;
`;

const DiagramCanvas = styled.div<{ scale: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  transform-origin: 0 0;
  background-color: #f8fafc;
  background-image: 
    radial-gradient(circle, #e2e8f0 1px, transparent 1px);
  background-size: ${props => 20 * props.scale}px ${props => 20 * props.scale}px;
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
  z-index: 999999;
  background-color: #ffffff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eef7;
  pointer-events: auto;
  visibility: visible;
  opacity: 1;
  transform: translateZ(0);

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
  max-width: 300px;
  max-height: 200px;
  min-width: 180px;
  min-height: 120px;
  background-color: #ffffff;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  overflow: auto;
  z-index: 999999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 8px;
  pointer-events: auto;
  visibility: visible;
  opacity: 1;
  transform: translateZ(0);
`;

const MiniMapContent = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
  min-width: 100%;
  min-height: 100%;
`;

const ViewportIndicator = styled.div<{x: number, y: number, width: number, height: number}>`
  position: absolute;
  top: ${props => props.y}px;
  left: ${props => props.x}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 1px solid #4285f4;
  background-color: rgba(66, 133, 244, 0.1);
  border-radius: 2px;
  pointer-events: none;
`;

// Simple parser to extract table names and fields from DBML
// Enhanced DBML validation function
const validateDbml = (dbmlCode: string) => {
  const errors: string[] = [];
  const markers: monaco.editor.IMarkerData[] = [];
  const lines = dbmlCode.split('\n');
  
  // 1. Check for duplicate table names
  const tableNameRegex = /Table\s+([a-zA-Z0-9._"'`]+)\s*\{/g;
  const tableOccurrences = new Map<string, { name: string; line: number; column: number; match: RegExpExecArray }[]>();
  let match;
  
  while ((match = tableNameRegex.exec(dbmlCode)) !== null) {
    const tableName = match[1].replace(/["`']/g, '');
    const beforeMatch = dbmlCode.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;
    const lineStart = beforeMatch.lastIndexOf('\n') + 1;
    const columnNumber = match.index - lineStart + 1;
    
    if (!tableOccurrences.has(tableName)) {
      tableOccurrences.set(tableName, []);
    }
    
    tableOccurrences.get(tableName)!.push({
      name: tableName,
      line: lineNumber,
      column: columnNumber,
      match
    });
  }
  
  // Check for duplicates
  for (const [tableName, occurrences] of tableOccurrences) {
    if (occurrences.length > 1) {
      errors.push(`Duplicate table name: ${tableName} (found ${occurrences.length} times)`);
      
      occurrences.forEach((occurrence, index) => {
        const tableKeyword = occurrence.match[0];
        const nameStart = tableKeyword.indexOf(occurrence.name);
        
        markers.push({
          startLineNumber: occurrence.line,
          startColumn: occurrence.column + nameStart,
          endLineNumber: occurrence.line,
          endColumn: occurrence.column + nameStart + occurrence.name.length,
          message: `Duplicate table name "${tableName}" - this is occurrence ${index + 1} of ${occurrences.length}`,
          severity: monaco.MarkerSeverity.Error,
        });
      });
    }
  }

  // 2. Check for unclosed braces
  let braceDepth = 0;
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (trimmedLine.includes('{')) braceDepth++;
    if (trimmedLine.includes('}')) braceDepth--;
    
    if (braceDepth < 0) {
      errors.push(`Unexpected closing brace at line ${lineIndex + 1}`);
      markers.push({
        startLineNumber: lineIndex + 1,
        startColumn: line.indexOf('}') + 1,
        endLineNumber: lineIndex + 1,
        endColumn: line.indexOf('}') + 2,
        message: 'Unexpected closing brace',
        severity: monaco.MarkerSeverity.Error,
      });
      braceDepth = 0; // Reset to prevent cascade errors
    }
  });
  
  if (braceDepth > 0) {
    errors.push('Missing closing brace(s)');
    markers.push({
      startLineNumber: lines.length,
      startColumn: 1,
      endLineNumber: lines.length,
      endColumn: lines[lines.length - 1]?.length + 1 || 1,
      message: `Missing ${braceDepth} closing brace(s)`,
      severity: monaco.MarkerSeverity.Error,
    });
  }

  // 3. Check for invalid field syntax
  const fieldRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z0-9_()]+)(.*)$/;
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    // Skip empty lines, comments, table declarations, and closing braces
    if (!trimmedLine || trimmedLine.startsWith('//') || 
        trimmedLine.startsWith('Table') || trimmedLine.startsWith('Ref') ||
        trimmedLine === '{' || trimmedLine === '}' ||
        trimmedLine.startsWith('Indexes') || trimmedLine.startsWith('Note')) {
      return;
    }
    
    // Check if we're inside a table (simple heuristic)
    const previousLines = lines.slice(0, lineIndex);
    const hasOpenTable = previousLines.some(prevLine => 
      prevLine.trim().startsWith('Table') && prevLine.includes('{')
    );
    const hasCloseTable = previousLines.reverse().some(prevLine => 
      prevLine.trim() === '}'
    );
    
    if (hasOpenTable && !hasCloseTable) {
      // This should be a field definition
      if (!fieldRegex.test(trimmedLine)) {
        errors.push(`Invalid field syntax at line ${lineIndex + 1}: ${trimmedLine}`);
        markers.push({
          startLineNumber: lineIndex + 1,
          startColumn: 1,
          endLineNumber: lineIndex + 1,
          endColumn: line.length + 1,
          message: 'Invalid field syntax. Expected: field_name data_type [constraints]',
          severity: monaco.MarkerSeverity.Error,
        });
      }
    }
  });

  // 4. Check for invalid reference syntax
  const refRegex = /Ref:\s*([a-zA-Z0-9._]+)\.([a-zA-Z0-9_]+)\s*([<>-]+)\s*([a-zA-Z0-9._]+)\.([a-zA-Z0-9_]+)/;
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('Ref:')) {
      if (!refRegex.test(trimmedLine)) {
        errors.push(`Invalid reference syntax at line ${lineIndex + 1}`);
        markers.push({
          startLineNumber: lineIndex + 1,
          startColumn: 1,
          endLineNumber: lineIndex + 1,
          endColumn: line.length + 1,
          message: 'Invalid reference syntax. Expected: Ref: table1.field1 > table2.field2',
          severity: monaco.MarkerSeverity.Warning,
        });
      }
    }
  });

  // 5. Check for missing table names
  const tableDeclarationRegex = /Table\s*\{/;
  lines.forEach((line, lineIndex) => {
    if (tableDeclarationRegex.test(line.trim())) {
      errors.push(`Missing table name at line ${lineIndex + 1}`);
      markers.push({
        startLineNumber: lineIndex + 1,
        startColumn: 1,
        endLineNumber: lineIndex + 1,
        endColumn: line.length + 1,
        message: 'Table declaration missing name. Expected: Table table_name {',
        severity: monaco.MarkerSeverity.Error,
      });
    }
  });

  // 6. Check for invalid data types (warnings)
  const validDataTypes = [
    'varchar', 'char', 'text', 'longtext', 'mediumtext', 'tinytext',
    'int', 'integer', 'bigint', 'smallint', 'tinyint', 'mediumint',
    'decimal', 'numeric', 'float', 'double', 'real',
    'boolean', 'bool', 'bit',
    'date', 'datetime', 'datetime2', 'timestamp', 'time', 'year',
    'binary', 'varbinary', 'blob', 'longblob', 'mediumblob', 'tinyblob',
    'json', 'xml', 'uuid', 'uniqueidentifier', 'money', 'smallmoney'
  ];

  const dataTypeRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z0-9_()]+)/;
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('//') || 
        trimmedLine.startsWith('Table') || trimmedLine.startsWith('Ref') ||
        trimmedLine === '{' || trimmedLine === '}' ||
        trimmedLine.startsWith('Indexes') || trimmedLine.startsWith('Note')) {
      return;
    }

    const match = dataTypeRegex.exec(trimmedLine);
    if (match) {
      const dataType = match[2].replace(/\(.*?\)/, '').toLowerCase(); // Remove parentheses
      if (!validDataTypes.includes(dataType)) {
        markers.push({
          startLineNumber: lineIndex + 1,
          startColumn: line.indexOf(match[2]) + 1,
          endLineNumber: lineIndex + 1,
          endColumn: line.indexOf(match[2]) + match[2].length + 1,
          message: `Unknown data type '${dataType}'. Did you mean: ${getSuggestedDataType(dataType)}?`,
          severity: monaco.MarkerSeverity.Warning,
        });
      }
    }
  });

  // 7. Check for misspelled keywords (warnings)
  const validKeywords = ['table', 'ref', 'note', 'indexes', 'enum', 'project'];
  const keywordSuggestions: Record<string, string[]> = {
    'tabel': ['table'],
    'tbale': ['table'],
    'tabl': ['table'],
    'reff': ['ref'],
    'reference': ['ref'],
    'relation': ['ref'],
    'not': ['note'],
    'noted': ['note'],
    'index': ['indexes'],
    'indx': ['indexes'],
    'enumm': ['enum'],
    'proyect': ['project'],
    'projct': ['project']
  };

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim().toLowerCase();
    const words = trimmedLine.split(/\s+/);
    
    words.forEach((word, wordIndex) => {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '');
      if (keywordSuggestions[cleanWord]) {
        const suggestions = keywordSuggestions[cleanWord];
        const wordStart = line.toLowerCase().indexOf(cleanWord);
        if (wordStart !== -1) {
          markers.push({
            startLineNumber: lineIndex + 1,
            startColumn: wordStart + 1,
            endLineNumber: lineIndex + 1,
            endColumn: wordStart + cleanWord.length + 1,
            message: `Did you mean '${suggestions[0]}'? Possible spelling error.`,
            severity: monaco.MarkerSeverity.Warning,
      });
    }
  }
    });
  });

  // 8. Check for common constraint spelling errors
  const constraintSuggestions: Record<string, string> = {
    'primay': 'primary',
    'primry': 'primary',
    'foriegn': 'foreign',
    'foregn': 'foreign',
    'uniqe': 'unique',
    'uinque': 'unique',
    'nul': 'null',
    'nott': 'not',
    'defualt': 'default',
    'defalt': 'default',
    'increment': 'increment',
    'incremnt': 'increment',
    'auto_incremnt': 'auto_increment',
    'autoincrement': 'auto_increment'
  };

  lines.forEach((line, lineIndex) => {
    Object.keys(constraintSuggestions).forEach(misspelling => {
      if (line.toLowerCase().includes(misspelling)) {
        const startIndex = line.toLowerCase().indexOf(misspelling);
        markers.push({
          startLineNumber: lineIndex + 1,
          startColumn: startIndex + 1,
          endLineNumber: lineIndex + 1,
          endColumn: startIndex + misspelling.length + 1,
          message: `Did you mean '${constraintSuggestions[misspelling]}'?`,
          severity: monaco.MarkerSeverity.Warning,
        });
      }
    });
  });

  // 9. Check for invalid constraint syntax
  const constraintRegex = /\[([^\]]+)\]/g;
  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = constraintRegex.exec(line)) !== null) {
      const constraintContent = match[1].trim();
      
      // Valid constraint patterns
      const validConstraints = [
        /^pk$/i,
        /^primary\s+key$/i,
        /^not\s+null$/i,
        /^null$/i,
        /^unique$/i,
        /^increment$/i,
        /^auto_increment$/i,
        /^ref:\s*[<>-]/i,
        /^default:\s*.+$/i,
        /^note:\s*.+$/i,
        /^delete:\s*(cascade|restrict|set null|set default)$/i,
        /^update:\s*(cascade|restrict|set null|set default)$/i
      ];
      
      const isValidConstraint = validConstraints.some(pattern => pattern.test(constraintContent));
      
      if (!isValidConstraint) {
        // Check for common mistakes
        let suggestion = '';
        const lowerContent = constraintContent.toLowerCase();
        
        if (lowerContent === 'primary' || lowerContent === 'key') {
          suggestion = 'Did you mean [pk] or [primary key]?';
        } else if (lowerContent === 'notnull' || lowerContent === 'not_null') {
          suggestion = 'Did you mean [not null]?';
        } else if (lowerContent === 'inc' || lowerContent === 'auto') {
          suggestion = 'Did you mean [increment] or [auto_increment]?';
        } else if (lowerContent.startsWith('def:') || lowerContent.startsWith('default ')) {
          suggestion = 'Use format: [default: value]';
        } else if (lowerContent.startsWith('note ') || lowerContent.startsWith('notes:')) {
          suggestion = 'Use format: [note: \'description\']';
        } else if (lowerContent.includes('reference') || lowerContent.includes('foreign')) {
          suggestion = 'Use format: [ref: > table.field] or define relationships with Ref:';
        } else {
          suggestion = 'Valid constraints: [pk], [not null], [unique], [increment], [default: value], [note: \'text\']';
        }
        
        markers.push({
          startLineNumber: lineIndex + 1,
          startColumn: match.index + 1,
          endLineNumber: lineIndex + 1,
          endColumn: match.index + match[0].length + 1,
          message: `Invalid constraint syntax: ${constraintContent}. ${suggestion}`,
          severity: monaco.MarkerSeverity.Warning,
        });
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    markers
  };
};

// Helper function to suggest similar data types
const getSuggestedDataType = (invalidType: string): string => {
  const suggestions: Record<string, string> = {
    'string': 'varchar',
    'str': 'varchar',
    'char': 'varchar',
    'character': 'varchar',
    'integer': 'int',
    'number': 'int',
    'num': 'int',
    'long': 'bigint',
    'short': 'smallint',
    'tiny': 'tinyint',
    'bool': 'boolean',
    'bit': 'boolean',
    'date': 'date',
    'time': 'datetime',
    'stamp': 'timestamp'
  };

  const lowerType = invalidType.toLowerCase();
  
  // Exact match
  if (suggestions[lowerType]) {
    return suggestions[lowerType];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(suggestions)) {
    if (lowerType.includes(key) || key.includes(lowerType)) {
      return value;
    }
  }
  
  return 'varchar, int, text, or boolean';
};

const parseDbml = (dbmlCode: string) => {
  const tables: TableData[] = [];
  const relationships: Relationship[] = [];

  console.log('📝 DBML Code to parse:', dbmlCode.substring(0, 200) + '...');

  // Extract tables using regex - improved to handle more cases
  const tableRegex = /Table\s+([a-zA-Z0-9._`"]+)(?:\s+as\s+([a-zA-Z0-9_]+))?\s*\{([^}]*)\}/gi;
  let tableMatch;
  let tableIndex = 0;

  while ((tableMatch = tableRegex.exec(dbmlCode)) !== null) {
    const tableName = tableMatch[1].replace(/[`"]/g, ''); // Remove quotes
    const tableContent = tableMatch[3];
    console.log(`🔍 Found table: ${tableName}`);

    const fields: TableField[] = [];

    // Parse fields
    const fieldLines = tableContent.split('\n').filter(line => line.trim() !== '');

    for (const line of fieldLines) {
      // Skip comments and non-field lines
      if (line.trim().startsWith('//') || line.trim().startsWith('Indexes') || line.trim() === '') continue;

      // Improved field parsing - handle various formats
      const fieldMatch = line.trim().match(/^([a-zA-Z0-9_`"]+)\s+([a-zA-Z0-9_()]+)(.*)$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1].replace(/[`"]/g, ''); // Remove quotes
        const fieldType = fieldMatch[2];
        const modifiers = fieldMatch[3] || '';

        const isPk = line.includes('[pk') || line.includes('primary key') || modifiers.includes('pk');

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
      x: 0, // Will be calculated later
      y: 0  // Will be calculated later
    });
    
    console.log(`✅ Added table: ${tableName} with ${fields.length} fields`);
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

  // Don't auto-calculate layout here, let the component decide
  return { tables, relationships };
};

// Function to calculate optimal table layout with centered distribution
const calculateOptimalLayout = (tables: TableData[], relationships: Relationship[]) => {
  if (tables.length === 0) return tables;

  const tableWidth = 280;
  const tableSpacingX = 120; // Reduced spacing for more compact layout
  const minTableHeight = 120;
  const maxTableHeight = 500;
  const tableSpacingY = 120; // Reduced spacing for more compact layout

  // Calculate table heights based on field count
  const tablesWithHeights = tables.map(table => ({
    ...table,
    height: Math.min(Math.max(table.fields.length * 36 + 40, minTableHeight), maxTableHeight)
  }));

  // Determine optimal grid layout based on number of tables
  const totalTables = tablesWithHeights.length;
  let cols: number;

  // Fixed column layout - maximum 4 tables per row
  if (totalTables <= 1) {
    cols = 1;
  } else if (totalTables <= 2) {
    cols = 2;
  } else if (totalTables <= 3) {
    cols = 3;
  } else {
    cols = 4; // Always max 4 columns for any number of tables > 3
  }
  
  const rows = Math.ceil(totalTables / cols);

  console.log(`🎯 Calculating layout: ${totalTables} tables in ${cols} cols x ${rows} rows`);

  // Calculate total grid dimensions with actual table heights
  const avgTableHeight = tablesWithHeights.reduce((sum, table) => sum + table.height, 0) / tablesWithHeights.length || minTableHeight;
  const maxRowHeight = Math.max(avgTableHeight, minTableHeight);
  
  const totalGridWidth = cols * tableWidth + (cols - 1) * tableSpacingX;
  const totalGridHeight = rows * maxRowHeight + (rows - 1) * tableSpacingY;

  // Use reasonable canvas size for better compact layout
  const canvasWidth = Math.max(1800, totalGridWidth + 400); // More reasonable canvas
  const canvasHeight = Math.max(1200, totalGridHeight + 400); // More reasonable canvas
  
  // Center the grid in the canvas
  const startX = (canvasWidth - totalGridWidth) / 2;
  const startY = (canvasHeight - totalGridHeight) / 2;

  console.log(`🎯 Canvas: ${canvasWidth}x${canvasHeight}, Grid: ${totalGridWidth}x${totalGridHeight}, Start: ${startX}, ${startY}`);

  // Always use regular grid layout for better distribution
  console.log('🎯 Using responsive centered grid layout');
  const positionedTables: TableData[] = [];

  tablesWithHeights.forEach((table, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = startX + col * (tableWidth + tableSpacingX);
    const y = startY + row * (maxRowHeight + tableSpacingY);
    
    positionedTables.push({
      ...table,
      x,
      y
    });
  });

  return positionedTables;
};

// Function to group related tables together
const groupRelatedTables = (tables: (TableData & { height: number })[], relationships: Relationship[]) => {
  const groups: (TableData & { height: number })[][] = [];
  const processedTables = new Set<string>();
  
  // Create adjacency map for relationships
  const adjacencyMap = new Map<string, Set<string>>();
  
  tables.forEach(table => {
    adjacencyMap.set(table.name, new Set());
  });
  
  relationships.forEach(rel => {
    const fromTable = rel.from.table;
    const toTable = rel.to.table;
    
    if (adjacencyMap.has(fromTable) && adjacencyMap.has(toTable)) {
      adjacencyMap.get(fromTable)!.add(toTable);
      adjacencyMap.get(toTable)!.add(fromTable);
    }
  });
  
  // Group related tables using BFS
  tables.forEach(table => {
    if (!processedTables.has(table.name)) {
      const group: (TableData & { height: number })[] = [];
      const queue = [table.name];
      
      while (queue.length > 0) {
        const currentTableName = queue.shift()!;
        
        if (processedTables.has(currentTableName)) continue;
        
        const currentTable = tables.find(t => t.name === currentTableName);
        if (currentTable) {
          group.push(currentTable);
          processedTables.add(currentTableName);
          
          // Add related tables to queue (limit group size to avoid huge groups)
          if (group.length < 4) {
            const relatedTables = adjacencyMap.get(currentTableName) || new Set();
            relatedTables.forEach(relatedTableName => {
              if (!processedTables.has(relatedTableName)) {
                queue.push(relatedTableName);
              }
            });
          }
        }
      }
      
      if (group.length > 0) {
        // Sort group by table size for better visual balance
        group.sort((a, b) => b.height - a.height);
        groups.push(group);
      }
    }
  });
  
  // Sort groups by total importance (tables with most relationships first)
  groups.sort((a, b) => {
    const aConnections = a.reduce((sum, table) => 
      sum + (adjacencyMap.get(table.name)?.size || 0), 0);
    const bConnections = b.reduce((sum, table) => 
      sum + (adjacencyMap.get(table.name)?.size || 0), 0);
    return bConnections - aConnections;
  });
  
  return groups;
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
  onValidationChange,
  height = '90vh',
  readOnly = false,
  type = 'dbml',
  showDiagramOnly = false
}, ref) => {
  const [editorValue, setEditorValue] = useState<string>(dbmlContent || initialValue);
  const [paneRatio, setPaneRatio] = useState<number>(showDiagramOnly ? 0 : 0.5); // 50% code, 50% diagram
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [tables, setTables] = useState<TableData[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [scale, setScale] = useState<number>(0.8);
  
  // Debug scale changes
  useEffect(() => {
    console.log('🔍 Scale changed to:', scale);
  }, [scale]);
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
  const [miniMapVisible, setMiniMapVisible] = useState<boolean>(true);
  const [forceUpdate, setForceUpdate] = useState<number>(0);

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

    // Validate DBML first
    const validation = validateDbml(code);
    
    // Separate errors and warnings
    const errors = validation.errors;
    const warnings = validation.markers
      .filter(marker => marker.severity === monaco.MarkerSeverity.Warning)
      .map(marker => marker.message);
    
    setValidationErrors(errors);
    setValidationWarnings(warnings);
    
    // Add validation markers to Monaco editor
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        console.log('🎯 Setting validation markers:', validation.markers.length, 'markers');
        monaco.editor.setModelMarkers(model, 'dbml-validation', validation.markers);
      } else {
        console.warn('⚠️ Monaco model not available for validation markers');
      }
    } else {
      console.warn('⚠️ Monaco editor not available for validation markers');
    }
    
    // Notify parent component about validation status
    if (onValidationChange) {
      onValidationChange(validation.isValid, validation.errors);
    }

    // Parse DBML on change with better error handling
    try {
      console.log('🔄 Parsing DBML code:', code.substring(0, 100) + '...');
      const parsed = parseDbml(code);
      console.log('✅ Parsed tables:', parsed.tables.length, 'relationships:', parsed.relationships.length);
      
      if (!validation.isValid) {
        console.warn('⚠️ DBML has validation errors:', validation.errors);
      }

      if (parsed.tables.length === 0 && code.trim() !== '') {
        console.warn('⚠️ No tables found in DBML code');
        // Clear tables if code has content but no tables found
        setTables([]);
        setRelationships([]);
        return;
      }

      // Force update tables state immediately
      console.log('🔄 Force updating tables state...');
      
      // Preserve positions of existing tables, only recalculate new ones
      const updatedTables = parsed.tables.map(newTable => {
        const existingTable = tables.find(t => t.name === newTable.name);
        if (existingTable) {
          return {
            ...newTable,
            x: existingTable.x,
            y: existingTable.y,
            color: existingTable.color
          };
        }
        
        // For new tables, find a good position to avoid overlap
        let newX = 100;
        let newY = 100;
        
        if (tables.length > 0) {
          // Find the rightmost table and place new table to the right
          const rightmostTable = tables.reduce((max, table) => 
            table.x > max.x ? table : max, tables[0]);
          newX = rightmostTable.x + 360; // 280 (table width) + 80 (spacing)
          newY = rightmostTable.y;
        }
        
        return {
          ...newTable,
          x: newX,
          y: newY
        };
      });

      // Force re-render by creating new array and triggering update
      setTables(prevTables => {
        console.log('🔄 setTables called - prev:', prevTables.length, 'new:', updatedTables.length);
        return [...updatedTables];
      });
      setRelationships(prevRels => {
        console.log('🔄 setRelationships called - prev:', prevRels.length, 'new:', parsed.relationships.length);
        return [...parsed.relationships];
      });
      setForceUpdate(prev => prev + 1); // Force component re-render
      
      // Check for new tables
      const hasNewTables = updatedTables.some(table => 
        !tables.find(existingTable => existingTable.name === table.name)
      );
      
      // Only auto-layout for completely new projects
      if (tables.length === 0 && updatedTables.length > 0) {
        console.log('🎯 Auto-layouting new tables...');
        setTimeout(() => {
          const autoLayouted = calculateOptimalLayout(updatedTables, parsed.relationships);
          setTables([...autoLayouted]);
          
          // Set appropriate scale based on diagram size
          setTimeout(() => {
            if (updatedTables.length > 50) {
              setScale(0.5);
            } else if (updatedTables.length > 20) {
              setScale(0.7);
            } else {
              // Don't auto-fit for medium diagrams either - use fixed scale
              setScale(0.9);
            }
          }, 100);
        }, 100);
      }

      // Clear previous parsing error markers (keep validation markers)
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monaco.editor.setModelMarkers(model, 'dbml-parsing', []);
        }
      }
    } catch (error: any) {
      console.error('❌ Error parsing DBML:', error);
      // Add parsing error markers to Monaco editor
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const marker: monaco.editor.IMarkerData = {
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: model.getLineCount(),
            endColumn: model.getLineMaxColumn(model.getLineCount()),
            message: error.message || "Invalid DBML syntax",
            severity: monaco.MarkerSeverity.Error,
          };
          monaco.editor.setModelMarkers(model, 'dbml-parsing', [marker]);
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
              [/\b(varchar|int|timestamp|boolean|text|longtext|date|json|bigint|smallint|tinyint|decimal|float|double|char|nchar|nvarchar|datetime|datetime2|time|binary|varbinary|uniqueidentifier|xml|money|real)\b/, "type"],
              [/\b(note|pk|primary key|unique|not null|increment|default|ref|auto_increment|primary_key|foreign_key|check|index|indexes)\b/, "predefined"],
              [/'[^']*'/, "string"],
              [/"[^"]*"/, "string"],
              [/`[^`]*`/, "string"],
              [/\{|\}|\[|\]/, "delimiter.bracket"],
              [/[,;:]/, "delimiter"],
              [/\/\/.*$/, "comment"],
              [/\/\*[\s\S]*?\*\//, "comment"],
          [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],
              [/\d+/, "number"],
            ],
          },
        });

        // Register completion item provider for DBML
        monacoInstance.languages.registerCompletionItemProvider('dbml', {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };
            
            const suggestions: any[] = [
              // Keywords
              {
                label: 'Table',
                kind: monacoInstance.languages.CompletionItemKind.Keyword,
                insertText: 'Table ${1:table_name} {\n  ${2:field_name} ${3:data_type}\n}',
                insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Create a new table with fields',
                range: range
              },
              {
                label: 'Ref',
                kind: monacoInstance.languages.CompletionItemKind.Keyword,
                insertText: 'Ref: ${1:table1}.${2:field1} ${3:>} ${4:table2}.${5:field2}',
                insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Create a relationship between tables',
                range: range
              },
              // Common data types
              {
                label: 'varchar',
                kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
                insertText: 'varchar(${1:255})',
                insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Variable character string',
                range: range
              },
              {
                label: 'int',
                kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
                insertText: 'int',
                documentation: 'Integer number',
                range: range
              },
              {
                label: 'bigint',
                kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
                insertText: 'bigint',
                documentation: 'Big integer number',
                range: range
              },
              {
                label: 'text',
                kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
                insertText: 'text',
                documentation: 'Large text field',
                range: range
              },
              {
                label: 'boolean',
                kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
                insertText: 'boolean',
                documentation: 'True/false value',
                range: range
              },
              {
                label: 'timestamp',
                kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
                insertText: 'timestamp',
                documentation: 'Date and time',
                range: range
              },
              {
                label: 'datetime',
                kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
                insertText: 'datetime',
                documentation: 'Date and time',
                range: range
              },
              {
                label: 'json',
                kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
                insertText: 'json',
                documentation: 'JSON data type',
                range: range
              },
              // Field constraints
              {
                label: 'pk',
                kind: monacoInstance.languages.CompletionItemKind.Property,
                insertText: '[pk]',
                documentation: 'Primary key constraint',
                range: range
              },
              {
                label: 'not null',
                kind: monacoInstance.languages.CompletionItemKind.Property,
                insertText: '[not null]',
                documentation: 'Not null constraint',
                range: range
              },
              {
                label: 'unique',
                kind: monacoInstance.languages.CompletionItemKind.Property,
                insertText: '[unique]',
                documentation: 'Unique constraint',
                range: range
              },
              {
                label: 'default',
                kind: monacoInstance.languages.CompletionItemKind.Property,
                insertText: '[default: ${1:value}]',
                insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Default value',
                range: range
              }
            ];
            
            return { suggestions };
          }
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

      // Add CSS to fix search box icons
      const style = document.createElement('style');
      style.textContent = `
        /* Import VS Code codicon font */
        @font-face {
          font-family: 'codicon';
          src: url('https://microsoft.github.io/monaco-editor/assets/fonts/codicon/codicon.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        /* Fix Monaco Editor search box icons */
        .monaco-editor .find-widget .codicon {
          font-family: 'codicon' !important;
          font-size: 16px !important;
          line-height: 22px !important;
          display: inline-block !important;
          text-decoration: none !important;
          text-rendering: auto !important;
          text-align: center !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -ms-user-select: none !important;
        }

        /* Specific icon mappings matching VS Code */
        .monaco-editor .find-widget .codicon-arrow-up::before {
          content: '\\eb09' !important;
        }

        .monaco-editor .find-widget .codicon-arrow-down::before {
          content: '\\eb0a' !important;
        }

        .monaco-editor .find-widget .codicon-close::before {
          content: '\\eb46' !important;
        }

        .monaco-editor .find-widget .codicon-replace::before {
          content: '\\eb3d' !important;
        }

        .monaco-editor .find-widget .codicon-replace-all::before {
          content: '\\eb3c' !important;
        }

        .monaco-editor .find-widget .codicon-selection::before {
          content: '\\eb85' !important;
        }

        .monaco-editor .find-widget .codicon-case-sensitive::before {
          content: '\\eb4f' !important;
        }

        .monaco-editor .find-widget .codicon-whole-word::before {
          content: '\\eb86' !important;
        }

        .monaco-editor .find-widget .codicon-regex::before {
          content: '\\eb38' !important;
        }

        .monaco-editor .find-widget .codicon-preserve-case::before {
          content: '\\eb8a' !important;
        }

        .monaco-editor .find-widget .codicon-chevron-down::before {
          content: '\\eb4e' !important;
        }

        /* Style toggle buttons to match VS Code */
        .monaco-editor .find-widget .toggle {
          background-color: transparent !important;
          border: 1px solid transparent !important;
          color: #cccccc !important;
          border-radius: 3px !important;
        }

        .monaco-editor .find-widget .toggle.checked {
          background-color: rgba(14, 99, 156, 0.8) !important;
          border-color: rgba(14, 99, 156, 0.8) !important;
        }

        .monaco-editor .find-widget .button {
          background-color: transparent !important;
          border: none !important;
          color: #cccccc !important;
          cursor: pointer !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
        }

        .monaco-editor .find-widget .button:hover:not(.disabled) {
          background-color: rgba(90, 93, 94, 0.31) !important;
        }

        .monaco-editor .find-widget .button.disabled {
          opacity: 0.4 !important;
          cursor: default !important;
        }

        /* Improve search box appearance */
        .monaco-editor .find-widget {
          background-color: #252526 !important;
          border: 1px solid #3c3c3c !important;
          border-radius: 3px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
        }

        .monaco-editor .find-widget .monaco-inputbox {
          background-color: #3c3c3c !important;
          border: 1px solid #464647 !important;
          border-radius: 2px !important;
        }

        .monaco-editor .find-widget .monaco-inputbox input {
          background-color: transparent !important;
          color: #cccccc !important;
        }

        /* Match count styling */
        .monaco-editor .find-widget .matchesCount {
          color: #858585 !important;
          margin: 0 5px !important;
        }

        /* Replace input styling */
        .monaco-editor .find-widget .replace-part .monaco-inputbox {
          margin-left: 17px !important;
        }
      `;
      document.head.appendChild(style);

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
        },
        find: {
          addExtraSpaceOnTop: false,
          autoFindInSelection: 'never',
          seedSearchStringFromSelection: 'always'
        }
    });

    // Update cursor position
    editor.onDidChangeCursorPosition(e => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });

    // Run initial validation if there's content
    if (editorValue.trim()) {
      console.log('🎯 Running initial validation on mount...');
      const validation = validateDbml(editorValue);
      
      // Separate errors and warnings for initial validation
      const errors = validation.errors;
      const warnings = validation.markers
        .filter(marker => marker.severity === monacoInstance.MarkerSeverity.Warning)
        .map(marker => marker.message);
      
      setValidationErrors(errors);
      setValidationWarnings(warnings);
      
      const model = editor.getModel();
      if (model && validation.markers.length > 0) {
        console.log('🎯 Setting initial validation markers:', validation.markers.length);
        monacoInstance.editor.setModelMarkers(model, 'dbml-validation', validation.markers);
      }
    }

      console.log('Monaco Editor configured successfully');
    } catch (error) {
      console.error('Error configuring Monaco Editor:', error);
    }
  };

  // Parse initial value - only run once on mount, don't reset scale on content changes
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    const contentToUse = dbmlContent || initialValue;
    if (contentToUse && contentToUse.trim() !== '' && !hasInitialized) {
      setEditorValue(contentToUse);
      try {
        console.log('🚀 Initial parsing of DBML...');
        const parsed = parseDbml(contentToUse);
        
        if (parsed.tables.length > 0) {
          // Auto-layout for initial load
          const layoutedTables = calculateOptimalLayout(parsed.tables, parsed.relationships);
          console.log('✅ Initial layout complete, tables:', layoutedTables.length);
          setTables(layoutedTables);
          setRelationships(parsed.relationships);
          
          // Set appropriate scale for initial load - ONLY ONCE
          setTimeout(() => {
            if (layoutedTables.length > 50) {
              setScale(0.5);
            } else if (layoutedTables.length > 20) {
              setScale(0.7);
            } else {
              // Use fixed scale for initial load to prevent auto-shrinking
              setScale(0.9);
            }
          }, 200);
          
          // Mark as initialized to prevent re-running
          setHasInitialized(true);
        }
      } catch (error) {
        console.error('Error parsing initial DBML:', error);
      }
    }
  }, [initialValue, dbmlContent, hasInitialized]);

  // Debug tables state changes
  useEffect(() => {
    console.log('🔄 Tables state updated:', tables.length, 'tables');
    tables.forEach(table => {
      console.log(`  - ${table.name}: (${table.x}, ${table.y}) with ${table.fields.length} fields`);
    });
  }, [tables]);

  // Debug force update changes
  useEffect(() => {
    console.log('🔄 ForceUpdate changed to:', forceUpdate);
  }, [forceUpdate]);

  // Debug editor value changes
  useEffect(() => {
    console.log('🔄 EditorValue changed:', editorValue.length, 'chars');
    console.log('  First 100 chars:', editorValue.substring(0, 100));
  }, [editorValue]);

  // Sync states when showDiagramOnly changes
  useEffect(() => {
    setIsEditorVisible(!showDiagramOnly);
    setPaneRatio(showDiagramOnly ? 0 : 0.5);
  }, [showDiagramOnly]);

  // Update diagram when pane ratio changes - but don't trigger on tables.length to prevent loops
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate(prev => prev + 1);
      
      // Also refresh editor layout
      if (editorRef.current) {
        editorRef.current.layout();
      }

      // Don't auto-fit on pane ratio changes to preserve user's zoom level
      // Let user control the zoom manually
    }, 200);

    return () => clearTimeout(timer);
  }, [paneRatio, isEditorVisible, showDiagramOnly]); // Removed tables.length dependency

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

  // Update viewport position for minimap and handle resize
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

    const handleResize = () => {
      updateViewport();
      // Force update diagram layout after window resize
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
      }, 100);
    };

    const diagram = diagramRef.current;
    if (diagram) {
      diagram.addEventListener('scroll', updateViewport);
      window.addEventListener('resize', handleResize);
      updateViewport();
    }

    return () => {
      if (diagram) {
        diagram.removeEventListener('scroll', updateViewport);
        window.removeEventListener('resize', handleResize);
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

  // Fit diagram to view with conservative scale limits
  const fitToView = () => {
    console.log('🎯 fitToView() called - using conservative scaling');
    
    if (!diagramRef.current || tables.length === 0) {
      console.log('🎯 No diagram ref or tables, setting scale to 1.0');
      setScale(1.0);
      return;
    }

    // Find diagram bounds
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    tables.forEach(table => {
      const tableHeight = table.fields.length * 36 + 40; // header + fields
      minX = Math.min(minX, table.x);
      minY = Math.min(minY, table.y);
      maxX = Math.max(maxX, table.x + 280); // table width
      maxY = Math.max(maxY, table.y + tableHeight);
    });

    // Add padding around content
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const diagramWidth = diagramRef.current.clientWidth;
    const diagramHeight = diagramRef.current.clientHeight;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) {
      setScale(1.0);
      return;
    }

    // Calculate scale to fit with conservative limits
    const scaleX = (diagramWidth * 0.85) / contentWidth; // Use 85% of available space
    const scaleY = (diagramHeight * 0.85) / contentHeight;
    let newScale = Math.min(scaleX, scaleY);
    
    // VERY conservative scale limits to prevent tiny diagrams
    if (tables.length > 50) {
      newScale = Math.max(0.6, Math.min(1.2, newScale)); // Large diagrams: min 0.6
    } else if (tables.length > 20) {
      newScale = Math.max(0.7, Math.min(1.2, newScale)); // Medium diagrams: min 0.7
    } else {
      newScale = Math.max(0.8, Math.min(1.5, newScale)); // Small diagrams: min 0.8
    }

    console.log(`🎯 fitToView: content ${contentWidth}x${contentHeight}, viewport ${diagramWidth}x${diagramHeight}, calculated scale ${newScale}`);

    setScale(newScale);

    // Center the content
    setTimeout(() => {
      if (diagramRef.current) {
        const centerX = minX + contentWidth / 2;
        const centerY = minY + contentHeight / 2;
        
        const scrollLeft = Math.max(0, centerX * newScale - diagramWidth / 2);
        const scrollTop = Math.max(0, centerY * newScale - diagramHeight / 2);
        
        diagramRef.current.scrollLeft = scrollLeft;
        diagramRef.current.scrollTop = scrollTop;
        
        console.log(`🎯 Centered at scroll: ${scrollLeft}, ${scrollTop}`);
      }
    }, 100);
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

    // Apply scale to all calculations
    const scaledTableWidth = tableWidth * scale;
    const scaledHeaderHeight = headerHeight * scale;
    const scaledFieldHeight = fieldHeight * scale;

    // Determine table positions
    const fromTableCenterX = (fromTable.x * scale) + scaledTableWidth/2;
    const fromTableCenterY = (fromTable.y * scale) + scaledHeaderHeight + (fromTable.fields.length * scaledFieldHeight)/2;

    const toTableCenterX = (toTable.x * scale) + scaledTableWidth/2;
    const toTableCenterY = (toTable.y * scale) + scaledHeaderHeight + (toTable.fields.length * scaledFieldHeight)/2;

    // Calculate central positions for fields
    const fromY = (fromTable.y * scale) + scaledHeaderHeight + scaledFieldHeight * fromFieldIndex + scaledFieldHeight / 2;
    const toY = (toTable.y * scale) + scaledHeaderHeight + scaledFieldHeight * toFieldIndex + scaledFieldHeight / 2;

    // Determine which sides of the tables to connect based on their relative positions
    let fromX, toX;

    // Check if tables are more horizontal or vertical to each other
    const dx = Math.abs(toTableCenterX - fromTableCenterX);
    const dy = Math.abs(toTableCenterY - fromTableCenterY);

    if (dx > dy) {
      // Tables are more horizontally aligned
      if (fromTableCenterX < toTableCenterX) {
        // FromTable is to the left of ToTable
        fromX = (fromTable.x * scale) + scaledTableWidth; // Right side of fromTable
        toX = (toTable.x * scale); // Left side of toTable
      } else {
        // FromTable is to the right of ToTable
        fromX = (fromTable.x * scale); // Left side of fromTable
        toX = (toTable.x * scale) + scaledTableWidth; // Right side of toTable
      }
    } else {
      // Tables are more vertically aligned
      if (fromTableCenterY < toTableCenterY) {
        // FromTable is above ToTable
        fromX = (fromTable.x * scale) + (relationship.from.field === relationship.to.field ? 40 : 80) * scale; // Offset from left edge
        toX = (toTable.x * scale) + (relationship.from.field === relationship.to.field ? 40 : 120) * scale; // Offset from left edge
      } else {
        // FromTable is below ToTable
        fromX = (fromTable.x * scale) + (relationship.from.field === relationship.to.field ? 120 : 200) * scale; // Offset from left edge
        toX = (toTable.x * scale) + (relationship.from.field === relationship.to.field ? 200 : 160) * scale; // Offset from left edge
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

    // Force re-render diagram after resize
    setTimeout(() => {
      setForceUpdate(prev => prev + 1);
    }, 300);
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

  // Function to re-layout all tables optimally
  const autoLayoutTables = () => {
    if (tables.length === 0) return;
    
    console.log('🎯 Manual Auto-layout triggered by user...');
    const optimizedTables = calculateOptimalLayout(tables, relationships);
    setTables(optimizedTables);
    
    // Set a reasonable scale instead of auto-fitting for large diagrams
    setTimeout(() => {
      if (optimizedTables.length > 50) {
        // For very large diagrams, use reasonable scale
        setScale(0.5);
      } else if (optimizedTables.length > 20) {
        // For large diagrams, use better scale
        setScale(0.7);
      } else if (optimizedTables.length > 10) {
        setScale(0.8);
      } else {
        // Only auto-fit for very small diagrams
        if (optimizedTables.length <= 6) {
          fitToView();
        } else {
          setScale(0.9); // Larger scale for medium diagrams
        }
      }
    }, 200);
  };

  // Reset pane ratio to 50-50
  const resetPaneRatio = () => {
    setPaneRatio(0.5);
    setIsEditorVisible(true);
    
    // Refresh editor layout and fit diagram
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.layout();
        // Don't auto-fit - let user control zoom manually
      }, 300);
    }
  };

  // Handle click on error indicator to navigate to first error/warning
  const handleErrorIndicatorClick = () => {
    if ((validationErrors.length > 0 || validationWarnings.length > 0) && editorRef.current) {
      // Get all markers (errors and warnings)
      const model = editorRef.current.getModel();
      if (model) {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri, owner: 'dbml-validation' });
        if (markers.length > 0) {
          // Prioritize errors over warnings
          const errorMarkers = markers.filter(m => m.severity === monaco.MarkerSeverity.Error);
          const firstMarker = errorMarkers.length > 0 ? errorMarkers[0] : markers[0];
          
          // Navigate to first issue
          editorRef.current.setPosition({
            lineNumber: firstMarker.startLineNumber,
            column: firstMarker.startColumn
          });
          // Focus editor and select the issue range
          editorRef.current.focus();
          editorRef.current.setSelection({
            startLineNumber: firstMarker.startLineNumber,
            startColumn: firstMarker.startColumn,
            endLineNumber: firstMarker.endLineNumber,
            endColumn: firstMarker.endColumn
          });
        }
      }
    }
  };

  // Calculate minimap dimensions and scale
  const calculateMiniMapProps = () => {
    if (tables.length === 0) {
      return { scale: 0.1, width: 180, height: 120, offsetX: 0, offsetY: 0 };
    }

    // Find the bounds of all tables
    const minX = Math.min(...tables.map(t => t.x));
    const maxX = Math.max(...tables.map(t => t.x + 280)); // 280 is table width
    const minY = Math.min(...tables.map(t => t.y));
    const maxY = Math.max(...tables.map(t => t.y + (t.fields.length * 36 + 40))); // Calculate table height

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calculate scale to fit content in minimap
    const maxMiniMapWidth = 280;
    const maxMiniMapHeight = 180;
    
    const scaleX = maxMiniMapWidth / contentWidth;
    const scaleY = maxMiniMapHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 0.15); // Max scale of 0.15

    const miniMapWidth = Math.min(contentWidth * scale + 16, maxMiniMapWidth);
    const miniMapHeight = Math.min(contentHeight * scale + 16, maxMiniMapHeight);

    return {
      scale,
      width: Math.max(miniMapWidth, 180),
      height: Math.max(miniMapHeight, 120),
      offsetX: minX,
      offsetY: minY
    };
  };

  // DISABLED: Don't auto-fit diagram when tables are loaded to prevent shrinking
  // useEffect(() => {
  //   if (tables.length > 0) {
  //     // Add a small delay to ensure the diagram is rendered
  //     const timer = setTimeout(() => {
  //       fitToView();
  //     }, 300);

  //     return () => clearTimeout(timer);
  //   }
  // }, [tables.length, showDiagramOnly]);

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
  console.log('🔄 DbmlEditor render - tables:', tables.length, 'relationships:', relationships.length);
  
  return (
    <EditorContainer style={{ height: height || '100%' }}>
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
              scrollBeyondLastLine: true,
              fontSize: 14,
              lineHeight: 22,
              tabSize: 2,
              insertSpaces: true,
              renderLineHighlight: 'line',
              selectOnLineNumbers: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              contextmenu: false, // Disable context menu for performance
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12
              }
            }}
          />
          <StatusBar>
            <StatusBarLeft>
              <Tooltip
                title={
                  validationErrors.length > 0 || validationWarnings.length > 0 ? (
                    <div>
                      {validationErrors.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#f87171' }}>
                            Errors ({validationErrors.length}):
                      </div>
                      {validationErrors.map((error, index) => (
                            <div key={index} style={{ fontSize: '11px', marginBottom: '2px', color: '#f87171' }}>
                          • {error}
                        </div>
                      ))}
                        </div>
                      )}
                      {validationWarnings.length > 0 && (
                        <div style={{ marginTop: validationErrors.length > 0 ? '8px' : '0' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#facc15' }}>
                            Warnings ({validationWarnings.length}):
                          </div>
                          {validationWarnings.map((warning, index) => (
                            <div key={index} style={{ fontSize: '11px', marginBottom: '2px', color: '#facc15' }}>
                              • {warning}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: '10px', marginTop: '4px', color: '#94a3b8' }}>
                        Click to navigate to first issue
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#4ade80' }}>
                      No issues found ✅
                    </div>
                  )
                }
                placement="top"
              >
                <ErrorIndicator 
                  hasErrors={validationErrors.length > 0 || validationWarnings.length > 0}
                  onClick={validationErrors.length > 0 || validationWarnings.length > 0 ? handleErrorIndicatorClick : undefined}
                >
                  <span className="error-icon">
                    {validationErrors.length > 0 ? '❌' : validationWarnings.length > 0 ? '⚠️' : '✅'}
                  </span>
                  <span>
                    {validationErrors.length > 0 
                      ? `${validationErrors.length} error${validationErrors.length > 1 ? 's' : ''}`
                      : validationWarnings.length > 0
                        ? `${validationWarnings.length} warning${validationWarnings.length > 1 ? 's' : ''}`
                        : 'No issues'
                    }
                  </span>
                </ErrorIndicator>
              </Tooltip>
            </StatusBarLeft>
            
            <StatusBarRight>
              <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
            </StatusBarRight>
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
          <DiagramContainer ref={diagramRef} data-diagram-container key={`diagram-${forceUpdate}`}>
            <DiagramCanvas scale={scale} key={`canvas-${forceUpdate}`}>
              <div style={{
                position: 'relative',
                width: Math.max(
                  ...(tables.length > 0 ? [
                    ...tables.map(t => t.x + 280 + 100),
                    1000
                  ] : [1000])
                ),
                height: Math.max(
                  ...(tables.length > 0 ? [
                    ...tables.map(t => t.y + t.fields.length * 36 + 40 + 100),
                    800
                  ] : [800])
                ),
                minWidth: '100%',
                minHeight: '100%'
              }}>
              {/* Relationship lines */}
              <RelationshipLine>
                {relationships.map((rel, index) => {
                  const coords = getRelationshipCoordinates(rel);
                  if (!coords) return null;

                  const path = getArrowPath(coords, rel.type);
                  const color = getRelationshipColor(rel.type);

                  return (
                    <g key={`rel-${index}-${forceUpdate}`}>
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
                  key={`${table.name}-${forceUpdate}`}
                  x={table.x * scale}
                  y={table.y * scale}
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
              </div>
            </DiagramCanvas>
          </DiagramContainer>

          {/* MiniMap */}
          {tables.length > 0 && miniMapVisible && (() => {
            const miniMapProps = calculateMiniMapProps();
            return (
              <MiniMap style={{ 
                width: miniMapProps.width, 
                height: miniMapProps.height 
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  zIndex: 21,
                  background: '#fff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e8eef7'
                }}
                onClick={() => setMiniMapVisible(false)}
                title="Hide MiniMap"
                >
                  <CloseOutlined style={{ fontSize: '10px', color: '#64748b' }} />
                </div>
                <MiniMapContent style={{
                  transform: `scale(${miniMapProps.scale})`,
                  transformOrigin: '0 0'
                }}>
              {tables.map((table, tableIndex) => (
                <div
                  key={`mini-${table.name}-${forceUpdate}`}
                  style={{
                    position: 'absolute',
                        left: (table.x - miniMapProps.offsetX),
                        top: (table.y - miniMapProps.offsetY),
                    width: 280,
                    height: table.fields.length * 36 + 40,
                        background: table.color || '#4285f4',
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                        opacity: 0.8,
                        transition: 'all 0.2s ease'
                  }}
                      title={table.name}
                />
              ))}
              <ViewportIndicator
                    x={(viewportPos.x / scale) - miniMapProps.offsetX}
                    y={(viewportPos.y / scale) - miniMapProps.offsetY}
                    width={(diagramRef.current?.clientWidth || 600) / scale}
                    height={(diagramRef.current?.clientHeight || 400) / scale}
              />
            </MiniMapContent>
          </MiniMap>
            );
          })()}

          {/* Zoom controls */}
          <ZoomControls>
            <Button icon={<ZoomInOutlined />} onClick={zoomIn} title="Zoom in"/>
            <Button icon={<ZoomOutOutlined />} onClick={zoomOut} title="Zoom out"/>
            <Button icon={<FullscreenOutlined />} onClick={fitToView} title="Fit to view" />
            <Button
              onClick={autoLayoutTables}
              title="Auto Layout Tables"
              icon={<span style={{ fontSize: '14px' }}>⚡</span>}
            />
            <Button
              onClick={toggleLineStyle}
              title="Thay đổi kiểu đường nối"
              icon={<span style={{ fontSize: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{getLineStyleLabel()}</span>}
            />
            {!miniMapVisible && tables.length > 0 && (
              <Button 
                onClick={() => setMiniMapVisible(true)} 
                title="Show MiniMap"
                icon={<span style={{ fontSize: '12px' }}>🗺️</span>}
              />
            )}
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
