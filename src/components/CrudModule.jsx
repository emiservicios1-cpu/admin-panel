import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ImageUploader from './ImageUploader'
import Modal from './Modal'
import Field, { inputClass } from './Field'

const PAGE_SIZE = 10
const money = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

const emptyValue = (f) =>
  f.type === 'gallery' ? [] : f.type === 'toggle' ? !!f.default : f.type === 'select' ? f.options[0] : ''

const toForm = (fields, row) =>
  Object.fromEntries(
    fields.map((f) => {
      const v = row?.[f.name]
      if (v === undefined || v === null) return [f.name, emptyValue(f)]
      return [f.name, f.type === 'tags' ? v.join(', ') : v]
    })
  )

const toPayload = (fields, form) =>
  Object.fromEntries(
    fields.map((f) => {
      const v = form[f.name]
      if (f.type === 'number') return [f.name, v === '' ? null : Number(v)]
      if (f.type === 'tags') return [f.name, v.split(',').map((s) => s.trim()).filter(Boolean)]
      return [f.name, v]
    })
  )

export default function CrudModule({ config }) {
  const { table, fields, columns, label, itemLabel, searchCols } = config
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | row
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  // Búsqueda en tiempo real con debounce de 300 ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [input])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const from = (page - 1) * PAGE_SIZE
    let q = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    const term = search.replace(/[,()%*\\"]/g, ' ').trim()
    if (term && searchCols?.length) {
      q = q.or(searchCols.map((c) => `${c}.ilike."*${term}*"`).join(','))
    }

    const { data, error, count } = await q
    if (error) {
      if (error.code === 'PGRST103' && page > 1) setPage(1) // página fuera de rango
      else setError(error.message)
    } else {
      setRows(data)
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [table, page, search, searchCols])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const openForm = (row) => {
    setForm(toForm(fields, row))
    setEditing(row ?? 'new')
    setError('')
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = toPayload(fields, form)
    const { error } =
      editing === 'new'
        ? await supabase.from(table).insert(payload)
        : await supabase.from(table).update(payload).eq('id', editing.id)
    setSaving(false)
    if (error) return setError(error.message)
    setEditing(null)
    load()
  }

  const remove = async (row) => {
    if (!window.confirm(`¿Eliminar "${row.title}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from(table).delete().eq('id', row.id)
    if (error) return setError(error.message)
    if (rows.length === 1 && page > 1) setPage((p) => p - 1) // dispara load()
    else load()
  }

  // Cambio rápido de Publicado / Destacado desde la tabla
  const toggleFlag = async (row, name) => {
    const value = !row[name]
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, [name]: value } : r)))
    const { error } = await supabase.from(table).update({ [name]: value }).eq('id', row.id)
    if (error) {
      setError(error.message)
      load()
    }
  }

  const renderField = (f) => {
    const v = form[f.name]
    switch (f.type) {
      case 'textarea':
        return <textarea rows={4} value={v} onChange={(e) => set(f.name, e.target.value)} className={inputClass} />
      case 'select':
        return (
          <select value={v} onChange={(e) => set(f.name, e.target.value)} className={inputClass}>
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        )
      case 'toggle':
        return <Toggle checked={v} onChange={(val) => set(f.name, val)} label={f.label} />
      case 'gallery':
        return <ImageUploader multiple folder={table} value={v} onChange={(urls) => set(f.name, urls)} />
      default:
        return (
          <input
            type={f.type === 'number' ? 'number' : 'text'}
            step={f.step}
            required={f.required}
            value={v}
            onChange={(e) => set(f.name, e.target.value)}
            className={inputClass}
          />
        )
    }
  }

  const colSpan = columns.length + 4
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-800">{label}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Buscar..."
              className="w-48 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-64"
            />
          </div>
          <button
            onClick={() => openForm(null)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Nueva {itemLabel}
          </button>
        </div>
      </div>

      {error && !editing && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Foto</th>
              {columns.map((c) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}
              <th className="px-4 py-3">Publicado</th>
              <th className="px-4 py-3">Destacado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-slate-400">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-slate-400">
                {search ? 'Sin resultados para la búsqueda.' : 'Todavía no hay registros.'}
              </td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    {row.images?.[0]
                      ? <img src={row.images[0]} alt="" className="h-10 w-14 rounded object-cover" />
                      : <div className="h-10 w-14 rounded bg-slate-100" />}
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-2 text-slate-700">
                      {row[c.key] == null || row[c.key] === '' ? '—' : c.money ? `$ ${money.format(row[c.key])}` : row[c.key]}
                    </td>
                  ))}
                  <td className="px-4 py-2"><Toggle checked={!!row.published} onChange={() => toggleFlag(row, 'published')} label="Publicado" /></td>
                  <td className="px-4 py-2"><Toggle checked={!!row.featured} onChange={() => toggleFlag(row, 'featured')} label="Destacado" /></td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => openForm(row)} aria-label="Editar" className="p-1.5 text-slate-500 hover:text-indigo-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(row)} aria-label="Eliminar" className="p-1.5 text-slate-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          <span>{total === 0 ? 'Sin registros' : `Mostrando ${from}–${to} de ${total}`}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              aria-label="Página anterior"
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              aria-label="Página siguiente"
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <Modal title={editing === 'new' ? `Nueva ${itemLabel}` : `Editar ${itemLabel}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <Field key={f.name} label={f.label} hint={f.hint} className={f.full ? 'sm:col-span-2' : ''}>
                {renderField(f)}
              </Field>
            ))}
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
