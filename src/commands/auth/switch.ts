import { flags } from '@oclif/command'
import chalk from 'chalk'

import { getAccount, getLastUsedAccount, getLogin, getTokens, getWorkspace } from '../../conf'
import { CommandError } from '../../errors'
import { CustomCommand } from '../../lib/CustomCommand'
import log from '../../logger'
import { Token } from '../../Token'
import { saveCredentials, doLogin } from './login'

export const switchAccount = async (account: string, workspace: string, previousAccount = getAccount()) => {
  const isValidAccount = /^\s*[\w-]+\s*$/.test(account)

  if (!isValidAccount) {
    throw new CommandError('Invalid account format')
  } else if (!previousAccount) {
    throw new CommandError("You're not logged in right now")
  } else if (previousAccount === account) {
    throw new CommandError(`You're already using the account ${chalk.blue(account)}`)
  }

  const accountToken = new Token(getTokens()[account])
  if (accountToken.isValid()) {
    log.debug(`Token stored for ${account}/${accountToken.login} is still valid`)
    saveCredentials(accountToken.login, account, accountToken.token, workspace)
    log.info(
      `Logged into ${chalk.blue(getAccount())} as ${chalk.green(getLogin())} at workspace ${chalk.green(
        getWorkspace()
      )}`
    )
  } else {
    log.debug(`Token for ${account} isn't stored or isn't valid`)
    return doLogin({ account }, { workspace })
  }
}

const hasAccountSwitched = (account: string) => {
  return account === getAccount()
}

export default class Switch extends CustomCommand {
  static description = 'Switch to another VTEX account'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
    workspace: flags.string({ char: 'w', description: 'Specify login workspace', default: 'master' }),
  }

  static args = [{ name: 'account', required: true }]

  async run() {
    const { args, flags } = this.parse(Switch)
    let account = args.account
    if (account === '-') {
      account = getLastUsedAccount()
      if (account == null) {
        throw new CommandError('No last used account was found')
      }
    }

    const previousAccount = getAccount()
    await switchAccount(account, flags.workspace)
    if (hasAccountSwitched(account)) {
      log.info(`Switched from ${chalk.blue(previousAccount)} to ${chalk.blue(account)}`)
    }
  }
}
