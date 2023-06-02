import type { BrowserWindow } from 'electron'

type IpcTypeDef<N extends string, A, B> = {
  Name: N
  Arg: A
  Result: B
  ClientFn: (arg: A) => Promise<B>
  HandlerFn: (req: {
    event: Electron.IpcMainInvokeEvent,
    browserWindow: BrowserWindow,
    arg: A,
  }) => Promise<B>
}

export type DoubleNumber = IpcTypeDef<'double-number', number, number>

export type IpcMethods = {
  doubleNumber: DoubleNumber
}

export type IpcHandlerFns = { [k in keyof IpcMethods]: IpcMethods[k]['HandlerFn']}
export type IpcContextApi = { [k in keyof IpcMethods]: IpcMethods[k]['ClientFn']}
export type IpcNames = { [k in keyof IpcMethods]: IpcMethods[k]['Name']}

const ipcNames: IpcNames = {
  doubleNumber: 'double-number',
}

export const foreachIpc = (cb: (ipcKey: keyof IpcNames, ipcName: string) => void): void => {
  Object.keys(ipcNames).forEach((ipcKey: keyof IpcNames) => {
    const ipcName  = ipcNames[ipcKey]
    cb(ipcKey, ipcName)
  })
}
