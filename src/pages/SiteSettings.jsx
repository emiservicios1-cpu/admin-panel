import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../supabaseClient'
import ImageUploader from '../components/ImageUploader'
import Field, { inputClass } from '../components/Field'

const empty = {
  company_name: '', logo_url: '', phone: '', whatsapp: '', email: '', address: '',
  facebook: '', instagram: '', seo_title: '', seo_description: '',
}

export default function SiteSettings() {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null) // { ok, text }

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle().then(({ data, error }) => {
      if (error) setMsg({ ok: false, text: error.message })
      else if (data) setForm({ ...empty, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) })
      setLoading(false)
    })
  }, [])

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))
  const text = (name, props = {}) => (
    <input value={form[name]} onChange={(e) => set(name, e.target.value)} className={inputClass} {...props} />
  )

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const { id, created_at, updated_at, ...values } = form
    const { error } = await supabase.from('site_settings').upsert({ id: 1, ...values })
    setSaving(false)
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Configuración guardada.' })
  }

  if (loading) return <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-indigo-600" />

  const Section = ({ title, children }) => (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )

  return (
    <form onSubmit={save} className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Configuración del sitio</h2>

      <Section title="Empresa">
        <Field label="Nombre de la empresa">{text('company_name')}</Field>
        <Field label="Logo">
          <ImageUploader folder="branding" value={form.logo_url} onChange={(url) => set('logo_url', url)} />
        </Field>
      </Section>

      <Section title="Contacto">
        <Field label="Teléfono">{text('phone', { type: 'tel' })}</Field>
        <Field label="WhatsApp" hint="Con código de país, sin +. Ej: 5493424000000">{text('whatsapp', { type: 'tel' })}</Field>
        <Field label="Email">{text('email', { type: 'email' })}</Field>
        <Field label="Dirección">{text('address')}</Field>
      </Section>

      <Section title="Redes sociales">
        <Field label="Facebook">{text('facebook', { placeholder: 'https://facebook.com/...' })}</Field>
        <Field label="Instagram">{text('instagram', { placeholder: 'https://instagram.com/...' })}</Field>
      </Section>

      <Section title="SEO">
        <Field label="Título" className="sm:col-span-2" hint="Recomendado: hasta 60 caracteres">{text('seo_title')}</Field>
        <Field label="Descripción" className="sm:col-span-2" hint="Recomendado: hasta 160 caracteres">
          <textarea rows={3} value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} className={inputClass} />
        </Field>
      </Section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar cambios
        </button>
        {msg && (
          <span className={`flex items-center gap-1 text-sm ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>
            {msg.ok && <CheckCircle2 className="h-4 w-4" />} {msg.text}
          </span>
        )}
      </div>
    </form>
  )
}
