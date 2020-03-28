import { getManifest } from '../../../manifest'
import { setupTooling } from './setupTooling'

export default async () => {
  const manifest = await getManifest()
  setupTooling(manifest)
}
