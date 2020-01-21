export default {
  handler: './',
  workspace: {
    status: {
      description: 'Display information about a workspace',
      handler: './workspace/status',
      optionalArgs: 'name',
    },
  },
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
    export: {
      description: 'Export all redirects in the current account and workspace',
      handler: './rewriter/export',
      requiredArgs: 'csvPath',
    },
    delete: {
      description: 'Delete redirects in the current account and workspace',
      handler: './rewriter/delete',
      requiredArgs: 'csvPath',
    },
  },
}
