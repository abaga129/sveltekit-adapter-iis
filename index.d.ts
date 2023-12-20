import { Adapter } from '@sveltejs/kit'
import type { AdapterOptions as AdapterNodeAdapterOptions } from '@sveltejs/adapter-node'

export interface AdapterOptions extends AdapterNodeAdapterOptions {
	// adapter-iis options
  overrideNodeExePath?: string,

	/**
	 * glob patters that are not deleted from `.svelte-kit/adapter-iis` during adapting  
	 * useful in conjunction with `rollup-plugin-copy` copying some files into `.svelte-kit/adapter-iis/*`  
	 *   
	 * whitelists of anything in `.svelte-kit/adapter-iis/app` will be ignored.
	 * that is part is handled by the adapter, it gets re-generated every time.  
	 * 
	 * should take into account that db might not be root 
	 * @example `**/db/*`, not `db/*`
	 */
	outputWhitelistGlobs: string[]
}

export default function plugin(options?: AdapterOptions): Adapter
