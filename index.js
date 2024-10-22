import fs from 'fs-extra'
import path from 'node:path'
import node_adapter from '@sveltejs/adapter-node'
import { detect } from 'detect-package-manager'

import { createWebConfig, createXMLTransform } from './web.config.js'
import { createNodeServer } from './node-server.cjs.js'
import { parse } from 'dotenv'

const outputFolder = '.svelte-kit/adapter-iis'

const LOCK_FILES = {
  npm: 'package-lock.json',
  yarn: 'yarn.lock',
  pnpm: 'pnpm-lock.yaml',
  bun: 'bun.lockb',
}

function moveOutputToServerFolder() {
  const fileList = [
    'client',
    'server',
    'prerendered',
    'env.js',
    'handler.js',
    'index.js',
    'shims.js',
  ]
  fileList.forEach((f) => {
    const from = `build/${f}`
    const to = `${outputFolder}/app/${f}`

    try {
      fs.accessSync(from, fs.constants.F_OK)
    } catch (err) {
      // File doesn't exist
      return
    }

    fs.moveSync(from, to, (err) => console.error(err))
  })
}

function getEnvs() {
  const cwdFiles = fs
    .readdirSync(process.cwd())
    .filter((p) => p === '.env' || p.startsWith('.env.'))
    .map((p) => [p, p === '.env' ? false : p.slice(5)])
  return cwdFiles.length > 0 ? cwdFiles : [['', '']]
}

function writeFileToOutput(fileContents, fileName) {
  fs.writeFileSync(`${outputFolder}/${fileName}`, fileContents)
}

function xmlEscape(str) {
  return str
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('&', '&amp;')
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
  if (!fs.existsSync(outputFolder, (err) => console.warn(err))) {
    fs.mkdirSync(outputFolder, { recursive: true }, (err) => {
      console.warn(err)
    })
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

      // TODO: Delete this on next major version release
      if (typeof options.overrideNodeExePath == 'string') {
        console.warn(
          'overrideNodeExePath is deprecated use iisNodeOptions.nodeProcessCommandLine instead'
        )
        if (!options.iisNodeOptions) options.iisNodeOptions = {}
        options.iisNodeOptions.nodeProcessCommandLine =
          options.overrideNodeExePath
      }

      let defaultEnv = {
        ADDRESS_HEADER: 'x-forwarded-for',
        XFF_DEPTH: '1',
      }
      if (typeof options.origin !== 'string') {
        console.warn(
          `unspecified option 'origin'!\nForm actions will likely return error 403: Cross-site POST form submissions are forbidden`
        )
      } else {
        defaultEnv.ORIGIN = options.origin
      }

      for (const [envFn, stage] of getEnvs()) {
        const wcFilename = stage ? `web.${stage}.config` : 'web.config'
        const env = {}
        if (wcFilename === 'web.config') Object.assign(env, defaultEnv)

        if (options?.envInWebconfig ?? true) {
          const envPath = path.resolve(process.cwd(), envFn)
          if (fs.existsSync(envPath) && envFn !== '') {
            Object.assign(
              env,
              parse(fs.readFileSync(envPath, { encoding: 'utf-8' }))
            )

            console.info(`Included ${envFn} variables in ${wcFilename}`)
          } else {
            if (envFn === '') {
              console.warn(
                `Didn't include environment variables (No .env found)`
              )
            } else {
              console.warn(
                `Didn't include ${envFn} variables in ${wcFilename} (${envPath} does not exist!)`
              )
            }
          }
        } else {
          console.info(
            `Didn't include ${envFn} variables in ${wcFilename} (disabled)`
          )
        }
        // XML attributes cannot contain these characters, will result in IIS Error 500.19
        for (const key in env) {
          env[key] = xmlEscape(env[key])
        }

        const webConfig =
          wcFilename === 'web.config'
            ? createWebConfig({
                env: env,
                iisNodeOptions: options?.iisNodeOptions,
                externalRoutes: options?.externalRoutes,
                externalRoutesIgnoreCase: options?.externalRoutesIgnoreCase,
                redirectToHttps: options?.redirectToHttps,
                httpErrors: options?.httpErrors,
              })
            : createXMLTransform(env)

        writeFileToOutput(webConfig, wcFilename)
      }

      copyToOutput('package.json')
      // detect the package manager
      const pm = await detect(process.cwd())
      // copy the lock file associated with the current package manager
      copyToOutput(LOCK_FILES[pm])

      console.info('Finished adapting with sveltekit-adapter-iis')
    },
  }

  return adapter
}
