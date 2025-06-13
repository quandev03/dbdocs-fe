import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import type { NodeProps } from 'react-flow-renderer';

interface TableNodeData {
  tableName: string;
  fields: Array<{
    name: string;
    type: string;
    pk: boolean;
    note?: string;
  }>;
}

const TableNode = ({ data }: NodeProps<TableNodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          border: '1px solid #777',
          borderRadius: '5px',
          background: '#f9f9f9',
          width: 200,
        }}
      >
        <div
          style={{
            padding: '10px',
            background: '#eee',
            borderBottom: '1px solid #777',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {data.tableName}
        </div>
        <div style={{ padding: '10px' }}>
          {data.fields.map((field, index) => (
            <div key={index} style={{ marginBottom: '5px', fontSize: '14px' }}>
              <strong>{field.name}</strong>: <em>{field.type}</em>{' '}
              {field.pk && '(PK)'}
            </div>
          ))}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default TableNode;
