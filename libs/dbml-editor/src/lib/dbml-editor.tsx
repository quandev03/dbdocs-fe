import React, { useState } from 'react';
import { DbmlEditorProps } from '../types';
import styled from 'styled-components';

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
`;

const CodeEditorPane = styled.div`
  width: 50%;
  height: 100%;
  border-right: 10px solid #2d2d2d;
  overflow: hidden;
`;

const DiagramPane = styled.div`
  width: 50%;
  height: 100%;
  overflow: auto;
  background-color: #f5f5f5;
  color: #333;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  padding: 10px;
  border: none;
  resize: none;
  outline: none;
  tab-size: 2;
`;

const TableContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const TableCard = styled.div`
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  width: 280px;
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

// Simple parser to extract table names and fields from DBML
const parseDbml = (dbmlCode: string) => {
  const tables: Array<{
    name: string;
    fields: Array<{ name: string; type: string; isPk: boolean }>
  }> = [];
  
  // Extract tables using regex
  const tableRegex = /Table\s+([a-zA-Z0-9._]+)(?:\s+as\s+([a-zA-Z0-9_]+))?\s*{([^}]*)}/g;
  let tableMatch;
  
  while ((tableMatch = tableRegex.exec(dbmlCode)) !== null) {
    const tableName = tableMatch[1];
    const tableContent = tableMatch[3];
    
    const fields: Array<{ name: string; type: string; isPk: boolean }> = [];
    
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
        
        fields.push({
          name: fieldName,
          type: fieldType,
          isPk
        });
      }
    }
    
    tables.push({
      name: tableName,
      fields
    });
  }
  
  return tables;
};

export const DbmlEditor: React.FC<DbmlEditorProps> = ({
  initialValue = '',
  onChange,
  height = '100vh',
  readOnly = false,
}) => {
  const [value, setValue] = useState<string>(initialValue);
  const [tables, setTables] = useState<ReturnType<typeof parseDbml>>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
    
    // Parse DBML on change
    try {
      const parsedTables = parseDbml(newValue);
      setTables(parsedTables);
    } catch (error) {
      console.error('Error parsing DBML:', error);
    }
  };
  
  // Parse initial value
  React.useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
      try {
        const parsedTables = parseDbml(initialValue);
        setTables(parsedTables);
      } catch (error) {
        console.error('Error parsing initial DBML:', error);
      }
    }
  }, [initialValue]);

  return (
    <EditorContainer style={{ height }}>
      <EditorPane>
        <CodeEditorPane>
          <StyledTextarea
            value={value}
            onChange={handleChange}
            readOnly={readOnly}
            spellCheck={false}
          />
        </CodeEditorPane>
        <DiagramPane>
          <TableContainer>
            {tables.map((table, tableIndex) => (
              <TableCard key={tableIndex}>
                <TableHeader>{table.name}</TableHeader>
                <TableContent>
                  {table.fields.map((field, fieldIndex) => (
                    <TableRow key={fieldIndex} isEven={fieldIndex % 2 === 0}>
                      <FieldName>
                        {field.isPk && <span style={{ color: '#faad14', marginRight: '5px' }}>🔑</span>}
                        {field.name}
                      </FieldName>
                      <FieldType>{field.type}</FieldType>
                    </TableRow>
                  ))}
                </TableContent>
              </TableCard>
            ))}
          </TableContainer>
        </DiagramPane>
      </EditorPane>
    </EditorContainer>
  );
};

export default DbmlEditor;
