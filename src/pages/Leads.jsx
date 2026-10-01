import { useCallback, useEffect, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'

const STATUSES = ['nuevo', 'contactado']
const badge = { nuevo: 'bg-amber-100 text-amber-800', contactado: 'bg-green-100 text-green-800' }

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setLeads(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => {
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, status } : x))) // optimista
    const { error } = await supabase.from('leads').update({ status }).eq('id', id)
    if (error) { setError(error.message); load() }
  }

  const remove = async (lead) => {
    if (!window.confirm(`¿Eliminar la consulta de ${lead.name}?`)) return
    const { error } = await supabase.from('leads').delete().eq('id', lead.id)
    if (error) setError(error.message)
    else setLeads((l) => l.filter((x) => x.id !== lead.id))
  }

  const visible = filter === 'todos' ? leads : leads.filter((l) => l.status === filter)
  const newCount = leads.filter((l) => l.status === 'nuevo').length

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-800">
          Consultas {newCount > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{newCount} nuevas</span>}
        </h2>
        <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
          {['todos', ...STATUSES].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-sm capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Mensaje</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-400" /></td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No hay consultas.</td></tr>
            ) : visible.map((l) => (
              <tr key={l.id} className="align-top hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(l.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{l.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {l.email && <a href={`mailto:${l.email}`} className="block text-indigo-600 hover:underline">{l.email}</a>}
                  {l.phone && <span className="block">{l.phone}</span>}
                </td>
                <td className="max-w-xs whitespace-pre-wrap px-4 py-3 text-slate-600">{l.message}</td>
                <td className="px-4 py-3">
                  <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value)}
                    className={`rounded-full border-0 px-2 py-1 text-xs font-medium capitalize ${badge[l.status] ?? ''}`}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(l)} aria-label="Eliminar" className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
