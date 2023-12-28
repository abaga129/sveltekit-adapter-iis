import fs from 'fs-extra';
import path from 'node:path';
import node_adapter from '@sveltejs/adapter-node';

import { createWebConfig } from './web.config.js';
import { createNodeServer } from './node-server.cjs.js';
import { parse }  from 'dotenv';

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

/** @param {string[]} whitelist */
function cleanupOutputDirectory(whitelist) {
	const ldir = fs.readdirSync(outputFolder).filter(p => !whitelist.includes(p))
	for (const thing of ldir) {
		fs.rmSync(`${outputFolder}/${thing}`, { recursive: true, force: true })
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

      cleanupOutputDirectory(options?.outputWhitelist ?? [])
      moveOutputToServerFolder()

			let env = {}
			if (typeof options.origin !== 'string') {
				console.warn(`sveltekit-adapter-iis: unspecified option 'origin'!\nForm actions will likely return errror 403: Cross-site POST form submissions are forbidden`)
			} else {
				env.origin = options.origin
			}

			if (options?.envInWebconfig ?? true) {
				const envPath = path.resolve(process.cwd(), '.env')
				if (fs.existsSync(envPath)) {
					env = parse(fs.readFileSync(envPath, { encoding: 'utf-8' }))
				}
				console.info(`Included .env variables in web.config`)
			} else {
				console.info(`Didn't include .env variables in web.config (disabled)`)
			}
			for (const key in env) {
				// XML attributes cannot contain these characters, will result in IIS Error 500.19
				env[key] = key
					.replaceAll('"', "&quot;")
					.replaceAll("'", "&apos;")
					.replaceAll("<", "&lt;")
					.replaceAll(">", "&gt;")
					.replaceAll("&", "&amp;")
			}
		

      const webConfig = createWebConfig({
				env: env,
				nodePath: options?.overrideNodeExePath,
				externalRoutes: options?.externalRoutes,
				externalRoutesIgnoreCase: options?.externalRoutesIgnoreCase
			})
			const nodeServer = createNodeServer(options?.healthcheckRoute ?? true)

      writeFileToOutput(webConfig, 'web.config')
      writeFileToOutput(nodeServer, 'node-server.cjs')
      copyToOutput('package.json')
      copyToOutput('package-lock.json')
      copyToOutput('yarn.lock')
			copyToOutput('pnpm-lock.yml')

      console.info('Finished adapting with sveltekit-adapter-iis')
    },
  }

  return adapter
}
