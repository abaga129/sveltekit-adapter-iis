export const WEB_CONFIG = `
<?xml version="1.0" encoding="utf-8"?>
<configuration>
	<system.webServer>
		<handlers>
			<!-- Indicates that the server.js file is a node.js site to be handled by the iisnode module -->
			<add name="iisnode" path="express-server.cjs" verb="*" modules="iisnode" />
		</handlers>
		<rewrite>
			<rules>
				<rule name="app">
					<match url="/*" />
					<action type="Rewrite" url="express-server.cjs" />
				</rule>
			</rules>
		</rewrite>
		<iisnode watchedFiles="web.config;node_modules\\*;*.js;*.cjs" nodeProcessCommandLine="{{NODE_PATH}}"/>
	</system.webServer>
</configuration>
`
