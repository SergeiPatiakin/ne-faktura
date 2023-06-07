export const getInvoiceIdsUrl = (
  status: string,
  fromDateFilter: string | null,
  toDateFilter: string | null
) => {
  const url = new URL('https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/ids')
  url.searchParams.set('status', status)
  if (fromDateFilter !== null) {
    url.searchParams.set('dateFrom', fromDateFilter)
  }
  if (toDateFilter !== null) {
    url.searchParams.set('dateTo', toDateFilter)
  }
  return url.toString()
}
