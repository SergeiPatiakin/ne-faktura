import { Toolbar, CircularProgress, AppBar, Button, CssBaseline } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import RequestPageIcon from '@mui/icons-material/RequestPage'
import React, { useEffect, useState } from 'react'
import ipcContextApi from '../ipc-context-api'
import { TechnicalConf, InvoiceListItem } from '../../common/ipc-types'
import { fireAndForget } from '../../common/helpers'
import { SettingsPage } from './SettingsPage'
import { InvoiceListPage } from './InvoiceListPage'
import { InvoiceDetailPage } from './InvoiceDetailPage'
import { NavigationState } from '../fe-types'


const Application: React.FC = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({ page: 'invoice-list' })
  const [navigationEnabled, setNavigationEnabled] = useState<boolean>(true)

  const [technicalConf, setTechnicalConf] = useState<TechnicalConf | null>(null)
  const [technicalConfTag, setTechnicalConfTag] = useState(Math.random())
  const invalidateTechnicalConf = () => setTechnicalConfTag(Math.random())

  const [invoices, setInvoices] = useState<InvoiceListItem[] | null>()
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [invoicesTag, setInvoicesTag] = useState(Math.random())
  const invalidateInvoicesTag = () => setInvoicesTag(Math.random())
  
  useEffect(() => fireAndForget(async () => {
    setTechnicalConf(await ipcContextApi.getTechnicalConf())
  }), [technicalConfTag])

  useEffect(() => fireAndForget(async () => {
    if (technicalConf) {
      setInvoicesLoading(true)
      try {
        setInvoices(await ipcContextApi.getInvoices(technicalConf.invoiceFilter))
      } finally {
        setInvoicesLoading(false)
      }
    }
  }), [invoicesTag, technicalConf])

  if (!technicalConf || !invoices) {
    return <>
      <CssBaseline />
      <div style={{
        position: 'absolute', 
        left: '50%', 
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <CircularProgress />
      </div>
    </>
  }

  return <>
    <CssBaseline />
    <AppBar position='sticky'>
      <Toolbar>
        <Button
          color="inherit"
          disabled={!navigationEnabled || navigationState.page === 'settings'}
          onClick={() => setNavigationState({ page: 'settings' })}
        >
          <SettingsIcon />
          Settings
        </Button>
        <Button
          color="inherit"
          disabled={!navigationEnabled || navigationState.page === 'invoice-list'}
          onClick={() => setNavigationState({ page: 'invoice-list' })}
        >
          <RequestPageIcon />
          Invoices
        </Button>
      </Toolbar>
    </AppBar>
    {(() => {
      switch (navigationState.page) {
        case 'settings':
          return <SettingsPage technicalConf={technicalConf} invalidateTechnicalConf={invalidateTechnicalConf} />
        case 'invoice-list':
          return <InvoiceListPage
            invoices={invoices}
            invoicesLoading={invoicesLoading}
            technicalConf={technicalConf}
            invalidateInvoices={invalidateInvoicesTag}
            invalidateTechnicalConf={invalidateTechnicalConf}
            setNavigationState={setNavigationState}
          />
        case 'invoice-detail':
          return <InvoiceDetailPage
            invoiceId={navigationState.invoiceId}
            invoiceStatus={navigationState.invoiceStatus}
            setNavigationState={setNavigationState}
            invalidateInvoices={invalidateInvoicesTag}
          />
      }
    })()}
  </>
}

export default Application
