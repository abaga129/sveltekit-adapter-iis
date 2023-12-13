# SvelteKit Adapter IIS

## Differences in this fork:
- use `node:http` server instead of `express`, so it does not require an external dependency of `express`

## TODO
- [ ] update deps
- [ ] update README
  - [ ] github:whatever `pnpm` install instructions
- [ ] IIS setup guide
  - [ ] iisnode
  - [ ] [urlrewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
  - [ ] starting/stopping iis locks/unlocks the build directory
- [ ] possibly contribute back to original adapter?

This package contains an adapter for Sveltekit that will make your project output deployable to IIS.

## Prerequisites

- IIS 7.0 or greater with `IISRewrite` module installed
- [iisnode]("https://github.com/Azure/iisnode") installed to server that runs IIS

## Usage

Install to your sveltekit project

```bash
yarn add sveltekit-adapter-iis -D

#or

npm i sveltekit-adapter-iis --save-dev
```

Install express as a dependency (express is used to serve the app).
Note that you can also install express manually to the built files if you prefer that method. In that case, during step 3 of [Deploy the files to IIS](#deploy-the-files-to-iis), you will also need to install express as a dependency.

```bash
yarn add express

#or

npm i express --save
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

## Deploy the files to IIS

1. On the server which runs IIS, create a new folder under `%SystemDrive%\inetpub`.

2. Copy the files from `.svelte-kit/adapter-iis` (from your project) to the folder on the server which you just created.

3. Install your node_modules in this folder using the package manager of your choice. yarn.lock and package-lock.json get copied as part of the build step to ensure that dependency version remain the same.

```bash
# --production flag prevents devDependencies from installing
yarn install --production

#or

npm install --production
```

4. In IIS Manager add a new Website
   `Sites -> Add Website...`

5. Set the `Physical Path` to the folder from the first step.

The rest of the settings for the Web Site are up to your own disgresion.

You should now see your site running. If it is not, you may want to check the iis-node documentation on how to get logs and traces from the app.

## Disclaimer

Note that this only works when served from the root of a domain.

So you can serve it from `www.mysvelteapp.com` or `sub.mysvelteapp.com` but it will not work from `www.mysvelteapp.com/subfolder`. Unfortunately this is due to how routing works with sveltekit. Adding the `base` property to your sveltekit config causes all of the routes to have that appended so you ende up with the app living on `www.mysevelteapp.com/subfolder/subfolder`.

## How it works

This adapter wraps `adapter-node` from `@sveltejs/kit` and uses express as the web server. It outputs a web.config file that rewrites incoming requests to the express server.

## Contributions

Contributions are welcome! Please open an issue or submit a PR if you would like to help out with this project!

<!-- ## How it works

This adapter simply creates a `web.config` file in the build output folder and then creates a `server.cjs` inside the server folder of your build output. The `web.config` rewrites incoming traffic to the `server.cjs` which is handled by iisnode. -->
