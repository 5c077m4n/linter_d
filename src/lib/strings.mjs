import { tmpdir } from 'os';
import { resolve } from 'path';

export const SOCK_PATH = resolve(tmpdir(), 'linter_daemon.sock');
export const ESLINT = 'eslint';
export const PRETTIER = 'prettier';
