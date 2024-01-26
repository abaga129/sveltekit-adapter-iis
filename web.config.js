/** @param {import('.').createWebConfigOptions} options */
export function createWebConfig(options) {
  const routes = Array.from(new Set(options.externalRoutes ?? []))
  const blockRule =
    routes.length > 0
      ? `
				<!-- external routes that should be handled by IIS. For example, virtual directories -->
				<rule name="block" stopProcessing="true">
					<match url="^(${routes.join('|')})/*" ignoreCase="${
          options.externalRoutesIgnoreCase ?? true
        }" />
					<action type="None" />
				</rule>`
      : ''
  const redirectToHttps =
    options.redirectToHttps ?? false
      ? `
				<!-- Redirects requests to https -->
				<rule name="Redirect to https" stopProcessing="true">
					<match url=".*" />
					<conditions>
						<add input="{HTTPS}" pattern="off" ignoreCase="true" />
					</conditions>
					<action type="Redirect" url="https://{HTTP_HOST}{REQUEST_URI}" redirectType="Permanent" appendQueryString="false" />
				</rule>`
      : ''
  // <?xml version="1.0" encoding="utf-8"?> has to be on the first line!
  return `<?xml version="1.0" encoding="utf-8"?>
<configuration>
	${
    options.env
      ? `
	<appSettings>
		${Object.entries(options.env)
      .map(([key, val]) => `<add key="${key}" value="${val}" />`)
      .join('\n\t\t')}
	</appSettings>
	`
      : ''
  }
	<system.webServer>
		<handlers>
			<!-- Indicates that the server.js file is a node.js site to be handled by the iisnode module -->
			<add name="iisnode" path="node-server.cjs" verb="*" modules="iisnode" />
		</handlers>
		<rewrite>
			<rules>${redirectToHttps}${blockRule}
				<rule name="app">
					<match url="/*" />
					<action type="Rewrite" url="node-server.cjs" />
				</rule>
			</rules>
		</rewrite>
		<!-- enableXFF="true" is required for getClientAddress to work -->
		<iisnode watchedFiles="web.config;node_modules\\*;*.js;*.cjs" nodeProcessCommandLine="${
      options.nodePath ?? 'node.exe'
    }" enableXFF="true" />
	</system.webServer>
</configuration>
`
}
