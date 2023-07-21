import fs, { writeFileSync, copyFileSync } from 'fs'
import { WEB_CONFIG } from './web.config.js'
import { SERVER_CJS } from './server.cjs.js'
import node_adapter from '@sveltejs/adapter-node'

/** @type {import('.').default} */
export default function (options) {
  /** @type {import('@sveltejs/kit').Adapter} */

  const na = node_adapter(options)
  const adapter = {
    name: 'sveltekit-adapter-iis',
    async adapt(builder) {
      console.info('Adapting with @sveltejs/adapter-node')
      await na.adapt(builder)
      console.info('Finished adapting with @sveltejs/adapter-node')
      console.info('Adapting with sveltekit-adapter-iis')

      const outputDir = `build`

      let webConfig = WEB_CONFIG
      let nodeExePath = options.overrideNodeExePath
        ? options.overrideNodeExePath
        : 'node.exe'
      let portString = options.overridePort ? options.overridePort : '3000'

      webConfig = webConfig.replace('{{NODE_PATH}}', nodeExePath)
      webConfig = webConfig.replace('{{PORT}}', portString)

      writeFileSync(`${outputDir}/web.config`, webConfig)
      writeFileSync(`${outputDir}/server/server.cjs`, SERVER_CJS)
      copyFileSync(
        `${builder.config.kit.env.dir}/package.json`,
        `${outputDir}/package.json`
      )
      console.info('Finished adapting with sveltekit-adapter-iis')
    },
  }

  return adapter
}
