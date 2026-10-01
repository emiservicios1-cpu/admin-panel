import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { supabase } from '../supabaseClient'

const BUCKET = 'media'
const MAX_MB = 5

/**
 * Sube imágenes al bucket `media` y devuelve la(s) URL(s) pública(s).
 * - multiple=false: value es un string (URL) y onChange recibe un string.
 * - multiple=true:  value es un array de URLs y onChange recibe un array.
 */
export default function ImageUploader({ value, onChange, multiple = false, folder = 'general' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const urls = multiple ? value || [] : value ? [value] : []

  const uploadOne = async (file) => {
    if (!file.type.startsWith('image/')) throw new Error(`${file.name} no es una imagen.`)
    if (file.size > MAX_MB * 1024 * 1024) throw new Error(`${file.name} supera los ${MAX_MB} MB.`)
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setError('')
    setUploading(true)
    const uploaded = []
    const errors = []
    for (const file of multiple ? files : files.slice(0, 1)) {
      try {
        uploaded.push(await uploadOne(file))
      } catch (err) {
        errors.push(err.message)
      }
    }
    if (uploaded.length) onChange(multiple ? [...urls, ...uploaded] : uploaded[0])
    if (errors.length) setError(errors.join(' '))
    setUploading(false)
  }

  const remove = (url) => onChange(multiple ? urls.filter((u) => u !== url) : '')

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Quitar imagen"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {(multiple || urls.length === 0) && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {uploading ? 'Subiendo...' : multiple ? 'Agregar' : 'Subir'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} onChange={handleFiles} className="hidden" />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
