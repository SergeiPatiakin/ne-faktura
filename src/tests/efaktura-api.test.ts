import { getInvoiceIdsUrl } from '../main/efaktura-api'

describe('app', () => {
  it('no date filters', () => {
    expect(getInvoiceIdsUrl('New', null, null)).toBe(
      'https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/ids?status=New'
    )
  })
  it('from date filter', () => {
    expect(getInvoiceIdsUrl('New', '2023-01-01', null)).toBe(
      'https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/ids?status=New&dateFrom=2023-01-01'
    )
  })
  it('from and to date filters', () => {
    expect(getInvoiceIdsUrl('New', '2023-01-01', '2023-02-01')).toBe(
      'https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/ids?status=New&dateFrom=2023-01-01&dateTo=2023-02-01'
    )
  })
})
