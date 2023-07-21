# SvelteKit Adapter IIS

This package contains an adapter for Sveltekit that will make your project output deployable to IIS.

# **_ DISCLAIMER _**

This is not production ready! It seems that the underlying http server that @sveltejs/adapter-node uses does not support using named pipes so
currently when deploying this, you will receive an error about an invalid port. It might be possible to write an adapter from scratch that uses express rather than polka but I've decided this would be too much work currently. Please feel free to make a PR but sadly for now this seems unobtainable.

## Credit

I did not write the most important portion of this code that enables it to work with IIS. I merely used what another user had posted and turned it into an adapter that can easily be installed and used.

Proper credit goes to reddit user [jasonlyu123]("https://www.reddit.com/user/jasonlyu123/"). Thanks for being so helpful and sharing this with the community!

## Prerequisites

- IIS 7.0 or greater with `IISRewrite` module installed
- [iisnode]("https://github.com/Azure/iisnode") installed to server that runs IIS

## Usage

Install to your sveltekit project

```bash
yarn add sveltekit-adapter-iis

#or

npm i sveltekit-adapter-iis
```

In your `svelte.config.js` file replace default adapter with `IISAdapter`

```js
import { vitePreprocess } from '@sveltejs/kit/vite'
import IISAdapter from 'sveltekit-adapter-iis'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    version: {
      pollInterval: 300000,
    },
    adapter: IISAdapter(),
  },
}

export default config
```

Build the project

```sh
yarn build

#or

npm run build
```

## How it works

This adapter simply creates a `web.config` file in the build output folder and then creates a `server.cjs` inside the server folder of your build output. The `web.config` rewrites incoming traffic to the `server.cjs` which is handled by iisnode.
