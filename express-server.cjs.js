export const EXPRESS_SERVER_CJS = `const express = require('express')
import('./app/handler.js')
	.then((handler) => {
		const app = express();

		// add a route that lives separately from the SvelteKit app
		app.get('/healthcheck', (req, res) => {
			res.end('ok');
		});

		// let SvelteKit handle everything else, including serving prerendered pages and static assets
		app.use(handler.handler);

		console.log(process.env.PORT)
		app.listen(process.env.PORT, () => {
			console.log(
				'listening on port ' + process.env.PORT
			);
		});

	}).catch((err) => console.error(err));
`
