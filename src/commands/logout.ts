import { flags } from '@oclif/command'

import { clear } from '../conf'
import { CustomCommand } from '../lib/CustomCommand'
import log from '../logger'

export default class Logout extends CustomCommand {
  static description = 'Logout of the current VTEX account'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    this.parse(Logout)
    log.debug('Clearing config file')
    clear()
    log.info('See you soon!')
  }
}
