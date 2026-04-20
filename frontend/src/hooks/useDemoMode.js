import { createContext, useContext, useState, createElement } from 'react'

const DemoModeCtx = createContext({ demoMode: true, setDemoMode: () => {} })

export function DemoModeProvider({ children }) {
  const [demoMode, setDemoMode] = useState(true)
  return createElement(DemoModeCtx.Provider, { value: { demoMode, setDemoMode } }, children)
}

export function useDemoMode() {
  return useContext(DemoModeCtx)
}
