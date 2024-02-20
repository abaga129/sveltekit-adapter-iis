import { Adapter } from '@sveltejs/kit'
import type { AdapterOptions as AdapterNodeAdapterOptions } from '@sveltejs/adapter-node'

export interface AdapterOptions extends AdapterNodeAdapterOptions {
  /** @deprecated use `iisNodeOptions.nodeProcessCommandLine` instead */
  overrideNodeExePath?: string

  /**
   * names of directories/files in `.svelte-kit/adapter-iis/` to keep when deleting
   *
   * For example:
   * `['db']` will whitelist `.svelte-kit/adapter-iis/db` and all contents
   */
  outputWhitelist?: string[]

  /**
   * routes, which should not get handled by sveltekit and fall to IIS.
   * for example, Virtual Directories
   * will get added as a stopProcessing rewrite rule above the sveltekit catch-all rule.
   *
   * For example:
   * `['cdn']` will allow a virtual directory called `cdn` to work
   */
  externalRoutes?: string[]

  /**
   * whether external routes should match case-sensitive or not.
   * @default true
   */
  externalRoutesIgnoreCase?: boolean

  /**
   * enable or disable a /healthcheck route which responds with 'ok' if the node server is running
   * useful if sveltekit is broken, but the node server itself is up.
   * @default true
   */
  healthcheckRoute?: boolean

  /**
   * add your .env file in the web.config during build
   * if disabled, pass your environment variables to iisnode in a different way
   * @default true
   */
  envInWebconfig?: boolean

  /**
   * the site's origin when deployed to IIS
   * will be added as the ORIGIN env variable in web.config
   * if not specified, form actions will likely return error 403: Cross-site POST form submissions are forbidden
   */
  origin: string

  /**
   * whether to redirect http to https or not.
   * @default false
   */
  redirectToHttps?: boolean

  /** Allows you to configure the behavior of IISNode */
  iisNodeOptions?: IISNodeOptions
}

export interface IISNodeOptions {
  /** @default "iisnode.yml" */
  configOverrides?: string
  /** @default "debug" */
  debuggerPathSegment?: string
  /** @default "5058-6058" */
  debuggerPortRange?: string
  /** @default "" */
  debuggerVirtualDir?: string
  /** @default true */
  debuggingEnabled?: boolean
  /** @default false */
  debugHeaderEnabled?: boolean
  /** @default true */
  debErrorsEnabled?: boolean
  /** @default true */
  enableXFF?: boolean
  /** @default false */
  flushResponse?: boolean
  /** @default 60000 */
  gracefulShutdownTimeout?: number
  /** @default 0 */
  idlePageOutTimePeriod?: number
  /** @default 4096 */
  initialRequestBufferSize?: number
  /** @default "C:\Program Files\iisnode\interceptor.js" */
  interceptor?: string
  /** Directory where logs from ISSNode will be location. Can be an absolute or relative path.
   *
   * @default "iisnode" */
  logDirectory?: string
  /** Enables issnode logging. Useful for debugging runtime errors with your application.
   *
   * @default false */
  loggingEnabled?: boolean
  /** @default 1024 */
  maxConcurrentRequestsPerProcess?: number
  /** @default 20 */
  maxLogFiles?: number
  /** @default 128 */
  maxLogFileSizeInKB?: number
  /** @default 512 */
  maxNamedPipeConnectionPoolSize?: number
  /** @default 100 */
  maxNamedPipeConnectionRetry?: number
  /** @default 30000 */
  maxNamedPipePooledConnectionAge?: number
  /** @default 65536 */
  maxRequestBufferSize?: number
  /** @default 1024 */
  maxTotalLogFileSizeInKB?: number
  /** @default 250 */
  namedPipeConnectionRetryDelay?: number
  /** @default "%node_env%" */
  node_env?: string
  /** Path to the node.exe.
   *
   *  @default "node.exe" */
  nodeProcessCommandLine?: string
  /** @default 1 */
  nodeProcessCountPerApplication?: number
  /** @default "" */
  remoteServerVars?: string
  /** @default false */
  recycleSignalEnabled?: boolean
  /** @default 5000 */
  uncFileChangesPollingInterval?: number
  /** @default "web.config;node_modules\*;*.js;*.cjs" */
  watchedFiles?: string
}

export default function plugin(options?: AdapterOptions): Adapter

export interface createWebConfigOptions {
  env: Record<string, string | number>
  iisNodeOptions?: IISNodeOptions
  externalRoutes?: AdapterOptions['externalRoutes']
  externalRoutesIgnoreCase?: AdapterOptions['externalRoutesIgnoreCase']
  redirectToHttps?: AdapterOptions['redirectToHttps']
}
