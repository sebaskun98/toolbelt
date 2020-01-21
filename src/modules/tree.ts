export default {
  handler: './',
  redirects: {
    import: {
      description: 'Import redirects for the current account and workspace',
      handler: './rewriter/import',
      requiredArgs: 'csvPath',
      options: [
        {
          description: 'Remove all previous redirects',
          long: 'reset',
          short: 'r',
          type: 'boolean',
        },
      ],
    },
  },
}
