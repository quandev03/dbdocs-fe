import { loader } from '@monaco-editor/react';

// Pre-configure Monaco Editor for better performance
export const preloadMonacoEditor = () => {
  console.log('Pre-loading Monaco Editor...');
  
  // Use Monaco CDN for better reliability
  loader.config({
    'vs/nls': {
      availableLanguages: {
        '*': 'en',
      },
    },
  });

  // Pre-load Monaco Editor
  loader.init().then((monaco) => {
    console.log('Monaco Editor pre-loaded successfully');
    
    // Pre-register DBML language
    const languages = monaco.languages.getLanguages();
    const dbmlExists = languages.some(lang => lang.id === 'dbml');
    
    if (!dbmlExists) {
      monaco.languages.register({ id: 'dbml' });
      monaco.languages.setMonarchTokensProvider('dbml', {
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

      // Define custom dark theme for DBML
      monaco.editor.defineTheme('dbml-dark', {
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
      
      console.log('DBML language and custom theme pre-registered');
    }
  }).catch((error) => {
    console.error('Failed to pre-load Monaco Editor:', error);
  });
};

export default preloadMonacoEditor; 