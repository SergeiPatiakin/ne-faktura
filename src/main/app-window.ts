import { app, BrowserWindow, Tray, nativeImage } from 'electron'
import path from 'path'
import { registerMainIpc } from './main-ipc'
import nefLogoDataUrl from '../../assets/images/nef-logo-16x16.png'

// Electron Forge automatically creates these entry points
declare const APP_WINDOW_WEBPACK_ENTRY: string
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string

let appWindow: BrowserWindow

/**
 * Create Application Window
 * @returns {BrowserWindow} Application Window Instance
 */
export async function createAppWindow(): Promise<BrowserWindow> {
  // Create new window instance
  appWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#202020',
    show: false,
    autoHideMenuBar: true,
    icon: path.resolve('assets/images/nef-logo.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
      sandbox: false,
    },
  })

  // Load the index.html of the app window.
  appWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY)

  // Show window when its ready to
  appWindow.on('ready-to-show', () => appWindow.show())

  // Register Inter Process Communication for main process
  registerMainIpc(appWindow)

  // Close all windows when main window is closed
  appWindow.on('close', () => {
    (appWindow as any) = null
    app.quit()
  })

  // Tray
  const icon = nativeImage.createFromDataURL(nefLogoDataUrl)
  const tray = new Tray(icon)
  tray.setToolTip('NeFaktura')
  tray.on('click', () => {
    appWindow.show()
  })

  return appWindow
}

