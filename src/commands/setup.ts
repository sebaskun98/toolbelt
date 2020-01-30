import { flags } from '@oclif/command'

import { getManifest } from '../manifest'
import { CustomCommand } from '../lib/CustomCommand'
import { setupESLint } from '../modules/setup/setupESLint'
import { setupTSConfig } from '../modules/setup/setupTSConfig'
import { setupTypings } from '../modules/setup/setupTypings'

const buildersToAddAdditionalPackages = ['react', 'node']
const buildersToAddTypes = ['react', 'node']

export const setup = async (ignoreLinked: boolean) => {
  const manifest = await getManifest()
  setupESLint(manifest, buildersToAddAdditionalPackages)
  await setupTSConfig(manifest)
  await setupTypings(manifest, ignoreLinked, buildersToAddTypes)
}

export default class Setup extends CustomCommand {
  static description = 'Download react app typings, graphql app typings, lint config and tsconfig'

  static examples = []

  static flags = {
    help: flags.help({ char: 'h' }),
    'ignore-linked': flags.boolean({ char: 'i', description: 'Add only types from apps published', default: false }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(Setup)
    const ignoreLinked = flags['ignore-linked']
    await setup(ignoreLinked)
  }
}
