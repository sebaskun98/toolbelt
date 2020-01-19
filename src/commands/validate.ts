import { flags } from '@oclif/command'
import chalk from 'chalk'

import { CustomCommand } from '../lib/CustomCommand'
import logger from '../logger'

export default class Validate extends CustomCommand {
  static description = 'DEPRECATED'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = []

  async run() {
    this.parse(Validate)
    logger.error(
      `${chalk.bold.red(
        `Your app was NOT deployed. The command 'vtex validate' is deprecated, please use`
      )} ${chalk.bold.blue('vtex deploy')} ${chalk.bold.red(`instead.`)}`
    )
    process.exit(1)
  }
}
