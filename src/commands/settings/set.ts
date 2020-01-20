import { flags } from '@oclif/command'
import { merge, zipObj, __ } from 'ramda'
import { apps } from '../../../clients'
import { CustomCommand } from '../../lib/CustomCommand'
import { parseArgs } from '../utils'

const getAppSettings = Promise.method(apps.getAppSettings)
const saveAppSettings = Promise.method(apps.saveAppSettings)

const castValue = value => {
  let parsedValue
  try {
    parsedValue = JSON.parse(value)
  } catch (err) {
    parsedValue = value
  }
  const numberCast = Number(value)
  return isNaN(numberCast) ? parsedValue : numberCast
}

const transformCommandsToObj = commandSettings => {
  const k = []
  const v = []
  for (const [idx, val] of commandSettings.entries()) {
    const realValue = castValue(val)
    if (idx % 2) {
      v.push(realValue)
    } else {
      k.push(realValue)
    }
  }
  return zipObj(k, v)
}

export default class SettingsSet extends CustomCommand {
  static description = 'Set a value'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  static args = [
    { name: 'appId', required: true },
    { name: 'fields', required: true },
    { name: 'value', required: true },
  ]

  async run() {
    const { raw } = this.parse(SettingsSet)
    const [app, options] = this.getAllArgs(raw)

    const commandSettings = transformCommandsToObj(parseArgs(options))
    return getAppSettings(app)
      .then(merge(__, commandSettings))
      .then(newSettings => JSON.stringify(newSettings, null, 2))
      .tap(newSettings => saveAppSettings(app, newSettings))
      .tap(console.log)
  }
}
