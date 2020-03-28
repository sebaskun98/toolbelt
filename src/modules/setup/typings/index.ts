import { getManifest } from '../../../manifest'
import { setupTypings } from './setupTypings'

export default async (opts: { i?: boolean; 'ignore-linked': boolean }) => {
  const ignoreLinked = opts.i || opts['ignore-linked']
  const manifest = await getManifest()
  await setupTypings(manifest, ignoreLinked)
}
