function indent(code, tabs = 0) {
  return code
    .split('\n')
    .map((line) => '\t'.repeat(tabs) + line)
    .join('\n')
}

const RULE_HTTPS = `
<!-- Redirects requests to https -->
<rule name="Redirect to https" stopProcessing="true">
	<match url=".*" />
	<conditions>
		<add input="{HTTPS}" pattern="off" ignoreCase="true" />
	</conditions>
	<action type="Redirect" url="https://{HTTP_HOST}{REQUEST_URI}" redirectType="Permanent" appendQueryString="false" />
</rule>
`
function createBlockRule(routes, ignoreCase = true) {
  return `
	<!-- external routes that should be handled by IIS. For example, virtual directories -->
	<rule name="block" stopProcessing="true">
		<match url="^(${routes.join('|')})/*" ignoreCase="${ignoreCase}" />
		<action type="None" />
	</rule>
	`
}

function createAppSettingsEnv(env, isXMLTransform = false) {
  return `
	<appSettings>
		${Object.entries(env)
      .map(
        ([key, val]) =>
          `<add key="${key}" value="${val}" ${
            isXMLTransform
              ? 'xdt:Transform="SetAttributes" xdt:Locator="Match(key)"'
              : ''
          }/>`
      )
      .join('\n\t\t')}
	</appSettings>
	`
}

/** @param {import('.').HttpErrors} httpErrors */
function createHttpErrors(httpErrors) {
  return `<httpErrors ${
    httpErrors.existingResponse ?? false
      ? `existingResponse="${httpErrors.existingResponse}"`
      : ''
  } ${
    httpErrors.errorMode ?? false
      ? `errorMode="${httpErrors.errorMode}"`
      : ''
  } />`
}

/** @param {import('.').createWebConfigOptions["iisNodeOptions"]} options */
function createIISNodeConfig(options) {
  const defaults = {
    enableXFF: true,
    nodeProcessCommandLine: 'node.exe',
    watchedFiles: 'web.config;node_modules*;*.js;*.cjs',
  }

  let attributes = ''

  if (options)
    Object.entries(options).forEach(
      ([key, value]) => (attributes += ` ${key}="${value}"`)
    )

  // Add defaults if not included
  Object.entries(defaults).forEach(([key, value]) => {
    if (options && options[key]) return

    attributes += ` ${key}="${value}"`
  })

  return `<iisnode${attributes} />`
}
/** @param {number} maxAllowedContentLength */
function createRequestFiltering(maxAllowedContentLength) {
  return maxAllowedContentLength ? `
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="${maxAllowedContentLength}" />
      </requestFiltering>
    </security>` : '';
}

/** @param {import('.').createWebConfigOptions['systemWeb']} options */
function createSystemWeb(options) {
  return options ? `
  <system.web>
    ${createCustomErrors(options.customErrors)}
    <httpRuntime maxRequestLength="${options.maxRequestLength || 4096}" />
  </system.web>` : '';
}

/** @param {import('.').createWebConfigOptions['systemWeb']['customErrors']} options */
function createCustomErrors(options) {
  const modeAttr = options?.mode ? `mode="${options?.mode}"` : '';
  return options ? `<customErrors ${options?.mode ? modeAttr : ''}/>` : '';
}

/** @param {import('.').createWebConfigOptions} options */
export function createWebConfig(options) {
  const routes = Array.from(new Set(options.externalRoutes ?? []))
  const blockRule =
    routes.length > 0
      ? indent(
          createBlockRule(routes, options.externalRoutesIgnoreCase ?? true),
          3
        )
      : ''
  const httpErrors =
    options.httpErrors ?? false ? createHttpErrors(options.httpErrors) : ''
  const requestFiltering = createRequestFiltering(options.maxAllowedContentLength || 10485760)

  // <?xml version="1.0" encoding="utf-8"?> has to be on the first line!
  return `<?xml version="1.0" encoding="utf-8"?>
<configuration>${options.env ? createAppSettingsEnv(options.env) : ''}
    <system.webServer>
        <handlers>
            <!-- Indicates that the server.js file is a node.js site to be handled by the iisnode module -->
            <add name="iisnode" path="node-server.cjs" verb="*" modules="iisnode" />
        </handlers>
        <rewrite>
            <rules>${
        options.redirectToHttps ?? false ? indent(RULE_HTTPS, 4) : ''
      }${blockRule}
                <rule name="app">
                    <match url="/*" />
                    <action type="Rewrite" url="node-server.cjs" />
                </rule>
            </rules>
        </rewrite>
        ${httpErrors}
        ${createIISNodeConfig(options.iisNodeOptions)}
        ${requestFiltering}
    </system.webServer>
  ${createSystemWeb(options.systemWeb || { maxRequestLength: 4096 })}
</configuration>
`
}

export function createXMLTransform(env) {
  return `<?xml version="1.0" encoding="utf-8"?>
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
	${createAppSettingsEnv(env, true)}
</configuration>
`
}
