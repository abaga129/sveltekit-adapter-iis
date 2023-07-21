export const SERVER_CJS = `// build/server.cjs
process.env.SOCKET_PATH = process.env.PORT;
delete process.env.PORT

import('./index.js')`
