export type NavigationState =
  | { page: 'settings' }
  | { page: 'invoice-list' }
  | { page: 'invoice-detail', invoiceId: number, invoiceStatus: string }
