import { flags } from '@oclif/command'

import { getAccount } from '../../conf'
import { CustomCommand } from '../../lib/CustomCommand'
import { copyToClipboard } from '../../modules/local/utils'

export default class LocalAccount extends CustomCommand {
  static description = 'Show current account and copy it to clipboard'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    this.parse(LocalAccount)
    const account = getAccount()
    copyToClipboard(account)
    return console.log(account)
  }
}
