import url from 'url';
import path from 'path';

export function getDirname(moduleUrl) {
	return path.dirname(url.fileURLToPath(moduleUrl));
}
