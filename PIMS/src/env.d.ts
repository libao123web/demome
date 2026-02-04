/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

// Mock.js type declarations
declare module 'mockjs' {
  interface MockRandom {
    id: () => string
    cname: () => string
    datetime: (format?: string) => string
    ctitle: (min?: number, max?: number) => string
    natural: (min?: number, max?: number) => number
    pick: <T>(arr: T[]) => T
    color: () => string
    email: () => string
    csentence: (min?: number, max?: number) => string
  }
  
  interface MockStatic {
    mock: {
      (template: object): any
      (rurl: RegExp | string, template: object): any
      (rurl: RegExp | string, rtype: string, template: object | ((options: any) => any)): any
    }
    setup: (options: { timeout?: string | number }) => void
    Random: MockRandom
  }
  
  const Mock: MockStatic
  export default Mock
}

// xlsx type declarations
declare module 'xlsx' {
  export interface WorkSheet {
    [key: string]: any
  }
  
  export interface WorkBook {
    SheetNames: string[]
    Sheets: { [key: string]: WorkSheet }
  }
  
  export interface CellObject {
    t: string
    v: any
    r?: string
    h?: string
    w?: string
  }
  
  export const utils: {
    book_new: () => WorkBook
    aoa_to_sheet: (data: any[][]) => WorkSheet
    json_to_sheet: <T extends object>(data: T[], opts?: object) => WorkSheet
    sheet_to_json: <T>(sheet: WorkSheet, opts?: { header?: number | 'A' }) => T[]
    book_append_sheet: (wb: WorkBook, sheet: WorkSheet, name?: string) => void
  }
  
  export function read(data: string | ArrayBuffer | Uint8Array, opts?: { type?: string }): WorkBook
  export function write(wb: WorkBook, opts?: { bookType?: string; type?: string }): any
  export function writeFile(wb: WorkBook, filename: string): void
}
