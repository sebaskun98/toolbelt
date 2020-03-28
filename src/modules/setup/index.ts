import { getManifest } from '../../manifest'
import { setupTooling } from './tooling/setupTooling'
import { setupTSConfig } from './tsconfig/setupTSConfig'
import { setupTypings } from './typings/setupTypings'

export default async (opts: { i?: boolean; 'ignore-linked': boolean }) => {
  const ignoreLinked = opts.i || opts['ignore-linked']
  const manifest = await getManifest()

  setupTooling(manifest)
  await setupTSConfig(manifest)
  await setupTypings(manifest, ignoreLinked)
}
