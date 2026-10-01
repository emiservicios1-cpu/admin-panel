import { useState } from 'react'
import { Inbox, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { modules } from '../modules/config'
import CrudModule from '../components/CrudModule'
import SiteSettings from './SiteSettings'
import Leads from './Leads'

const groups = [
  { title: 'General', items: [{ key: 'settings', label: 'Configuración', icon: Settings }] },
  { title: 'Contenido', items: modules },
  { title: 'Comunicación', items: [{ key: 'leads', label: 'Consultas', icon: Inbox }] },
]
const allItems = groups.flatMap((g) => g.items)

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [view, setView] = useState('settings')
  const current = allItems.find((i) => i.key === view)
  const moduleConfig = modules.find((m) => m.key === view)

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="px-6 py-5 text-lg font-bold text-white">Admin Panel</div>
        <nav className="flex-1 space-y-5 px-3">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-1 px-3 text-xs uppercase tracking-wide text-slate-500">{g.title}</p>
              {g.items.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setView(key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-800 ${view === key ? 'bg-slate-800 text-white' : ''}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 bg-white px-4 py-3 shadow-sm sm:px-6">
          <select value={view} onChange={(e) => setView(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm md:hidden">
            {allItems.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
          </select>
          <h1 className="hidden text-lg font-semibold text-slate-800 md:block">{current?.label}</h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">{user?.email}</span>
            <button onClick={signOut} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {view === 'settings' && <SiteSettings />}
          {view === 'leads' && <Leads />}
          {moduleConfig && <CrudModule key={moduleConfig.key} config={moduleConfig} />}
        </main>
      </div>
    </div>
  )
}
