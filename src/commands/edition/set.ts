import { flags } from '@oclif/command'
import chalk from 'chalk'
import R from 'ramda'

import { Sponsor } from '../../clients/sponsor'
import * as conf from '../../conf'
import { UserCancelledError } from '../../errors'
import { CustomCommand } from '../../lib/CustomCommand'
import log from '../../logger'
import { promptConfirm } from '../../modules/prompts'
import { getIOContext, IOClientOptions, switchToPreviousAccount } from '../../modules/utils'
import { switchAccount } from '../auth/switch'

const promptSwitchToAccount = async (account: string, initial: boolean) => {
  const reason = initial
    ? `Initial edition can only be set by ${chalk.blue(account)} account`
    : `Only current account sponsor (${chalk.blue(account)}) can change its edition`
  const proceed = await promptConfirm(`${reason}. Do you want to switch to account ${chalk.blue(account)}?`)
  if (!proceed) {
    throw new UserCancelledError()
  }
  await switchAccount(account, 'master')
}

export default class EditionSet extends CustomCommand {
  static description = 'Set edition of the current account'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [{ name: 'edition', required: true }]

  async run() {
    const {
      args: { edition },
    } = this.parse(EditionSet)

    const previousConf = conf.getAll()
    const previousAccount = previousConf.account
    const sponsorClient = new Sponsor(getIOContext(), IOClientOptions)
    const data = await sponsorClient.getSponsorAccount()
    const sponsorAccount = R.prop('sponsorAccount', data)
    if (!sponsorAccount) {
      await promptSwitchToAccount('vtex', true)
    } else if (previousAccount !== sponsorAccount) {
      await promptSwitchToAccount(sponsorAccount, false)
    }
    const sponsorClientForSponsorAccount = new Sponsor(getIOContext(), IOClientOptions)
    await sponsorClientForSponsorAccount.setEdition(previousAccount, edition)
    log.info(`Successfully set new edition in account ${chalk.blue(previousAccount)}.`)
    await switchToPreviousAccount(previousConf)
  }
}
