import React, { useState, useEffect, useMemo } from 'react';
import Split from 'react-split';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { Parser } from '@dbml/core';
import ReactFlow, { MiniMap, Controls } from 'react-flow-renderer';
import type { Node, Edge } from 'react-flow-renderer';
import TableNode from '../components/TableNode';

const defaultDBML = `
Table users {
  id int [pk]
  name varchar
  created_at timestamp
}

Table posts {
  id int [pk]
  user_id int [ref: > users.id]
  title varchar
  body text [note: 'Content of the post']
}
`;

const DBMLDiagramEditor = () => {
  const [dbmlText, setDbmlText] = useState(defaultDBML);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);

  useEffect(() => {
    try {
      const ast = Parser.parse(dbmlText, 'dbml');
      const tables = ast.schemas?.[0]?.tables || [];

      const newNodes: Node[] = tables.map((table, idx) => ({
        id: table.name,
        type: 'tableNode',
        position: { x: idx * 250, y: 50 },
        data: {
          tableName: table.name,
          fields: table.fields.map((field: any) => ({
            name: field.name,
            type: field.type.type_name,
            pk: field.pk,
            note: field.note,
          })),
        },
      }));

      const newEdges: Edge[] = [];
      tables.forEach((table: any) => {
        table.fields.forEach((field: any, index: number) => {
          const reference = field?.endpoints[0]?.ref?.endpoints?.[1];

          if (reference?.tableName) {
            const target = reference?.tableName;
            newEdges.push({
              id: `${table.name}.${field.name}-${target}`,
              source: table.name,
              target: target,
              type: 'smoothstep',
              label: `${table.name} to ${target}`,
            });
          }
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (e) {
      console.error('Parse error:', e);
    }
  }, [dbmlText]);

  return (
    <Split className="flex h-screen" sizes={[50, 50]} direction="horizontal">
      <div className="h-full p-4">
        <CodeMirror
          value={dbmlText}
          height="100%"
          theme="dark"
          extensions={[EditorView.lineWrapping]}
          onChange={(value) => setDbmlText(value)}
        />
      </div>
      <div className="w-full h-full bg-gray-50">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </Split>
  );
};

export default DBMLDiagramEditor;
