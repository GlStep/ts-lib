export type Numeric = number

export function sum(arr: Numeric[]): number {
  return arr.reduce((a, b) => a + b, 0)
}
