import { BedDouble, Briefcase, Building2, Car } from 'lucide-react'

// type: text | textarea | number | select | tags | gallery
// full: true => ocupa las 2 columnas del formulario
const rawModules = [
  {
    key: 'hotel_rooms',
    label: 'Hotelería',
    itemLabel: 'habitación',
    icon: BedDouble,
    table: 'hotel_rooms',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'type', label: 'Tipo', type: 'select', options: ['Simple', 'Doble', 'Triple', 'Suite', 'Familiar'] },
      { name: 'capacity', label: 'Capacidad (personas)', type: 'number' },
      { name: 'price_per_night', label: 'Precio por noche', type: 'number', step: '0.01' },
      { name: 'amenities', label: 'Amenidades', type: 'tags', full: true, hint: 'Separadas por coma: WiFi, Aire acondicionado, Desayuno' },
      { name: 'images', label: 'Galería de fotos', type: 'gallery', full: true },
    ],
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'type', label: 'Tipo' },
      { key: 'capacity', label: 'Cap.' },
      { key: 'price_per_night', label: 'Precio/noche', money: true },
    ],
  },
  {
    key: 'vehicles',
    label: 'Concesionaria',
    itemLabel: 'vehículo',
    icon: Car,
    table: 'vehicles',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'brand', label: 'Marca', type: 'text' },
      { name: 'model', label: 'Modelo', type: 'text' },
      { name: 'year', label: 'Año', type: 'number' },
      { name: 'mileage', label: 'Kilometraje', type: 'number' },
      { name: 'transmission', label: 'Transmisión', type: 'select', options: ['Manual', 'Automática'] },
      { name: 'fuel', label: 'Combustible', type: 'select', options: ['Nafta', 'Diésel', 'GNC', 'Híbrido', 'Eléctrico'] },
      { name: 'price', label: 'Precio', type: 'number', step: '0.01' },
      { name: 'images', label: 'Galería de fotos', type: 'gallery', full: true },
    ],
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'brand', label: 'Marca' },
      { key: 'year', label: 'Año' },
      { key: 'mileage', label: 'Km' },
      { key: 'price', label: 'Precio', money: true },
    ],
  },
  {
    key: 'properties',
    label: 'Inmobiliaria',
    itemLabel: 'propiedad',
    icon: Building2,
    table: 'properties',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'operation_type', label: 'Tipo de operación', type: 'select', options: ['Venta', 'Alquiler', 'Alquiler temporario'] },
      { name: 'property_type', label: 'Tipo de propiedad', type: 'select', options: ['Casa', 'Departamento', 'Terreno', 'Local', 'Oficina', 'Campo'] },
      { name: 'price', label: 'Precio', type: 'number', step: '0.01' },
      { name: 'area_m2', label: 'Superficie (m²)', type: 'number', step: '0.01' },
      { name: 'rooms', label: 'Ambientes', type: 'number' },
      { name: 'images', label: 'Galería de fotos', type: 'gallery', full: true },
    ],
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'operation_type', label: 'Operación' },
      { key: 'property_type', label: 'Tipo' },
      { key: 'area_m2', label: 'm²' },
      { key: 'price', label: 'Precio', money: true },
    ],
  },
  {
    key: 'services',
    label: 'Servicios / Proyectos',
    itemLabel: 'servicio',
    icon: Briefcase,
    table: 'services',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, full: true },
      { name: 'category', label: 'Categoría', type: 'text' },
      { name: 'description', label: 'Descripción', type: 'textarea', full: true },
      { name: 'images', label: 'Galería de fotos', type: 'gallery', full: true },
    ],
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'category', label: 'Categoría' },
    ],
  },
]

// Toggles comunes a todos los rubros
const flags = [
  { name: 'published', label: 'Publicado', type: 'toggle', default: true, hint: 'Visible en la landing' },
  { name: 'featured', label: 'Destacado', type: 'toggle', default: false, hint: 'Se muestra como destacado' },
]

// Columnas de texto sobre las que busca la barra de búsqueda
const searchCols = {
  hotel_rooms: ['title', 'type'],
  vehicles: ['title', 'brand', 'model'],
  properties: ['title', 'operation_type', 'property_type'],
  services: ['title', 'category', 'description'],
}

export const modules = rawModules.map((m) => ({
  ...m,
  fields: [...m.fields.filter((f) => f.type !== 'gallery'), ...flags, ...m.fields.filter((f) => f.type === 'gallery')],
  searchCols: searchCols[m.key],
}))
