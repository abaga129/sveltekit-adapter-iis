import fs from 'fs-extra'
import node_adapter from '@sveltejs/adapter-node'
import fg from 'fast-glob';
import path from 'node:path'

import { WEB_CONFIG } from './web.config.js'
import { EXPRESS_SERVER_CJS } from './express-server.cjs.js'

const outputFolder = '.svelte-kit/adapter-iis'

// 

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

/** @param {string[]} ignoreGlobs */
function cleanupOutputDirectory(ignoreGlobs) {
	const paths = fg.globSync('**/*', { ignore: ignoreGlobs, cwd: path.resolve(outputFolder), dot: true } )
	// fs.rmSync(`${outputFolder}/app`, { recursive: true, force: true })
	for (const p of paths) { 
		fs.rmSync(`${outputFolder}/${p}`, { force: true }) 
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
      await na.adapt(builder) // this populates ${outputFolder}/app with other things
      console.info('Finished adapting with @sveltejs/adapter-node')
      console.info('Adapting with sveltekit-adapter-iis (fork)')

      cleanupOutputDirectory(options?.outputWhitelistGlobs ?? [])
      moveOutputToServerFolder()

      let webConfig = WEB_CONFIG
      let nodeExePath =
        options && options.overrideNodeExePath
          ? options.overrideNodeExePath
          : 'node.exe'

      webConfig = webConfig.replace('{{NODE_PATH}}', nodeExePath)
      writeFileToOutput(webConfig, 'web.config')
      writeFileToOutput(EXPRESS_SERVER_CJS, 'express-server.cjs')
      copyToOutput('package.json')
      copyToOutput('package-lock.json')
      copyToOutput('yarn.lock')
			copyToOutput('pnpm-lock.yml')

      console.info('Finished adapting with sveltekit-adapter-iis')
    },
  }

  return adapter
}
