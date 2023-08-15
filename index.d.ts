import { Adapter } from '@sveltejs/kit'

export interface AdapterOptions {
  pages?: string
  assets?: string
  fallback?: string
  precompress?: boolean
  domain?: string
  jekyll?: boolean
  overrideNodeExePath?: string 
}

export default function plugin(options?: AdapterOptions): Adapter
