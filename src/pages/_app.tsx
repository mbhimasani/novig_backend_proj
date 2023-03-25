import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export function reportWebVitals(metric: { label: string; }) {
  if (metric.label === 'custom') {
    console.log(metric);
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
