export function createNodeServer(
  healthcheck = true,
  fallbackDefaultPort = 3000
) {
  return `const http = require('node:http')
import('./app/handler.js')
	.then((handler) => {
		const server = http.createServer((req, res) => {
			${
        healthcheck
          ? `if (req.url === '/healthcheck' && req.method === 'GET') { res.end('ok'); } else { handler.handler(req, res); }`
          : `handler.handler(req, res);`
      }
		});

		const PORT = process.env.PORT || ${fallbackDefaultPort};

		server.listen(PORT, () => {
			console.log('Server is listening on port ' + PORT);
		});
	}).catch((err) => console.error(err));`
}
