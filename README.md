# SvelteKit Adapter IIS

## Differences in this fork:
- use `node:http` server instead of `express`, so it does not require an external dependency of `express`
- allow array of whitelist globs to not be deleted during adapting

## TODO
- [ ] add ignore glob example

This package contains an adapter for Sveltekit that will make your project output deployable to IIS.

## Prerequisites

- IIS 7.0 or greater with `IISRewrite` module installed
- [iisnode]("https://github.com/Azure/iisnode") installed to server that runs IIS

## Usage
1. Install to your sveltekit project
### from github
```bash
pnpm add -D github:KraXen72/sveltekit-adapter-iis
```

### from npm
Will be available later
```bash
pnpm add -D sveltekit-adapter-iis
#or
npm i sveltekit-adapter-iis --save-dev
```


2. In your `svelte.config.js` file replace default adapter with `IISAdapter`

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

3. Build the project

```sh
pnpm build
#or
npm run build
```

## Deploy the files to IIS
Check out [Setting up IIS](#setting-up-iis) or [IIS Troubleshooting](#iis-troubleshooting) if needed.
### Option 1: Direct point to output directory
- This is useful for local testing with IIS running on your machine
- You will have to stop the website and possibly IIS every time when re-building.
    
1 . In IIS Manager add a new Website: `Sites -> Add Website...`
2. Set the `Physical Path` to `<your project>/.svelte-kit/adapter-iis`.

### Option 2: Copying build output elsewhere
1. create a new folder in `C:/inetpub/<your project>`
2. copy the contents of `<your project>/.svelte-kit/adapter-iis` into `C:/inetpub/<your project>`
3. In IIS Manager add a new Website: `Sites -> Add Website...`
4. Set the `Physical Path` to `C:/inetpub/<your project>`.

## Setting up IIS
This is not a complete guide, but it should help.
1. [Enable IIS on your local machine for testing](https://www.howtogeek.com/112455/how-to-install-iis-8-on-windows-8/)
2. Restart your computer, check if it works by going to `localhost` without a port
3. Find the IIS manager program (recommended: pin it to start)
   - `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Administrative Tools`
     - `Internet Information Services (IIS) Manager`
   - or: `%windir%\system32\inetsrv\InetMgr.exe`
4. Install [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite#additionalDownloads) and [iisnode](https://github.com/Azure/iisnode/releases) modules
   - URLRewrite: `English x64`
   - iisnode: `iisnode-full-vx.x.x-x64.msi`
5. Restart IIS from the manager:
    ![iismanager restart](.github/assets/IISmgr1.png)
6. Unlock the section in global config (More information needed)
7. Set some permission to `Read/Write` instead of `Read Only` (More information needed)
8. Set up logs: 
   - Create a logging directory, for example `D:/coding/iislogs` 
   - Open global `Configuration Editor` > `system.webServer/iisnode` > set `logDirectory`
  
## IIS troubleshooting
- [Locked section error](https://serverfault.com/questions/360438/iis-complains-about-a-locked-section-how-can-i-find-out-where-its-locked)
- UrlRewrite rule is not enabled
- Node executable cannot be found
  - Open global `Configuration Editor` > `system.webServer/iisnode`
    - set `nodeProcessCommandLine` to `C:\Program Files\nodejs\node.exe`
- Set up file permissions for log dir & for `adapter-iis` dir for IIS_USER or Everyone to allow all

## `outputWhitelist`
This adapter also provides `outputWhitelist` in options. This is useful when you need some extra directores on server for the app to function. You can do the following:  
  
Use `rollup-plugin-copy` to copy the files
```ts
// vite.config.ts
import { defineConfig, normalizePath } from 'vite';
import copy from 'rollup-plugin-copy'

// your define config does not need to be a function, i think
export default defineConfig(({ command }) => {
    const config = {
        // ...
        plugins: []
    }
    if (command === 'build') {
        const copyPlugin = copy({
            targets: [
                {
                    // some files you want to copy over
                    src: ['db/*.htaccess', 'db/schema.json', 'db/*SCINDEX.json', 'db/vtmeta.yml'], 
                    dest: normalizePath(resolve('.svelte-kit', 'adapter-iis', 'db'))
                }
            ],
            hook: 'writeBundle'
        })

        config.plugins.push(copyPlugin)
    }
    return config
}
```
set the `outputWhitelist`
```js
// in svelte.config.js
const config = {
    //...
    kit: {
        adapter: IISAdapter({ outputWhitelist: ['db'] })
    }
}
```
Now, when building, `.svelte-kit/adapter-iis/db` should get preserved instead of being deleted



## Disclaimer

Note that this only works when served from the root of a domain.

So you can serve it from `www.mysvelteapp.com` or `sub.mysvelteapp.com` but it will not work from `www.mysvelteapp.com/subfolder`. Unfortunately this is due to how routing works with sveltekit. Adding the `base` property to your sveltekit config causes all of the routes to have that appended so you ende up with the app living on `www.mysevelteapp.com/subfolder/subfolder`.

## How it works

This adapter wraps `adapter-node` from `@sveltejs/kit` and uses `node:http` as the web server. It outputs a web.config file that rewrites incoming requests to the `node:http` server.

## Contributions

Contributions are welcome! Please open an issue or submit a PR if you would like to help out with this project!
