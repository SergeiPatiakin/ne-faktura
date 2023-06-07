import React, { useEffect, useMemo, useState } from 'react'
import { Button, ButtonGroup, CircularProgress, Container, FormControl, InputLabel, MenuItem, OutlinedInput, Pagination, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { InvoiceListItem, TechnicalConf } from '../../common/ipc-types'
import DoDisturbAltIcon from '@mui/icons-material/DoDisturbAlt'
import ipcContextApi from '../ipc-context-api'
import { NavigationState } from '../fe-types'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/de'
import dayjs, { Dayjs } from 'dayjs'

type Props = {
  invoices: Array<InvoiceListItem>
  invoicesLoading: boolean
  technicalConf: TechnicalConf
  setNavigationState: (navigationState: NavigationState) => void
  invalidateInvoices: () => void
  invalidateTechnicalConf: () => void
}

const STATUSES = ['New', 'Seen', 'Reminded', 'ReNotified', 'Approved', 'Rejected', 'Cancelled', 'Storno']

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const PAGE_SIZE = 20

export const InvoiceListPage = (props: Props) => {
  const [statuses, setStatuses] = useState<Array<string>>(
    props.technicalConf.invoiceFilter.statusFilter ?? []
  )
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(
    props.technicalConf.invoiceFilter.fromDateFilter !== null
    ? dayjs(props.technicalConf.invoiceFilter.fromDateFilter)
    : null
  )
  const [toDate, setToDate] = React.useState<Dayjs | null>(
    props.technicalConf.invoiceFilter.toDateFilter !== null
    ? dayjs(props.technicalConf.invoiceFilter.toDateFilter)
    : null
  )
  const handleStatusesChange = (event: any) => {
    setStatuses(event.target.value);
  }
  const [page, setPage] = useState(1)
  const displayInvoices = useMemo(
    () => props.invoices.slice(PAGE_SIZE * (page - 1), PAGE_SIZE * page),
    [page, props.invoices],
  )
  const numPages = useMemo(
    () => Math.max(1, Math.ceil(props.invoices.length / PAGE_SIZE)),
    [props.invoices],
  )
  useEffect(() => {
    if (page > numPages){
      setPage(numPages)
    }
  }, [page, numPages])

  return <Container>
    <Stack spacing={1}>
      <h2 style={{ marginBottom: 0}}>Invoices</h2>
      <ButtonGroup>
        <FormControl style={{ maxWidth: 231}}>
          <InputLabel>Statuses</InputLabel>
          <Select
            multiple
            value={statuses}
            onChange={handleStatusesChange}
            input={<OutlinedInput label="Statuses" />}
            MenuProps={MenuProps}
          >
            {STATUSES.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={() => {
          setStatuses(STATUSES.slice())
        }}>
          All
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="rs">
          <DatePicker label="From" value={fromDate} onChange={newValue => setFromDate(newValue)}/>
        </LocalizationProvider>
        <Button onClick={() => {
          setFromDate(null)
        }}>
          Clear
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="rs">
          <DatePicker label="To" value={toDate} onChange={newValue => setToDate(newValue)}/>
        </LocalizationProvider>
        <Button onClick={() => {
          setToDate(null)
        }}>
          Clear
        </Button>
        <Button onClick={() => {
          setToDate(dayjs().startOf('day'))
        }}>
          Today
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="contained" onClick={async () => {
          await ipcContextApi.updateTechnicalConf({
            ...props.technicalConf,
            invoiceFilter: {
              ...props.technicalConf.invoiceFilter,
              statusFilter: statuses,
              fromDateFilter: fromDate !== null ? fromDate.format('YYYY-MM-DD') : null,
              toDateFilter: toDate !== null ? toDate.format('YYYY-MM-DD') : null,
            },
          })
          props.invalidateTechnicalConf()
        }}>
          Apply
        </Button>
      </ButtonGroup>
      {props.invoicesLoading ? <div style={{
        position: 'absolute', 
        left: '50%', 
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <CircularProgress />
      </div> : <>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: 50 }}><b>Id</b></TableCell>
              <TableCell style={{ width: 70 }}><b>Status</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayInvoices.map((f, fIdx) => <TableRow key={fIdx}>
              <TableCell>{f.id}</TableCell>
              <TableCell>{f.status}</TableCell>
              <TableCell align="right">
                <ButtonGroup>
                  <Button onClick={() => {
                    props.setNavigationState({
                      page: 'invoice-detail',
                      invoiceId: f.id,
                      invoiceStatus: f.status,
                    })
                  }}>Details</Button>
                </ButtonGroup>
              </TableCell>
            </TableRow>)}
            { displayInvoices.length === 0 &&
              <TableRow>
                <TableCell colSpan={3}>
                  <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
                    <DoDisturbAltIcon />
                    No invoices found
                  </Stack>
                </TableCell>
              </TableRow> 
            }
          </TableBody>
        </Table>
        { numPages > 1 &&
          <Pagination count={numPages} onChange={(_e, value) => setPage(value)} />
        }
      </>}
    </Stack>
  </Container>
}
