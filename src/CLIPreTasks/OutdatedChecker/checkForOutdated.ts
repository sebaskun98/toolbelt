import { ToolbeltConfigClient } from '../../clients/toolbeltConfigClient'
import { ErrorKinds } from '../../lib/error/ErrorKinds'
import { ErrorReport } from '../../lib/error/ErrorReport'
import { TelemetryCollector } from '../../lib/telemetry/TelemetryCollector'
import { IOutdatedCheckerStore, OutdatedCheckerStore } from './OutdatedCheckerStore'

export const checkForOutdated = async (store: IOutdatedCheckerStore, pkgVersion: string) => {
  try {
    const client = ToolbeltConfigClient.createDefaultClient({ retries: 3 })
    const { validVersion } = await client.versionValidate(pkgVersion)
    store.setOutdatedInfo({
      versionChecked: pkgVersion,
      outdated: validVersion === false,
    })

    store.setLastOutdatedCheck(Date.now())
    process.exit()
  } catch (err) {
    const telemetryCollector = TelemetryCollector.getCollector()
    telemetryCollector.registerError(
      ErrorReport.create({
        kind: ErrorKinds.OUTDATED_CHECK_ERROR,
        originalError: err,
      })
    )

    await telemetryCollector.flush()
    process.exit(1)
  }
}

if (require.main === module) {
  const storeFilePath = process.argv[2]
  const store = new OutdatedCheckerStore(storeFilePath)
  const pkgVersion = process.argv[3]
  checkForOutdated(store, pkgVersion)
}
