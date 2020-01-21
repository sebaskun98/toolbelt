export default {
  handler: './',
  workspace: {
    delete: {
      description: 'Delete a single or various workspaces',
      handler: './workspace/delete',
      options: [
        {
          description: 'Auto confirm prompts',
          long: 'yes',
          short: 'y',
          type: 'boolean',
        },
        {
          description: "Ignore if you're currently using the workspace",
          long: 'force',
          short: 'f',
          type: 'boolean',
        },
      ],
      requiredArgs: 'name',
    },
    description: 'Alias for vtex workspace info',
    handler: './workspace/info',
    info: {
      description: 'Display information about the current workspace',
      handler: './workspace/info',
    },
    list: {
      alias: 'ls',
      description: 'List workspaces on this account',
      handler: './workspace/list',
    },
    promote: {
      description: 'Promote this workspace to master',
      handler: './workspace/promote',
    },
    reset: {
      description: 'Delete and create a workspace',
      handler: './workspace/reset',
      optionalArgs: 'name',
      options: [
        {
          description: 'Whether to re-create the workspace as a production one',
          long: 'production',
          short: 'p',
          type: 'boolean',
        },
      ],
    },
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
