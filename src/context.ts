import { Logger } from 'winston'
import logger from './logging'

export interface AppContext {
	logger: Logger
}

export const appContext = {
	logger,
}
