export type Intensidad = 'leve' | 'moderado' | 'intenso';

export const TIPOS_DOLOR = [
  'Tensional',
  'Migraña',
  'Cluster',
  'Occipital',
  'Frontal',
  'Temporal',
  'En banda',
] as const;
export type TipoDolor = (typeof TIPOS_DOLOR)[number];

export const ZONAS = [
  'Frente',
  'Sienes',
  'Nuca',
  'Occipital',
  'Detrás de los ojos',
  'Todo el cráneo',
  'Hemicráneo derecho',
  'Hemicráneo izquierdo',
] as const;
export type Zona = (typeof ZONAS)[number];

export const DESENCADENANTES = [
  'Estrés',
  'Sueño',
  'Hormonal',
  'Pantallas',
  'Alimentos',
  'Clima',
  'Ejercicio',
  'Alcohol',
] as const;
export type Desencadenante = (typeof DESENCADENANTES)[number];

export interface HeadacheEntry {
  /** YYYY-MM-DD */
  date: string;
  intensidad: Intensidad;
  tipo: TipoDolor;
  zona: Zona;
  desencadenantes: Desencadenante[];
  notas: string;
}

export const INTENSIDAD_META: Record<
  Intensidad,
  { label: string; range: string; dot: string; badge: string; ring: string }
> = {
  leve: {
    label: 'Leve',
    range: '1-3',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    ring: 'ring-emerald-300',
  },
  moderado: {
    label: 'Moderado',
    range: '4-6',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
    ring: 'ring-amber-300',
  },
  intenso: {
    label: 'Intenso',
    range: '7-10',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 ring-red-200',
    ring: 'ring-red-300',
  },
};
