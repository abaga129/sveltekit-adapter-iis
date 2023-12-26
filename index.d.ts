import { Adapter } from '@sveltejs/kit'
import type { AdapterOptions as AdapterNodeAdapterOptions } from '@sveltejs/adapter-node'

export interface AdapterOptions extends AdapterNodeAdapterOptions {
	// adapter-iis options
  overrideNodeExePath?: string,

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
	 * `['cdn']` will allow a virutal directory called `cdn` to work
	 */
	externalRoute?: string[]

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
}

export default function plugin(options?: AdapterOptions): Adapter;

export interface createWebConfigOptions {
	nodePath?: string,
	externalRoutes?: AdapterOptions['externalRoutes'],
	externalRoutesIgnoreCase?: AdapterOptions['externalRoutesIgnoreCase']
}
