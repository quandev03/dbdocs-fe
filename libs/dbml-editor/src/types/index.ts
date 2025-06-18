export interface DbmlTable {
  name: string;
  schema?: string;
  note?: string;
  fields: DbmlField[];
  indexes?: DbmlIndex[];
}

export interface DbmlField {
  name: string;
  type: string;
  note?: string;
  pk?: boolean;
  unique?: boolean;
  notNull?: boolean;
  default?: string;
  increment?: boolean;
  references?: DbmlReference;
}

export interface DbmlIndex {
  name?: string;
  columns: string[];
  unique?: boolean;
  type?: string;
}

export interface DbmlReference {
  table: string;
  field: string;
}

export interface DbmlRelationship {
  name?: string;
  from: {
    table: string;
    field: string;
  };
  to: {
    table: string;
    field: string;
  };
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}

export interface DbmlSchema {
  tables: DbmlTable[];
  relationships: DbmlRelationship[];
  notes?: string[];
}

export interface EditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}

export interface DiagramProps {
  schema: DbmlSchema;
  height?: string;
}

export interface DbmlEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
} 