import { flags } from '@oclif/command'
import { path } from 'ramda'
import { apps } from '../../../clients'
import { CustomCommand } from '../../lib/CustomCommand'

const getAppSettings = Promise.method(apps.getAppSettings)

const FIELDS_START_INDEX = 2

export default class SettingsGet extends CustomCommand {
  static description = 'Get app settings'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [
    { name: 'appId', required: true },
    { name: 'fields', required: false },
  ]

  async run() {
    const { raw } = this.parse(SettingsGet)
    const options = this.getAllArgs(raw)
    const app = options[0]
    const fields = options.slice(FIELDS_START_INDEX)
    return getAppSettings(app)
      .then(settings => (fields === null ? settings : path(fields, settings)))
      .then(value => JSON.stringify(value, null, 2))
      .tap(console.log)
  }
}
