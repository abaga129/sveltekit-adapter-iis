import { Adapter } from '@sveltejs/kit'
import type { AdapterOptions as AdapterNodeAdapterOptions } from '@sveltejs/adapter-node'

export interface AdapterOptions extends AdapterNodeAdapterOptions {
	// adapter-iis options
  overrideNodeExePath?: string,

	/**
	 * names of directories/files in `.svelte-kit/adapter-iis/` to keep when deleting
	 */
	outputWhitelist: string[]
}

export default function plugin(options?: AdapterOptions): Adapter
