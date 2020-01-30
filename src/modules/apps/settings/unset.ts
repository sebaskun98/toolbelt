import { dissocPath } from 'ramda'

import { apps } from '../../../clients'

const FIELDS_START_INDEX = 3

export default async (app: string, _, options) => {
  const fields = options._.slice(FIELDS_START_INDEX)
  const newSettingsJson = await apps
    .getAppSettings(app)
    .then(dissocPath(fields))
    .then(newSettings => JSON.stringify(newSettings, null, 2))
  const response = await apps.saveAppSettings(app, newSettingsJson)
  console.log(response)
}
