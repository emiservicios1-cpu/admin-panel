import { FileText, Image, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const menu = [
  { label: 'Escritorio', icon: LayoutDashboard },
  { label: 'Entradas', icon: FileText },
  { label: 'Medios', icon: Image },
  { label: 'Usuarios', icon: Users },
  { label: 'Ajustes', icon: Settings },
]

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-60 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="px-6 py-5 text-lg font-bold text-white">Admin Panel</div>
        <nav className="flex-1 space-y-1 px-3">
          {menu.map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-800 ${
                i === 0 ? 'bg-slate-800 text-white' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">Escritorio</h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">¡Bienvenido!</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sesión iniciada correctamente. Acá irán los módulos del panel.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
