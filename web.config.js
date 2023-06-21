export const WEB_CONFIG = `<?xml version="1.0" encoding="utf-8"?>

<configuration>
    <system.webServer>
        <handlers>
            <!-- Indicates that the server.js file is a node.js site to be handled by the iisnode module -->
            <add name="iisnode" path="server.cjs" verb="*" modules="iisnode" />
        </handlers>
        <rewrite>
            <rules>
                <!-- All other URLs are mapped to the node.js site entry point -->
                <rule name="node">
                    <match url=".*" />
                    <action type="Rewrite" url="server.cjs" />
                </rule>
            </rules>
            <!-- Change it back if Location Header got rewrited-->
            <outboundRules>
                <rule name="back">
                    <match serverVariable="RESPONSE_Location" pattern="(.*)/server.cjs" />
                    <action type="Rewrite" value="{R:1}" />
                </rule>
            </outboundRules>
        </rewrite>

        <iisnode watchedFiles="web.config;*.js;*.cjs" />
    </system.webServer>
</configuration>
`
