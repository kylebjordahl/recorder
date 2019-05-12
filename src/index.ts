const { app, BrowserWindow, ipcMain } = require('electron')
import { DateTime } from 'luxon'
import * as path from 'path'
import { appContext } from './context'
import { startRecording, stopRecording } from './recorder'

const REC_DIRECTORY = process.env.REC_DIRECTORY || '/recordings'

let mainWindow: any | null
let recorder: any | null = null

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 480,
		width: 800,
		fullscreen: true,
	})

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, '../static/index.html'))

	// Open the DevTools.
	if (process.env.NODE_ENV === 'development') { mainWindow.webContents.openDevTools() }

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	console.log(`recording to: ${REC_DIRECTORY}`)
	createWindow()
	ipcMain.addListener('start-recording', async (event) => {
		console.log('starting recording')
		const filename = path.join(REC_DIRECTORY, `${DateTime.local().toFormat('LLL-dd-yyyy_HH-mm')}.wav`)
		recorder = recorder || await startRecording(appContext, filename)
		event.sender.send('record-status', recorder !== null)
	})
	ipcMain.addListener('stop-recording', async (event) => {
		console.log('stopping recording')
		if (recorder !== null) {
			await stopRecording(appContext, recorder)
		}
		recorder = null
		event.sender.send('record-status', recorder !== null)
	})
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		if (recorder) { recorder.stop() }
		app.quit()
	}
})

app.on('activate', () => {
	// On OS X it"s common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.addListener('query-recording', (event) => {
	event.sender.send('record-status', recorder !== null)
})
