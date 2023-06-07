export const fireAndForget = (fn: () => Promise<any>): void => {
  fn()
}
