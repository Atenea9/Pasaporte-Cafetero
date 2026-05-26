export type ModeloSello = 'A' | 'B' | 'C' | 'D';

export interface Municipio {
  id: string;
  nombre: string;
  color: string;
  emoji: string;
  modelo: ModeloSello;
  region: string;
}

export const MUNICIPIOS: Municipio[] = [
  { id: 'ibague',       nombre: 'Ibagué',          color: '#8B4513', emoji: '☕', modelo: 'A', region: 'Centro' },
  { id: 'anzoategui',   nombre: 'Anzoátegui',      color: '#6B4226', emoji: '🌄', modelo: 'B', region: 'Norte' },
  { id: 'casabianca',   nombre: 'Casabianca',      color: '#F57F17', emoji: '🌻', modelo: 'C', region: 'Norte' },
  { id: 'falan',        nombre: 'Falan',            color: '#558B2F', emoji: '🌿', modelo: 'D', region: 'Norte' },
  { id: 'fresno',       nombre: 'Fresno',           color: '#E65100', emoji: '🍊', modelo: 'A', region: 'Norte' },
  { id: 'herveo',       nombre: 'Herveo',           color: '#00695C', emoji: '🏔️', modelo: 'B', region: 'Norte' },
  { id: 'lerida',       nombre: 'Lérida',           color: '#1565C0', emoji: '💧', modelo: 'C', region: 'Norte' },
  { id: 'libano',       nombre: 'Líbano',           color: '#4A148C', emoji: '🔮', modelo: 'D', region: 'Norte' },
  { id: 'mariquita',    nombre: 'Mariquita',        color: '#BF360C', emoji: '🌺', modelo: 'A', region: 'Norte' },
  { id: 'murillo',      nombre: 'Murillo',          color: '#37474F', emoji: '❄️', modelo: 'B', region: 'Norte' },
  { id: 'palocabildo',  nombre: 'Palocabildo',      color: '#2E7D32', emoji: '🌳', modelo: 'C', region: 'Norte' },
  { id: 'santa_isabel', nombre: 'Santa Isabel',     color: '#6D4C41', emoji: '⛪', modelo: 'D', region: 'Norte' },
  { id: 'villahermosa', nombre: 'Villahermosa',     color: '#00838F', emoji: '🏡', modelo: 'A', region: 'Norte' },
  { id: 'alvarado',     nombre: 'Alvarado',         color: '#827717', emoji: '🌾', modelo: 'B', region: 'Centro' },
  { id: 'ambalema',     nombre: 'Ambalema',         color: '#4E342E', emoji: '🏛️', modelo: 'C', region: 'Centro' },
  { id: 'armero',       nombre: 'Armero-Guayabal',  color: '#C62828', emoji: '🌋', modelo: 'D', region: 'Centro' },
  { id: 'cajamarca',    nombre: 'Cajamarca',        color: '#1B5E20', emoji: '🥕', modelo: 'A', region: 'Centro' },
  { id: 'coello',       nombre: 'Coello',           color: '#F9A825', emoji: '🌞', modelo: 'B', region: 'Centro' },
  { id: 'espinal',      nombre: 'Espinal',          color: '#AD1457', emoji: '💃', modelo: 'C', region: 'Centro' },
  { id: 'flandes',      nombre: 'Flandes',          color: '#0277BD', emoji: '🌊', modelo: 'D', region: 'Centro' },
  { id: 'piedras',      nombre: 'Piedras',          color: '#6A1B9A', emoji: '🪨', modelo: 'A', region: 'Centro' },
  { id: 'rovira',       nombre: 'Rovira',           color: '#00695C', emoji: '🦜', modelo: 'B', region: 'Centro' },
  { id: 'venadillo',    nombre: 'Venadillo',        color: '#558B2F', emoji: '🦌', modelo: 'C', region: 'Centro' },
  { id: 'alpujarra',    nombre: 'Alpujarra',        color: '#00695C', emoji: '🌱', modelo: 'D', region: 'Sur' },
  { id: 'ataco',        nombre: 'Ataco',            color: '#BF360C', emoji: '🔥', modelo: 'A', region: 'Sur' },
  { id: 'chaparral',    nombre: 'Chaparral',        color: '#4E342E', emoji: '🪵', modelo: 'B', region: 'Sur' },
  { id: 'coyaima',      nombre: 'Coyaima',          color: '#E65100', emoji: '🏺', modelo: 'C', region: 'Sur' },
  { id: 'cunday',       nombre: 'Cunday',           color: '#2E7D32', emoji: '🌿', modelo: 'D', region: 'Sur' },
  { id: 'dolores',      nombre: 'Dolores',          color: '#880E4F', emoji: '🌸', modelo: 'A', region: 'Sur' },
  { id: 'herrera',      nombre: 'Herrera',          color: '#6A1B9A', emoji: '🍇', modelo: 'B', region: 'Sur' },
  { id: 'icononzo',     nombre: 'Icononzo',         color: '#33691E', emoji: '🦋', modelo: 'C', region: 'Sur' },
  { id: 'natagaima',    nombre: 'Natagaima',        color: '#BF360C', emoji: '🌵', modelo: 'D', region: 'Sur' },
  { id: 'ortega',       nombre: 'Ortega',           color: '#6D4C41', emoji: '🌄', modelo: 'A', region: 'Sur' },
  { id: 'planadas',     nombre: 'Planadas',         color: '#2E7D32', emoji: '🌿', modelo: 'B', region: 'Sur' },
  { id: 'prado',        nombre: 'Prado',            color: '#1565C0', emoji: '🏞️', modelo: 'C', region: 'Sur' },
  { id: 'purificacion', nombre: 'Purificación',     color: '#F57F17', emoji: '🕊️', modelo: 'D', region: 'Sur' },
  { id: 'rioblanco',    nombre: 'Rio Blanco',       color: '#1565C0', emoji: '💧', modelo: 'A', region: 'Sur' },
  { id: 'roncesvalles', nombre: 'Roncesvalles',     color: '#37474F', emoji: '🏔️', modelo: 'B', region: 'Sur' },
  { id: 'san_antonio',  nombre: 'San Antonio',      color: '#558B2F', emoji: '🌾', modelo: 'C', region: 'Sur' },
  { id: 'villarrica',   nombre: 'Villarrica',       color: '#4A148C', emoji: '🦚', modelo: 'D', region: 'Sur' },
];

