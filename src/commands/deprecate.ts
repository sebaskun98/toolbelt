import { flags } from '@oclif/command'
import chalk from 'chalk'

import { createClients } from '../clients'
import { getAccount, getToken, getWorkspace } from '../conf'
import { UserCancelledError } from '../errors'
import { CustomCommand } from '../lib/CustomCommand'
import { ManifestEditor, ManifestValidator } from '../lib/manifest'
import { parseLocator } from '../locator'
import log from '../logger'
import { switchAccountMessage } from '../modules/apps/utils'
import { promptConfirm } from '../modules/prompts'
import { switchAccount } from './switch'

let originalAccount
let originalWorkspace

const switchToVendorMessage = (vendor: string): string => {
  return `You are trying to deprecate this app in an account that differs from the indicated vendor. Do you want to deprecate in account ${chalk.blue(
    vendor
  )}?`
}

const promptDeprecate = (appsList: string[]) =>
  promptConfirm(
    `Are you sure you want to deprecate app` +
      (appsList.length > 1 ? 's' : '') +
      ` ${chalk.green(appsList.join(', '))}?`
  )

const promptDeprecateOnVendor = (msg: string) => promptConfirm(msg)

const switchToPreviousAccount = async (previousAccount: string, previousWorkspace: string) => {
  const currentAccount = getAccount()
  if (previousAccount !== currentAccount) {
    const canSwitchToPrevious = await promptDeprecateOnVendor(switchAccountMessage(previousAccount, currentAccount))
    if (canSwitchToPrevious) {
      return await switchAccount(previousAccount, previousWorkspace)
    }
  }
  return
}

const deprecateApp = async (app: string): Promise<void> => {
  const { vendor, name, version } = parseLocator(app)
  const account = getAccount()
  if (vendor !== account) {
    const canSwitchToVendor = await promptDeprecateOnVendor(switchToVendorMessage(vendor))
    if (!canSwitchToVendor) {
      throw new UserCancelledError()
    }
    await switchAccount(vendor, 'master')
  }
  const context = { account: vendor, workspace: 'master', authToken: getToken() }
  const { registry } = createClients(context)
  return await registry.deprecateApp(`${vendor}.${name}`, version)
}

const prepareAndDeprecateApps = async (appsList: string[]): Promise<void> => {
  for (const app of appsList) {
    ManifestValidator.validateApp(app)
    log.debug('Starting to deprecate app:', app)

    try {
      await deprecateApp(app)
      log.info('Successfully deprecated', app)
    } catch (e) {
      if (e.response && e.response.status && e.response.status === 404) {
        log.error(`Error deprecating ${app}. App not found`)
      } else if (e.message && e.response.statusText) {
        log.error(`Error deprecating ${app}. ${e.message}. ${e.response.statusText}`)
        return await switchToPreviousAccount(originalAccount, originalWorkspace)
      } else {
        await switchToPreviousAccount(originalAccount, originalWorkspace)
        throw e
      }
    }
  }

  await switchToPreviousAccount(originalAccount, originalWorkspace)
}

export default class Deprecate extends CustomCommand {
  static description = 'Deprecate an app'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
    yes: flags.boolean({ description: 'Confirm all prompts', char: 'y', default: false }),
  }

  static args = [{ name: 'appId', required: true }]

  async run() {
    const { args, flags } = this.parse(Deprecate)
    const preConfirm = flags.yes
    const optionalApp = args.appId

    originalAccount = getAccount()
    originalWorkspace = getWorkspace()
    const appsList = [optionalApp || (await ManifestEditor.getManifestEditor()).appLocator]

    if (!preConfirm && !(await promptDeprecate(appsList))) {
      throw new UserCancelledError()
    }

    log.debug('Deprecating app' + (appsList.length > 1 ? 's' : '') + `: ${appsList.join(', ')}`)
    return prepareAndDeprecateApps(appsList)
  }
}
