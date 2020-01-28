import { merge, zipObj, __ } from 'ramda'
import { apps } from '../../../clients'
import { parseArgs } from '../utils'

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

export default async (app: string, _, ___, options) => {
  const commandSettings = transformCommandsToObj(parseArgs(options._))
  const newSettings = await apps
    .getAppSettings(app)
    .then(merge(__, commandSettings))
    .then(newSettings => JSON.stringify(newSettings, null, 2))
  const response = await apps.saveAppSettings(app, newSettings)
  console.log(response)
}
