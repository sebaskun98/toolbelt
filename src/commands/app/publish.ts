import { flags } from '@oclif/command'
import { BuildResult } from '@vtex/api'
import retry from 'async-retry'
import chalk from 'chalk'
import ora from 'ora'
import { isEmpty, map } from 'ramda'

import * as conf from '../../conf'
import { region } from '../../env'
import { UserCancelledError } from '../../errors'
import { CustomCommand } from '../../lib/CustomCommand'
import { createPathToFileObject } from '../../lib/files/ProjectFilesManager'
import { ManifestEditor } from '../../lib/manifest'
import { toAppLocator } from '../../locator'
import log from '../../logger'
import { getAppRoot } from '../../manifest'
import { listLocalFiles } from '../../modules/apps/file'
import { ProjectUploader } from '../../modules/apps/ProjectUploader'
import { checkBuilderHubMessage, showBuilderHubMessage } from '../../modules/apps/utils'
import { listenBuild } from '../../modules/build'
import { promptConfirm } from '../../modules/prompts'
import { runYarnIfPathExists, switchToPreviousAccount } from '../../modules/utils'
import { switchAccount } from '../auth/switch'

const root = getAppRoot()
const buildersToRunLocalYarn = ['node', 'react']

const automaticTag = (version: string): string => (version.indexOf('-') > 0 ? null : 'latest')

const publisher = (workspace = 'master') => {
  const publishApp = async (
    appRoot: string,
    tag: string,
    force: boolean,
    projectUploader: ProjectUploader
  ): Promise<BuildResult> => {
    const paths = await listLocalFiles(appRoot)
    const retryOpts = {
      retries: 2,
      minTimeout: 1000,
      factor: 2,
    }
    const publish = async (_, tryCount) => {
      const filesWithContent = map(createPathToFileObject(appRoot), paths)
      if (tryCount === 1) {
        log.debug('Sending files:', '\n' + paths.join('\n'))
      }
      if (tryCount > 1) {
        log.info(`Retrying...${tryCount - 1}`)
      }

      try {
        return await projectUploader.sendToPublish(filesWithContent, tag, { skipSemVerEnsure: force })
      } catch (err) {
        const response = err.response
        const status = response.status
        const data = response && response.data
        const message = data.message
        const statusMessage = status ? `: Status ${status}` : ''
        log.error(`Error publishing app${statusMessage} (try: ${tryCount})`)
        if (message) {
          log.error(`Message: ${message}`)
        }
        if (status && status < 500) {
          return
        }
        throw err
      }
    }
    return await retry(publish, retryOpts)
  }

  const publishApps = async (path: string, tag: string, force: boolean): Promise<void | never> => {
    const previousConf = conf.getAll() // Store previous configuration in memory

    const manifest = await ManifestEditor.getManifestEditor()
    const account = conf.getAccount()

    const builderHubMessage = await checkBuilderHubMessage('publish')
    if (!isEmpty(builderHubMessage)) {
      await showBuilderHubMessage(builderHubMessage.message, builderHubMessage.prompt, manifest)
    }

    if (manifest.vendor !== account) {
      const switchToVendorMsg = `You are trying to publish this app in an account that differs from the indicated vendor. Do you want to publish in account ${chalk.blue(
        manifest.vendor
      )}?`
      const canSwitchToVendor = await promptConfirm(switchToVendorMsg)
      if (!canSwitchToVendor) {
        throw new UserCancelledError()
      }
      await switchAccount(manifest.vendor, 'master')
    }

    const pubTag = tag || automaticTag(manifest.version)
    const appId = toAppLocator(manifest)
    const context = { account: manifest.vendor, workspace, region: region(), authToken: conf.getToken() }
    const projectUploader = ProjectUploader.getProjectUploader(appId, context)

    const oraMessage = ora(`Publishing ${appId} ...`)
    const spinner = log.level === 'debug' ? oraMessage.info() : oraMessage.start()
    try {
      const senders = ['vtex.builder-hub', 'apps']
      const { response } = await listenBuild(appId, () => publishApp(path, pubTag, force, projectUploader), {
        waitCompletion: true,
        context,
        senders,
      })
      if (response.code !== 'build.accepted') {
        spinner.warn(
          `${appId} was published successfully, but you should update your builder hub to the latest version.`
        )
      } else {
        spinner.succeed(`${appId} was published successfully!`)
        log.info(`You can deploy it with: ${chalk.blueBright(`vtex deploy ${appId}`)}`)
      }
    } catch (e) {
      spinner.fail(`Failed to publish ${appId}`)
    }

    await switchToPreviousAccount(previousConf)

    Promise.resolve()
  }

  return { publishApp, publishApps }
}

export default class Publish extends CustomCommand {
  static description = 'Publish the current app or a path containing an app'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
    tag: flags.string({ char: 't', description: 'Apply a tag to the release' }),
    workspace: flags.string({ char: 'w', description: 'Specify the workspace for the app registry' }),
    force: flags.boolean({ char: 'f', description: 'Publish app without checking if the semver is being respected' }),
    yes: flags.boolean({ char: 'y', description: 'Answer yes to confirmation prompts' }),
  }

  static args = [{ name: 'path', required: false }]

  async run() {
    const { args, flags } = this.parse(Publish)

    log.debug(`Starting to publish app in ${conf.getEnvironment()}`)

    const manifest = await ManifestEditor.getManifestEditor()
    const versionMsg = chalk.bold.yellow(manifest.version)
    const appNameMsg = chalk.bold.yellow(`${manifest.vendor}.${manifest.name}`)

    const yesFlag = flags.yes

    if (!yesFlag) {
      const confirmVersion = await promptConfirm(
        `Are you sure that you want to release version ${chalk.bold(`${versionMsg} of ${appNameMsg}?`)}`,
        false
      )

      if (!confirmVersion) {
        process.exit(1)
      }

      const response = await promptConfirm(
        chalk.yellow.bold(
          `Starting January 2, 2020, the 'vtex publish' command will change its behavior and more steps will be added to the publishing process. Read more about this change on the following link:\nhttp://bit.ly/2ZIJucc\nAcknowledged?`
        ),
        false
      )
      if (!response) {
        process.exit(1)
      }
    }

    if (yesFlag && manifest.vendor !== conf.getAccount()) {
      log.error(`When using the 'yes' flag, you need to be logged in to the same account as your app’s vendor.`)
      process.exit(1)
    }

    const path = args.path || root
    const workspace = flags.workspace
    const force = flags.force

    // Always run yarn locally for some builders
    map(runYarnIfPathExists, buildersToRunLocalYarn)

    const { publishApps } = publisher(workspace)
    await publishApps(path, flags.tag, force)
  }
}
