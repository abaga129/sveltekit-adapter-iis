import { Adapter } from '@sveltejs/kit'
import type { AdapterOptions as AdapterNodeAdapterOptions } from '@sveltejs/adapter-node'

export interface AdapterOptions extends AdapterNodeAdapterOptions {
  /** @deprecated use iisNodeOptions instead */
  overrideNodeExePath?: string

  /**
   * names of directories/files in `.svelte-kit/adapter-iis/` to keep when deleting
   *
   * For example:
   * `['db']` will whitelist `.svelte-kit/adapter-iis/db` and all contents
   */
  outputWhitelist: string[]

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
  /** Default is `iisnode.yml` */
  configOverrides?: string
  /** Default is `debug` */
  debuggerPathSegment?: string
  /** Default is `5058-6058` */
  debuggerPortRange?: string
  /** Default is `""` */
  debuggerVirtualDir?: string
  /** Default is `true` */
  debuggingEnabled?: boolean
  /** Default is `false` */
  debugHeaderEnabled?: boolean
  /** Default is `true` */
  debErrorsEnabled?: boolean
  /** Default is `true` */
  enableXFF?: boolean
  /** Default is `false` */
  flushResponse?: boolean
  /** Default is `60000` */
  gracefulShutdownTimeout?: number
  /** Default is `0` */
  idlePageOutTimePeriod?: number
  /** Default is `4096` */
  initialRequestBufferSize?: number
  /** Default is `C:\Program Files\iisnode\interceptor.js` */
  interceptor?: string
  /** Directory where logs from ISSNode will be location.
   *
   * Default is `iisnode` which is an relative path to `My App/iisnode` */
  logDirectory?: string
  /** Enables issnode logging. Useful for debugging runtime errors with your application.
   *
   * Default is `false` */
  loggingEnabled?: boolean
  /** Default is `1024` */
  maxConcurrentRequestsPerProcess?: number
  /** Default is `20` */
  maxLogFiles?: number
  /** Default is `128` */
  maxLogFileSizeInKB?: number
  /** Default is `512` */
  maxNamedPipeConnectionPoolSize?: number
  /** Default is `100` */
  maxNamedPipeConnectionRetry?: number
  /** Default is `30000` */
  maxNamedPipePooledConnectionAge?: number
  /** Default is `65536` */
  maxRequestBufferSize?: number
  /** Default is `1024` */
  maxTotalLogFileSizeInKB?: number
  /** Default is `250` */
  namedPipeConnectionRetryDelay?: number
  /** Default is `%node_env%` */
  node_env?: string
  /** Path to the node.exe.
   *
   *  Default is `node.exe` */
  nodeProcessCommandLine?: string
  /** Default is `1` */
  nodeProcessCountPerApplication?: number
  /** Default is `""` */
  remoteServerVars?: string
  /** Default is `false` */
  recycleSignalEnabled?: boolean
  /** Default is `5000` */
  uncFileChangesPollingInterval?: number
  /** Default is `web.config;node_modules\*;*.js;*.cjs` */
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
