import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const loadVsCodeTheme = () => {
    console.log('Registering vscode-dark theme');
  monaco.editor.defineTheme('vscode-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'd4d4d4' },               // Default text
      { token: 'comment', foreground: '6a9955' },        // Comments
      { token: 'string', foreground: 'ce9178' },         // Strings
      { token: 'number', foreground: 'b5cea8' },         // Numbers
      { token: 'keyword', foreground: 'c586c0' },        // Keywords
      { token: 'operator', foreground: 'd4d4d4' },       // Operators
      { token: 'namespace', foreground: '4ec9b0' },      // Namespaces
      { token: 'type.identifier', foreground: '4ec9b0' },// Types
      { token: 'function', foreground: 'dcdcaa' },       // Functions
      { token: 'class', foreground: '4ec9b0' },          // Classes
      { token: 'variable', foreground: '9cdcfe' },       // Variables
      { token: 'constant', foreground: '9cdcfe' }        // Constants
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorCursor.foreground': '#ffffff',
      'editor.lineHighlightBackground': '#2a2d2e',
      'editorLineNumber.foreground': '#858585',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorIndentGuide.background': '#404040',
      'editorWhitespace.foreground': '#3b3a32'
    }
  });
};
