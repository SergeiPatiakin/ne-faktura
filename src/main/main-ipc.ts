import { BrowserWindow, ipcMain } from 'electron'
import { foreachIpc, InvoiceListItem, IpcHandlerFns } from '../common/ipc-types'
import { getTechnicalConf, updateTechnicalConf } from './filesystem'
import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

const handlers: IpcHandlerFns = {
  getTechnicalConf: async () => {
    return getTechnicalConf()
  },
  updateTechnicalConf: async ({ arg: technicalConf }) => {
    updateTechnicalConf(technicalConf)
  },
  getInvoices: async ({ arg: filter }) => {
    const technicalConf = getTechnicalConf()
    const invoices: Array<InvoiceListItem> = []
    if (technicalConf.apiKey === '') {
      return []
    }
    for (const status of filter.statusFilter) {
      const url = new URL('https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/ids')
      url.searchParams.set('status', status)
      if (technicalConf.invoiceFilter.fromDateFilter !== null) {
        url.searchParams.set('dateFrom', technicalConf.invoiceFilter.fromDateFilter)
      }
      if (technicalConf.invoiceFilter.toDateFilter !== null) {
        url.searchParams.set('dateTo', technicalConf.invoiceFilter.toDateFilter)
      }
      const response = await axios.post(
        url.toString(),
        '',
        {
          headers: {
            Accept: 'text/plain',
            ApiKey: technicalConf.apiKey,
          },
        }
      )
      invoices.push(
        ...(response.data as { PurchaseInvoiceIds: number[]})
        .PurchaseInvoiceIds.map(id => ({ id, status }))
      )
    }
    return invoices.sort((a, b) => b.id - a.id)
  },
  getInvoiceDetail: async ({ arg: invoiceId }) => {
    const technicalConf = getTechnicalConf()
    const url = new URL(`https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/xml?invoiceId=${invoiceId}`)
    const response = await axios.get(
      url.toString(),
      {
        headers: {
          Accept: 'text/plain',
          ApiKey: technicalConf.apiKey,
        },
      }
    )
    const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false })
    const document = parser.parse(response.data)
    
    const invoiceDetail = {
      actualDeliveryDate: document['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:Delivery']['cbc:ActualDeliveryDate'],
      issueDate: document['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cbc:IssueDate'],
      dueDate: document['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cbc:DueDate'],
      supplierPartyName: document['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:AccountingSupplierParty']['cac:Party']['cac:PartyName']['cbc:Name'],
      supplierInvoiceId: document['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cbc:ID'],
      payableAmount: document['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:LegalMonetaryTotal']['cbc:PayableAmount']['#text'],
      paymentReference: document['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:PaymentMeans']['cbc:PaymentID'],
      paymentAccount: document['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:PaymentMeans']['cac:PayeeFinancialAccount']['cbc:ID'],
    }
    return invoiceDetail
  },
  respondToInvoice: async ({ arg: invoiceResponse }) => {
    const technicalConf = getTechnicalConf()
    const url = new URL('https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/acceptRejectPurchaseInvoice')
    const apiRequestBody = JSON.stringify({
      invoiceId: invoiceResponse.invoiceId,
      accepted: invoiceResponse.accept,
      comment: invoiceResponse.comment,
    })
    const response = await axios.post(
      url.toString(),
      apiRequestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          ApiKey: technicalConf.apiKey,
        },
      }
    )
    if (response.data.Success !== true) {
      throw new Error('Failed to respond to invoice')
    }
  }
}

export const registerMainIpc = (mainWindow: BrowserWindow) => {
  foreachIpc((ipcKey, ipcName) => ipcMain.handle(ipcName, (e, arg) => handlers[ipcKey]({
    event: e,
    browserWindow: mainWindow,
    arg,
  } as any)))
}
