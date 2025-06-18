import React, { useEffect, useRef } from 'react';
import Editor, { Monaco, OnMount, OnChange } from '@monaco-editor/react';
import { EditorProps } from '../types';
import { DBML_LANGUAGE_CONFIG, DBML_LANGUAGE_DEFINITION } from '../constants/dbml-syntax';

export const CodeEditor: React.FC<EditorProps> = ({
  initialValue = '',
  onChange,
  height = '100%',
  readOnly = false,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register DBML language
    monaco.languages.register({ id: 'dbml' });
    monaco.languages.setMonarchTokensProvider('dbml', DBML_LANGUAGE_DEFINITION as any);
    monaco.languages.setLanguageConfiguration('dbml', DBML_LANGUAGE_CONFIG as any);

    // Set editor options
    editor.updateOptions({
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });

    // Focus the editor
    editor.focus();
  };

  // Update value when initialValue changes
  useEffect(() => {
    if (editorRef.current && initialValue !== editorRef.current.getValue()) {
      editorRef.current.setValue(initialValue);
    }
  }, [initialValue]);

  const handleChange: OnChange = (value) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="dbml-code-editor" style={{ height }}>
      <Editor
        height="100%"
        defaultLanguage="dbml"
        defaultValue={initialValue}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          theme: 'vs-dark',
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontSize: 14,
          tabSize: 2,
        }}
      />
    </div>
  );
}; 