import fs, { writeFileSync, copyFileSync } from 'fs'
import { WEB_CONFIG } from './web.config.js'
import { SERVER_CJS } from './port.js'

/** @type {import('.').default} */
export default function ({ overrideNodeExePath, overridePort }) {
  /** @type {import('@sveltejs/kit').Adapter} */
  const adapter = {
    name: 'sveltekit-adapter-iis',
    async adapt(builder) {
      const outputDir = `${builder.config.kit.outDir}/output`

      let webConfig = WEB_CONFIG
      if (options.overrideNodeExePath) {
        webConfig = webConfig.replace(
          '{{NODE_PATH}}',
          options.overrideNodeExePath
        )
      }
      if (options.overridePort) {
        webConfig = webConfig.replace('{{PORT}}', options.overridePort)
      }
      writeFileSync(`${outputDir}/web.config`, webConfig)
      writeFileSync(`${outputDir}/server/server.cjs`, SERVER_CJS)
      copyFileSync(
        `${builder.config.kit.env.dir}/package.json`,
        `${outputDir}/package.json`
      )
    },
  }

  return adapter
}
