module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    name: 'conventional-changelog-custom',
    parserOpts: {
      // Cấu trúc: type(SCOPE): subject
      // SCOPE là ví dụ như C010GESIM-0
      headerPattern: /^(\w+)\(([A-Z0-9\-]+)\): (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [2, 'always', ['bug', 'feat', 'hotfix', 'release']],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'upper-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never'],
    'header-max-length': [2, 'always', 150],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
