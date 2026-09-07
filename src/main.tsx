import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import { exposeDebugApi } from '@/debug/exposeDebugApi'
import '@/i18n'
import '@/hud/icons'
import '@/styles/global.css'

exposeDebugApi()

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
