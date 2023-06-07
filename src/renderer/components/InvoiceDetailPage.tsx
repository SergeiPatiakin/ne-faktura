import { Button, ButtonGroup, CircularProgress, Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, Link, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { fireAndForget } from '../../common/helpers'
import { InvoiceDetail } from '../../common/ipc-types'
import { NavigationState } from '../fe-types'
import ipcContextApi from '../ipc-context-api'

type Props = {
  invoiceId: number
  invoiceStatus: string
  invalidateInvoices: () => void
  setNavigationState: (navigationState: NavigationState) => void
}

type InvoiceResponseDialogState = { visible: false } | { visible: true, reason: string }

export const InvoiceDetailPage = (props: Props) => {
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetail | null>(null)
  const [acceptDialogState, setAcceptDialogState] = useState<InvoiceResponseDialogState>(
    { visible: false }
  )
  const handleAcceptDialogClose = () => setAcceptDialogState({ visible: false })
  const [rejectDialogState, setRejectDialogState] = useState<InvoiceResponseDialogState>(
    { visible: false }
  )
  const handleRejectDialogClose = () => setRejectDialogState({ visible: false })
  useEffect(() => fireAndForget(async () => {
    const invoice = await ipcContextApi.getInvoiceDetail(props.invoiceId)
    setInvoiceDetail(invoice)
  }), [setInvoiceDetail])
  if (!invoiceDetail) {
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

  return <Container>
    <Stack spacing={1}>
      <h2 style={{ marginBottom: 0}}>
        <Link href="#" onClick={() => {
          props.setNavigationState({
            page: 'invoice-list'
          })
        }}>
          Invoices
        </Link> / {props.invoiceId}
      </h2>
      <p>Status: <b>{props.invoiceStatus}</b></p>
      <p>Supplier: <b>{invoiceDetail.supplierPartyName}</b></p>
      <p>Supplier-assigned invoice ID: <b>{invoiceDetail.supplierInvoiceId}</b></p>
      <p>Actual delivery date: <b>{invoiceDetail.actualDeliveryDate}</b></p>
      <p>Issue date: <b>{invoiceDetail.issueDate}</b></p>
      <p>Due date: <b>{invoiceDetail.dueDate}</b></p>
      <p>Payable Amount: <b>{invoiceDetail.payableAmount}</b></p>
      <p>Payment Reference: <b>{invoiceDetail.paymentReference}</b></p>
      <p>Payment Account: <b>{invoiceDetail.paymentAccount}</b></p>
      <ButtonGroup>
        <Button
          color="success"
          variant="contained"
          // disabled={props.invoiceStatus === 'Approved'} // Cannot accept an accepted invoice
          onClick={() => {
            setAcceptDialogState({ visible: true, reason: '' })
          }
        }>
          Accept...
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={
            props.invoiceStatus === 'Approved' ||
            props.invoiceStatus === 'Rejected'
          } // Cannot reject an accepted or rejected invoice
          onClick={() => {
            setRejectDialogState({ visible: true, reason: '' })
          }}
        >
          Reject...
        </Button>
        {acceptDialogState.visible &&
          <Dialog
            open
            onClose={handleAcceptDialogClose}
          >
          <DialogTitle>
            Accept invoice
          </DialogTitle>
          <DialogContent>
            <p style={{ marginBottom: 0}}></p>
            <TextField
              style={{ width: 400 }}
              multiline
              rows={4}
              label="Reason"
              value={acceptDialogState.reason}
              onChange={e => setRejectDialogState({ visible: true, reason: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <ButtonGroup>
            <Button onClick={handleAcceptDialogClose}>Cancel</Button>
            <Button color="success" variant="contained" onClick={async () => {
              await ipcContextApi.respondToInvoice({
                invoiceId: props.invoiceId,
                accept: true,
                comment: acceptDialogState.reason,
              })
              props.invalidateInvoices()
              props.setNavigationState({ page: 'invoice-list' })
            }} autoFocus>
              Accept
            </Button>
            </ButtonGroup>
          </DialogActions>
        </Dialog>
      }
        {rejectDialogState.visible &&
          <Dialog
            open
            onClose={handleRejectDialogClose}
          >
          <DialogTitle>
            Reject invoice
          </DialogTitle>
          <DialogContent>
            <p style={{ marginBottom: 0}}></p>
            <TextField
              style={{ width: 400 }}
              multiline
              rows={4}
              label="Reason"
              value={rejectDialogState.reason}
              onChange={e => setRejectDialogState({ visible: true, reason: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <ButtonGroup>
            <Button onClick={handleRejectDialogClose}>Cancel</Button>
            <Button color="error" variant="contained" onClick={async () => {
              await ipcContextApi.respondToInvoice({
                invoiceId: props.invoiceId,
                accept: false,
                comment: rejectDialogState.reason,
              })
              props.invalidateInvoices()
              props.setNavigationState({ page: 'invoice-list' })
            }} autoFocus>
              Reject
            </Button>
            </ButtonGroup>
          </DialogActions>
        </Dialog>
      }
      </ButtonGroup>
    </Stack>
  </Container>
}
