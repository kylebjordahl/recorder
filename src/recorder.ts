import { createWriteStream } from 'fs'
import AudioRecorder from 'node-audiorecorder'
import * as path from 'path'
import { AppContext } from './context'
import { ensureDirectory } from './util/ensureDirectory'

export async function startRecording(ctx: AppContext, filename: string) {
	const recorder = new AudioRecorder({
		program: process.platform === 'win32' ? `sox` : `rec`,
		silence: 30,         // Duration of silence in seconds before it stops recording.
		thresholdStart: 0,  // Silence threshold to start recording.
		thresholdStop: 0,   // Silence threshold to stop recording.
		keepSilence: true,   // Keep the silence in the recording.	}, console)
	}, console)

	// confirm directory exists to write to
	const file = path.isAbsolute(filename) ? filename : path.resolve(__dirname, filename)
	await ensureDirectory(file)

	const fileStream = createWriteStream(file, { encoding: 'binary' })
	recorder.start().stream().pipe(fileStream)

	// set up logging
	recorder.stream().on('error', (error) => ctx.logger.log('error', error))
	recorder.stream().on('close', (code) => ctx.logger.warn({
		message: `Recording ${filename} closed.`,
		code,
	}))
	recorder.stream().on('end', () => ctx.logger.warn({
		message: `Recording ${filename} ended.`,
	}))

	return recorder
}

export function stopRecording(ctx: AppContext, recorder: AudioRecorder) {
	recorder.stop()
	// perhaps do a conversion here?
	ctx.logger.info('Recording stopped.')
}
