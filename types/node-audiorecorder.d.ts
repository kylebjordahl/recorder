import { Readable } from 'stream';

declare module "node-audiorecorder/*" {
	export default class AudioRecorder {
		constructor(options: Options)
		start: () => void
		stop: () => void
		stream: () => Readable
	}
	export interface Options {
		program: 'sox' | 'rec' | 'arecord',
		silence: number,
	}
}