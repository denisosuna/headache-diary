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

export const TIPOS_DOLOR_DESC: Record<TipoDolor, string> = {
  Tensional: 'Presión o tensión constante, como una banda apretando la cabeza.',
  Migraña: 'Dolor pulsátil, suele ser de un solo lado, con náuseas o sensibilidad a luz/sonido.',
  Cluster: 'Dolor muy intenso alrededor de un ojo, en episodios cortos y repetidos.',
  Occipital: 'Punzadas en la nuca que irradian hacia arriba o detrás de los ojos.',
  Frontal: 'Localizado en la frente, sobre las cejas; común en sinusitis o cansancio.',
  Temporal: 'En las sienes, a los costados de la cabeza; puede latir con el pulso.',
  'En banda': 'Sensación de cinta apretada que rodea la cabeza de sien a sien.',
};

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

export const ZONAS_DESC: Record<Zona, string> = {
  Frente: 'Parte alta de la cara, por encima de las cejas.',
  Sienes: 'Costados de la cabeza, junto a los ojos.',
  Nuca: 'Base del cráneo y parte alta del cuello.',
  Occipital: 'Parte posterior del cráneo.',
  'Detrás de los ojos': 'Dolor profundo retroocular, como presión interna.',
  'Todo el cráneo': 'Difuso, sin un punto concreto; toda la cabeza.',
  'Hemicráneo derecho': 'Mitad derecha de la cabeza.',
  'Hemicráneo izquierdo': 'Mitad izquierda de la cabeza.',
};

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
  /** UUID único de la entrada */
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm (24h), opcional */
  hora?: string;
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
