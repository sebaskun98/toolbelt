import { flags } from '@oclif/command'
import { CustomCommand } from '../lib/CustomCommand'

export default class ABTestStart extends CustomCommand {
  static description = 'Say hello'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({ char: 'n', description: 'name to print' }),
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(ABTestStart)
  }
}
