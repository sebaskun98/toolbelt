import { getManifest } from '../../../manifest'
import { setupTSConfig } from './setupTSConfig'

export default async () => {
  const manifest = await getManifest()
  await setupTSConfig(manifest)
}
