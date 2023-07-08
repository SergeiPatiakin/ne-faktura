import fs from 'fs'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import { foreachIpc, InvoiceListItem, IpcHandlerFns } from '../common/ipc-types'
import { getTechnicalConf, updateTechnicalConf } from './filesystem'
import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'
import { getInvoiceIdsUrl } from './efaktura-api'

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
      const url = getInvoiceIdsUrl(
        status,
        technicalConf.invoiceFilter.fromDateFilter,
        technicalConf.invoiceFilter.toDateFilter,
      )
      const response = await axios.post(
        url,
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
  downloadInvoiceFile: async ({ arg: invoiceId, browserWindow }) => {
    const r = await dialog.showSaveDialog(browserWindow, {
      defaultPath: `${invoiceId}.pdf`
    })
    if (!r.canceled && r.filePath) {
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
      const invoiceFileContentB64 = document['env:DocumentEnvelope']['env:DocumentHeader']['env:DocumentPdf']['#text']
      const invoiceFileContent = Buffer.from(invoiceFileContentB64, 'base64')
      fs.writeFileSync(r.filePath, invoiceFileContent)
    }
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
