import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { TechnicalConf } from '../common/ipc-types'

export const migrateFilesystem = () => {
  fs.mkdirSync(getReportsDir(), { recursive: true })
  fs.mkdirSync(getFilingsDir(), { recursive: true })
  if (!fs.existsSync(getTechnicalConfPath())) {
    updateTechnicalConf(getDefaultTechnicalConf())
  }
}

// reports
export const getReportsDir = () => path.join(app.getPath('userData'), 'reports')
export const saveReportContent = (id: number, content: Buffer | string) => {
  fs.writeFileSync(getReportPath(id), content)
}

export const getReportPath = (id: number) => path.join(getReportsDir(), `${id}.csv`)

// filings
export const getFilingsDir = () => path.join(app.getPath('userData'), 'filings')
export const getFilingContent = (id: number): Buffer => {
  const filePath = path.join(getFilingsDir(), `${id}.xml`)
  return fs.readFileSync(filePath)
}

export const saveFilingContent = (id: number, content: Buffer | string) => {
  fs.writeFileSync(getFilingPath(id), content)
}

export const getFilingPath = (id: number) => path.join(getFilingsDir(), `${id}.xml`)

// technical conf
export const getTechnicalConfPath = () => path.join(app.getPath('userData'), 'technical-conf.json')
const getDefaultTechnicalConf = (): TechnicalConf => ({
  apiKey: '',
  invoiceFilter: {
    statusFilter: [],
    fromDateFilter: null,
    toDateFilter: null,
  },
})

export const getTechnicalConf = (): TechnicalConf => {
  return JSON.parse(fs.readFileSync(getTechnicalConfPath(), 'utf-8'))
}
export const updateTechnicalConf = (technicalConf: TechnicalConf) => {
  fs.writeFileSync(getTechnicalConfPath(), JSON.stringify(technicalConf, null, 4))
}
