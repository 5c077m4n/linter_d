import { initDaemon } from '../server/index.mjs';

export async function cli() {
	await initDaemon();
}