export interface Stand {
  id: string;
  nombre: string;
  municipioId: string;
  productos: string[];
  activo: boolean;
}

export const STANDS: Stand[] = [
  { id: 's1',  nombre: 'Café Planadas Premium',   municipioId: 'planadas',    productos: ['Café especial', 'Tostión media'],          activo: true },
  { id: 's2',  nombre: 'Artesanías Ibagué',        municipioId: 'ibague',      productos: ['Sombreros', 'Canastos', 'Tejidos'],        activo: true },
  { id: 's3',  nombre: 'Sabores del Rio Blanco',   municipioId: 'rioblanco',   productos: ['Arepas', 'Café de altura', 'Mermeladas'],  activo: true },
  { id: 's4',  nombre: 'Oro Verde Casabianca',     municipioId: 'casabianca',  productos: ['Café orgánico', 'Panela'],                 activo: true },
  { id: 's5',  nombre: 'Herrera Natural',          municipioId: 'herrera',     productos: ['Frutas deshidratadas', 'Aromáticas'],     activo: true },
  { id: 's6',  nombre: 'Café Alpujarra',           municipioId: 'alpujarra',   productos: ['Café filtrado', 'Catas en vivo'],          activo: true },
  { id: 's7',  nombre: 'Ataco Fuerte',             municipioId: 'ataco',       productos: ['Tostión oscura', 'Café molido'],           activo: true },
  { id: 's8',  nombre: 'Maderas Chaparral',        municipioId: 'chaparral',   productos: ['Artesanías en madera', 'Cafeteras'],       activo: true },
  { id: 's9',  nombre: 'Frescura Fresno',          municipioId: 'fresno',      productos: ['Café fresco', 'Mermeladas artesanales'],   activo: true },
  { id: 's10', nombre: 'Nieves del Murillo',       municipioId: 'murillo',     productos: ['Café de páramo', 'Chocolate'],             activo: true },
  { id: 's11', nombre: 'Líbano Café de Altura',    municipioId: 'libano',      productos: ['Café lavado', 'Tostión clara'],            activo: true },
  { id: 's12', nombre: 'Cajamarca La Despensa',    municipioId: 'cajamarca',   productos: ['Papa, café y más', 'Productos frescos'],   activo: true },
];

export const PREMIOS = [
  { id: 'p1', nombre: 'Kit Cafetero Premium',      umbralPuntos: 500, icono: '🏆' },
  { id: 'p2', nombre: 'Experiencia Cata Privada',  umbralPuntos: 300, icono: '🥇' },
  { id: 'p3', nombre: 'Bolsa Café Especial 1kg',   umbralPuntos: 150, icono: '🥈' },
  { id: 'p4', nombre: 'Taza Coleccionable Tolima', umbralPuntos: 80,  icono: '🥉' },
];

export const NIVELES = [
  {
    nombre: 'Visitante',
    minPuntos: 0,
    color: '#888888',
    emoji: '🪴',
    beneficios: ['Acceso a todos los stands', 'Colecciona sellos de municipios'],
  },
  {
    nombre: 'Degustador',
    minPuntos: 100,
    color: '#6B4226',
    emoji: '☕',
    beneficios: ['Descuento 5% en stands participantes', 'Acceso a catas guiadas'],
  },
  {
    nombre: 'Conocedor',
    minPuntos: 250,
    color: '#2E7D32',
    emoji: '🌿',
    beneficios: ['Descuento 10% en stands', 'Invitación a evento exclusivo', 'Doble puntos en Happy Hour'],
  },
  {
    nombre: 'Embajador Cafetero',
    minPuntos: 500,
    color: '#F57F17',
    emoji: '🏅',
    beneficios: ['Descuento 15% en todos los stands', 'Acceso VIP a eventos', 'Doble puntos siempre', 'Kit cafetero de regalo'],
  },
];

export const getMunicipio = (id: string): Municipio | undefined =>
  MUNICIPIOS.find(m => m.id === id);

export const getNivelActual = (puntos: number) =>
  [...NIVELES].reverse().find(n => puntos >= n.minPuntos) ?? NIVELES[0];

export const getNivelSiguiente = (puntos: number) =>
  NIVELES.find(n => n.minPuntos > puntos) ?? null;

export const getMunicipiosPorRegion = () => {
  const regiones: Record<string, Municipio[]> = {};
  MUNICIPIOS.forEach(m => {
    if (!regiones[m.region]) regiones[m.region] = [];
    regiones[m.region].push(m);
  });
  return regiones;
};
