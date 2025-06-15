import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DiagramProps } from '../types';

// Custom node component for tables
const TableNode = ({ data }: any) => {
  return (
    <div className="bg-white border border-gray-300 rounded shadow-md w-64">
      <div className="bg-blue-600 text-white p-2 font-bold border-b border-gray-300 rounded-t">
        {data.label}
        {data.note && (
          <div className="text-xs font-normal mt-1 italic">{data.note}</div>
        )}
      </div>
      <div className="p-0">
        {data.fields.map((field: any, index: number) => (
          <div
            key={index}
            className={`px-2 py-1 border-b border-gray-200 text-sm flex justify-between ${
              index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              {field.pk && <span className="text-yellow-500 mr-1">🔑</span>}
              {field.name}
            </div>
            <div className="text-gray-600">{field.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Node types definition
const nodeTypes: NodeTypes = {
  tableNode: TableNode,
};

export const Diagram: React.FC<DiagramProps> = ({ schema, height = '100%' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Create nodes and edges from schema
  const createNodesAndEdges = useCallback(() => {
    if (!schema) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Create nodes for tables
    schema.tables.forEach((table, index) => {
      newNodes.push({
        id: table.name,
        type: 'tableNode',
        position: { x: 100 + (index % 3) * 300, y: 100 + Math.floor(index / 3) * 300 },
        data: {
          label: table.name,
          note: table.note,
          fields: table.fields,
        },
      });
    });

    // Create edges for relationships
    schema.relationships.forEach((rel, index) => {
      newEdges.push({
        id: `e${index}`,
        source: rel.from.table,
        target: rel.to.table,
        animated: true,
        label: getRelationshipLabel(rel.type),
        type: 'smoothstep',
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [schema, setNodes, setEdges]);

  // Helper to get relationship label
  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'one-to-one':
        return '1:1';
      case 'one-to-many':
        return '1:N';
      case 'many-to-one':
        return 'N:1';
      case 'many-to-many':
        return 'N:N';
      default:
        return '';
    }
  };

  // Update nodes and edges when schema changes
  useEffect(() => {
    createNodesAndEdges();
  }, [schema, createNodesAndEdges]);

  return (
    <div style={{ height }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Controls />
          <MiniMap />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}; 