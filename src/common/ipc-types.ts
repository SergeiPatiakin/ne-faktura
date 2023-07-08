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

export type InvoiceFilter = {
  statusFilter: string[]
  fromDateFilter: string | null
  toDateFilter: string | null
}

export type InvoiceListItem = {
  id: number
  status: string
}

export type InvoiceDetail = {
  actualDeliveryDate: string
  issueDate: string
  dueDate: string
  supplierPartyName: string
  supplierInvoiceId: string
  payableAmount: string
  paymentReference: string
  paymentAccount: string
}

export type InvoiceResponse = {
  invoiceId: number
  accept: boolean
  comment: string
}

export type GetTechnicalConf = IpcTypeDef<'get-technical-conf', void, TechnicalConf>

export type UpdateTechnicalConf = IpcTypeDef<'update-technical-conf', TechnicalConf, void>

export type GetInvoices = IpcTypeDef<'get-invoices', InvoiceFilter, Array<InvoiceListItem>>

export type GetInvoiceDetail = IpcTypeDef<'get-invoice-detail', number, InvoiceDetail>

export type DownloadInvoiceFile = IpcTypeDef<'download-invoice-file', number, void>

export type RespondToInvoice = IpcTypeDef<'respond-to-invoice', InvoiceResponse, void>

export type IpcMethods = {
  getTechnicalConf: GetTechnicalConf
  updateTechnicalConf: UpdateTechnicalConf
  getInvoices: GetInvoices
  getInvoiceDetail: GetInvoiceDetail
  downloadInvoiceFile: DownloadInvoiceFile
  respondToInvoice: RespondToInvoice
}

export type IpcHandlerFns = { [k in keyof IpcMethods]: IpcMethods[k]['HandlerFn']}
export type IpcContextApi = { [k in keyof IpcMethods]: IpcMethods[k]['ClientFn']}
export type IpcNames = { [k in keyof IpcMethods]: IpcMethods[k]['Name']}

const ipcNames: IpcNames = {
  getTechnicalConf: 'get-technical-conf',
  updateTechnicalConf: 'update-technical-conf',
  getInvoices: 'get-invoices',
  getInvoiceDetail: 'get-invoice-detail',
  downloadInvoiceFile: 'download-invoice-file',
  respondToInvoice: 'respond-to-invoice',
}

export const foreachIpc = (cb: (ipcKey: keyof IpcNames, ipcName: string) => void): void => {
  Object.keys(ipcNames).forEach((ipcKey: keyof IpcNames) => {
    const ipcName  = ipcNames[ipcKey]
    cb(ipcKey, ipcName)
  })
}

export type TechnicalConf = {
  apiKey: string
  invoiceFilter: InvoiceFilter
}
