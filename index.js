import fs from 'fs-extra'
import { WEB_CONFIG } from './web.config.js'
import { EXPRESS_SERVER_CJS } from './express-server.cjs.js'
import node_adapter from '@sveltejs/adapter-node'

const outputFolder = '.svelte-kit/adapter-iis'

function moveOutputToServerFolder() {
  const fileList = [
    'client',
    'server',
    'env.js',
    'handler.js',
    'index.js',
    'shims.js',
  ]
  fileList.forEach((f) => {
    const from = `build/${f}`
    const to = `${outputFolder}/app/${f}`
    fs.moveSync(from, to, (err) => console.error(err))
  })
}

function writeFileToOutput(fileContents, fileName) {
  fs.writeFileSync(`${outputFolder}/${fileName}`, fileContents)
}

function copyToOutput(path) {
  if (fs.existsSync(path)) {
    fs.copySync(path, `${outputFolder}/${path}`)
  }
}

function cleanupOutputDirectory() {
  if (fs.pathExistsSync(outputFolder)) {
    fs.rmSync(outputFolder, { recursive: true, force: true })
  }
}

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

      cleanupOutputDirectory()
      moveOutputToServerFolder()

      let webConfig = WEB_CONFIG
      let nodeExePath = options.overrideNodeExePath
        ? options.overrideNodeExePath
        : 'node.exe'

      webConfig = webConfig.replace('{{NODE_PATH}}', nodeExePath)
      writeFileToOutput(webConfig, 'web.config')
      writeFileToOutput(EXPRESS_SERVER_CJS, 'express-server.cjs')
      copyToOutput('package.json')
      copyToOutput('package-lock.json')
      copyToOutput('yarn.lock')

      console.info('Finished adapting with sveltekit-adapter-iis')
    },
  }

  return adapter
}
