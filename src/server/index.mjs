import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { SOCK_PATH } from '../lib/strings.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function initDaemon() {
	try {
		const sockFileStats = await fs.stat(SOCK_PATH);
		if (sockFileStats.isSocket()) return;
	} catch (e) {}

	const daemon = spawn('node', [join(__dirname, 'linter-daemon.mjs')], {
		detached: true,
		stdio: 'ignore',
	});
	daemon.unref();

	return daemon;
}
