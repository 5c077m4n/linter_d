import { createServer } from 'net';
import { tmpdir } from 'os';
import { resolve } from 'path';
import { promises as fs } from 'fs';

import { Linter } from 'eslint';
import prettier from 'prettier';

const SOCK_PATH = resolve(tmpdir(), 'linter_daemon.sock');
const ESLINT = 'eslint';
const PRETTIER = 'prettier';

const eslinter = new Linter();

/**
 * @typedef {object} Payload
 * @property {string} content
 * @property {Object} options
 * @property {Object} config
 */
/**
 * @typedef {object} Message
 * @property {string} cmd
 * @property {Payload} payload
 */

const daemon = createServer({ allowHalfOpen: true }, (connection) => {
	connection.on('data', (data) => {
		/** @type {Message} */
		const message = JSON.parse(data.toString());
		const { cmd = '', payload: { content = '', options = {}, config = {} } = {} } = message;

		console.assert(cnd === ESLINT || cmd === PRETTIER);
		console.assert(content.length > 1);

		switch (cmd) {
			case ESLINT: {
				const result = eslinter.verifyAndFix(content, options);
				return connection.write(JSON.stringify(result));
			}
			case PRETTIER: {
				const result = prettier.format(content, options);
				return connection.write(result);
			}
			default: {
				return connection.write('UNSUPPORTED_COMMAND');
			}
		}
	});
})
	.on('error', async (err) => {
		console.error(err);
		await fs.rm(SOCK_PATH, { force: true });
	})
	.on('close', async () => {
		await fs.rm(SOCK_PATH, { force: true });
	})
	.listen(SOCK_PATH);

process.on('SIGINT', async () => {
	daemon.close();
	await fs.rm(SOCK_PATH, { force: true });
});
