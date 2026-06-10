module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Disable body line length checks to allow auto-generated file lists in body
    'body-max-line-length': [0],
    // Add any custom rules here if needed
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
};
