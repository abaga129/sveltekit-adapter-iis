import fs from 'fs-extra'
import path from 'node:path'
import node_adapter from '@sveltejs/adapter-node'

import { createWebConfig } from './web.config.js'
import { createNodeServer } from './node-server.cjs.js'
import { parse } from 'dotenv'

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

function getEnvs() {
	const cwdFiles = fs.readdirSync(process.cwd())
		.filter(p => p === ".env" || p.startsWith(".env."))
		.map(p => [p, p === ".env" ? false : p.slice(5)]) 
	return cwdFiles.length > 0 ? cwdFiles : [["", ""]];
}

function writeFileToOutput(fileContents, fileName) {
  fs.writeFileSync(`${outputFolder}/${fileName}`, fileContents)
}

function xmlEscape(str) {
	return str.replaceAll('"', "&quot;").replaceAll("'", "&apos;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("&", "&amp;")
}

function copyToOutput(path) {
  if (fs.existsSync(path)) {
    fs.copySync(path, `${outputFolder}/${path}`)
  }
}

/** @param {string[]} whitelist */
function cleanupOutputDirectory(whitelist) {
  const ldir = fs
    .readdirSync(outputFolder)
    .filter((p) => !whitelist.includes(p))
  for (const thing of ldir) {
    fs.rmSync(`${outputFolder}/${thing}`, { recursive: true, force: true })
  }
}

function createOutputDirectory() {
  if (!fs.existsSync(outputFolder, err => console.warn(err))) {
    fs.mkdirSync(outputFolder, {recursive: true}, err => {console.warn(err)})
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
      console.info('Adapting with sveltekit-adapter-iis')

      createOutputDirectory()
      cleanupOutputDirectory(options?.outputWhitelist ?? [])
      moveOutputToServerFolder()

			const nodeServer = createNodeServer(options?.healthcheckRoute ?? true)
			writeFileToOutput(nodeServer, 'node-server.cjs')

			let defaultEnv = {
				ADDRESS_HEADER: 'x-forwarded-for',
				XFF_DEPTH: '1'
			}
			if (typeof options.origin !== 'string') {
				console.warn(`sveltekit-adapter-iis: unspecified option 'origin'!\nForm actions will likely return errror 403: Cross-site POST form submissions are forbidden`)
			} else {
				defaultEnv.ORIGIN = options.origin
			}
			
			for (const [envFn, stage] of getEnvs()) {
				const env = {...defaultEnv}
				const wcFilename = stage ? `web.${stage}.config` : 'web.config'

				if (options?.envInWebconfig ?? true) {
					const envPath = path.resolve(process.cwd(), envFn)
					if (fs.existsSync(envPath)) {
						Object.assign(env, parse(fs.readFileSync(envPath, { encoding: 'utf-8' })))
					} else {
						console.warn(`Didn't include ${envFn} variables in ${wcFilename} (${envPath} does not exist!)`)
					}
					console.info(`Included ${envFn} variables in ${wcFilename}`)
				} else {
					console.info(`Didn't include ${envFn} variables in ${wcFilename} (disabled)`)
				}
				// XML attributes cannot contain these characters, will result in IIS Error 500.19
				for (const key in env) { env[key] = xmlEscape(env[key]) };
				
				const webConfig = createWebConfig({
					env: env,
					nodePath: options?.overrideNodeExePath,
					externalRoutes: options?.externalRoutes,
					externalRoutesIgnoreCase: options?.externalRoutesIgnoreCase
				})
				writeFileToOutput(webConfig, wcFilename)
			}
			
      copyToOutput('package.json')
      copyToOutput('package-lock.json')
      copyToOutput('yarn.lock')
      copyToOutput('pnpm-lock.yml')

      console.info('Finished adapting with sveltekit-adapter-iis')
    },
  }

  return adapter
}
