export default {
  handler: './',
  workspace: {
    abtest: {
      start: {
        description: 'Start AB testing with current workspace',
        handler: './workspace/abtest/start',
      },
      finish: {
        description: 'Stop all AB testing in current account',
        handler: './workspace/abtest/finish',
      },
      status: {
        description: 'Display currently running AB tests results',
        handler: './workspace/abtest/status',
      },
    },
    create: {
      description: 'Create a new workspace with this name',
      handler: './workspace/create',
      requiredArgs: 'name',
      options: [
        {
          description: 'Create a production workspace',
          long: 'production',
          short: 'p',
          type: 'boolean',
        },
      ],
    },
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
  release: {
    description:
      'Bump app version, commit and push to remote. Only for git users. The first option can also be a specific valid semver version',
    handler: './release',
    optionalArgs: ['releaseType', 'tagName'],
  },
  url: {
    description: 'Prints base URL for current account, workspace and environment',
    handler: './url',
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
  edition: {
    description: 'Get edition of the current account',
    handler: './sponsor/getEdition',
    set: {
      description: 'Set edition of the current account',
      handler: './sponsor/setEdition',
      requiredArgs: 'edition',
    },
  },
}
