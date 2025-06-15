import { DbmlSchema, DbmlTable, DbmlField, DbmlRelationship } from '../types';

export class DBMLParserError extends Error {
  line?: number;
  column?: number;
  
  constructor(message: string, line?: number, column?: number) {
    super(message);
    this.name = 'DBMLParserError';
    this.line = line;
    this.column = column;
  }
}

// Mock DBML parser since the actual dbml-core library might have compatibility issues
export const parseDBML = (dbmlCode: string): DbmlSchema => {
  try {
    // This is a simplified mock parser for demonstration purposes
    // In a real implementation, you would use the dbml-core library
    
    const tables: DbmlTable[] = [];
    const relationships: DbmlRelationship[] = [];
    
    // Simple regex-based parsing for tables
    const tableRegex = /Table\s+([a-zA-Z0-9._]+)(?:\s+as\s+([a-zA-Z0-9_]+))?\s*{([^}]*)}/g;
    let tableMatch;
    
    while ((tableMatch = tableRegex.exec(dbmlCode)) !== null) {
      const tableName = tableMatch[1];
      const tableAlias = tableMatch[2] || '';
      const tableContent = tableMatch[3];
      
      const fields: DbmlField[] = [];
      
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
          const isUnique = line.includes('[unique') || line.includes('unique');
          const isNotNull = line.includes('[not null') || line.includes('not null');
          
          fields.push({
            name: fieldName,
            type: fieldType,
            pk: isPk,
            unique: isUnique,
            notNull: isNotNull
          });
        }
      }
      
      tables.push({
        name: tableName,
        schema: tableAlias || undefined,
        fields
      });
    }
    
    // Simple regex-based parsing for relationships
    const refRegex = /Ref:\s*([a-zA-Z0-9._]+)\.([a-zA-Z0-9_]+)\s*([<>-]+)\s*([a-zA-Z0-9._]+)\.([a-zA-Z0-9_]+)/g;
    let refMatch;
    
    while ((refMatch = refRegex.exec(dbmlCode)) !== null) {
      const fromTable = refMatch[1];
      const fromField = refMatch[2];
      const relationType = refMatch[3];
      const toTable = refMatch[4];
      const toField = refMatch[5];
      
      const type = determineRelationType(relationType);
      
      relationships.push({
        from: {
          table: fromTable,
          field: fromField
        },
        to: {
          table: toTable,
          field: toField
        },
        type
      });
    }
    
    return { tables, relationships };
  } catch (error) {
    if (error instanceof Error) {
      // Try to extract line and column information from the error message
      const match = error.message.match(/line (\d+):(\d+)/);
      if (match) {
        throw new DBMLParserError(error.message, parseInt(match[1]), parseInt(match[2]));
      }
      throw new DBMLParserError(error.message);
    }
    throw new DBMLParserError('Unknown error parsing DBML');
  }
};

// Helper function to determine relationship type from the relation symbol
function determineRelationType(relationType: string): DbmlRelationship['type'] {
  if (relationType === '-') {
    return 'one-to-one';
  } else if (relationType === '>') {
    return 'one-to-many';
  } else if (relationType === '<') {
    return 'many-to-one';
  } else {
    return 'many-to-many';
  }
} 