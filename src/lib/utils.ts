import axios from 'axios';

interface FormElements extends HTMLFormControlsCollection {
  ticker: HTMLInputElement
}

export interface MyFormElement extends HTMLFormElement {
 readonly elements: FormElements
}

export interface Data {
    symbol: string
    currentPrice?: number
    historical?: {
      date: string
      open: number
      high: number
      low: number
      close: number
    }
    changeOverTime?: number
    news?: Article[]
    profile?: {
      companyName: string
      ceo: string
      sector: string
      country: string
      state: string
      fullTimeEmployees: number
      ipoDate: string
      description: string
    }
    error?: string
}

export interface Article {
  title: string
  publishedDate: string
  text: string
  url: string
}

export function getStockInfo(baseUrl: string | undefined, options: string, apiKey: string, ) {
  // helper function to create url & call FMP API
  return axios.get(baseUrl + options + apiKey)
}
  