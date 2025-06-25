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
      console.log('DBML language pre-registered');
    }
  }).catch((error) => {
    console.error('Failed to pre-load Monaco Editor:', error);
  });
};

export default preloadMonacoEditor; 