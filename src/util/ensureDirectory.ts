import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)

export async function ensureDirectory(pathString: string) {
	// get the directory from the path, in case its a file
	const dir = path.dirname(pathString)
	if (!await exists(dir)) {
		await mkdir(dir)
	}
}
