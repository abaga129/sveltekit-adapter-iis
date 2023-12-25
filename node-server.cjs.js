export const NODE_SERVER_CJS = `
const http = require('node:http')
import('./app/handler.js')
	.then((handler) => {
		const server = http.createServer((req, res) => {
			// add a route that lives separately from the SvelteKit app
			if (req.url === '/healthcheck' && req.method === 'GET') {
				res.end('ok');
			} else {
				// let SvelteKit handle everything else, including serving prerendered pages and static assets
				handler.handler(req, res);
			}
		});

		const PORT = process.env.PORT || 3000; // Set a default port if not provided in the environment

		server.listen(PORT, () => {
			console.log('Server is listening on port ' + PORT);
		});

	}).catch((err) => console.error(err));
`
