import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GameApp from './components/GameApp'
import { LanguageProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <GameApp />
    </LanguageProvider>
  </StrictMode>,
)
