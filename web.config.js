/** @param {import('.').createWebConfigOptions} options */
export function createWebConfig(options) {
	const routes = Array.from(new Set(options.externalRoutes ?? []))
	// <?xml version="1.0" encoding="utf-8"?> has to be on the first line!
	return `<?xml version="1.0" encoding="utf-8"?>
<configuration>
	${options.env ? `
	<appSettings>
		${Object.entries(options.env).map(([key, val]) => `<add key="${key}" value="${val}" />`).join("\n\t\t")}
	</appSettings>
	` : ''}
	<system.webServer>
		<handlers>
			<!-- Indicates that the server.js file is a node.js site to be handled by the iisnode module -->
			<add name="iisnode" path="node-server.cjs" verb="*" modules="iisnode" />
		</handlers>
		<rewrite>
			<rules>
				<!-- external routes that should be handled by IIS. For example, virtual directories -->
				<rule name="block" stopProcessing="true">
					<match url="^(${routes.join("|")})/*" ignoreCase="${options.externalRoutesIgnoreCase ?? true}" />
					<action type="None" />
				</rule>
				<rule name="app">
					<match url="/*" />
					<action type="Rewrite" url="node-server.cjs" />
				</rule>
			</rules>
		</rewrite>
		<!-- enableXFF="true" is required for getClientAddress to work -->
		<iisnode watchedFiles="web.config;node_modules\\*;*.js;*.cjs" nodeProcessCommandLine="${options.nodePath ?? 'node.exe'}" enableXFF="true" />
	</system.webServer>
</configuration>
`
}
