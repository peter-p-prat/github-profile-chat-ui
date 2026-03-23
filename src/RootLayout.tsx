import { Outlet } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'

export function RootLayout() {
  useTheme()
  return <Outlet />
}
