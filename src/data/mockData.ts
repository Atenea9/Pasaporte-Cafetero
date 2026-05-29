export type ModeloSello = 'A' | 'B' | 'C' | 'D';

export interface Municipio {
  id: string;
  nombre: string;
  color: string;
  emoji: string;
  modelo: ModeloSello;
  region: string;
}

// 36 municipios cafeteros del Tolima — Feria Internacional del Café Chaparral 2026
export const MUNICIPIOS: Municipio[] = [
  // ── NORTE ────────────────────────────────────────────────────────────────
  // ⛰️ Subregión Norte
  { id: 'armero',        nombre: 'Armero-Guayabal',  color: '#C62828', emoji: '🌋', modelo: 'D', region: 'Norte' },
  { id: 'falan',         nombre: 'Falán',             color: '#558B2F', emoji: '🌿', modelo: 'D', region: 'Norte' },
  { id: 'fresno',        nombre: 'Fresno',            color: '#E65100', emoji: '🍊', modelo: 'A', region: 'Norte' },
  { id: 'herveo',        nombre: 'Herveo',            color: '#00695C', emoji: '🏔️', modelo: 'B', region: 'Norte' },
  { id: 'mariquita',     nombre: 'Mariquita',         color: '#BF360C', emoji: '🌺', modelo: 'A', region: 'Norte' },
  { id: 'palocabildo',   nombre: 'Palocabildo',       color: '#2E7D32', emoji: '🌳', modelo: 'C', region: 'Norte' },
  // 🌋 Subregión Nevados
  { id: 'casabianca',    nombre: 'Casabianca',        color: '#F57F17', emoji: '🌻', modelo: 'C', region: 'Norte' },
  { id: 'lerida',        nombre: 'Lérida',            color: '#1565C0', emoji: '💧', modelo: 'C', region: 'Norte' },
  { id: 'libano',        nombre: 'Líbano',            color: '#4A148C', emoji: '🔮', modelo: 'D', region: 'Norte' },
  { id: 'murillo',       nombre: 'Murillo',           color: '#37474F', emoji: '❄️', modelo: 'B', region: 'Norte' },
  { id: 'santa_isabel',  nombre: 'Santa Isabel',      color: '#6D4C41', emoji: '⛪', modelo: 'D', region: 'Norte' },
  { id: 'villahermosa',  nombre: 'Villahermosa',      color: '#00838F', emoji: '🏡', modelo: 'A', region: 'Norte' },
  // ── CENTRO ───────────────────────────────────────────────────────────────
  // 🏙️ Subregión Centro (Ibagué)
  { id: 'alvarado',      nombre: 'Alvarado',          color: '#827717', emoji: '🌾', modelo: 'B', region: 'Centro' },
  { id: 'anzoategui',    nombre: 'Anzoátegui',        color: '#6B4226', emoji: '🌄', modelo: 'B', region: 'Centro' },
  { id: 'ibague',        nombre: 'Ibagué',            color: '#8B4513', emoji: '☕', modelo: 'A', region: 'Centro' },
  { id: 'venadillo',     nombre: 'Venadillo',         color: '#558B2F', emoji: '🦌', modelo: 'A', region: 'Centro' },
  // ── SUR ──────────────────────────────────────────────────────────────────
  // 🌄 Subregión Sur
  { id: 'ataco',         nombre: 'Ataco',             color: '#BF360C', emoji: '🔥', modelo: 'C', region: 'Sur' },
  { id: 'coyaima',       nombre: 'Coyaima',           color: '#E65100', emoji: '🏺', modelo: 'A', region: 'Sur' },
  { id: 'natagaima',     nombre: 'Natagaima',         color: '#BF360C', emoji: '🌵', modelo: 'B', region: 'Sur' },
  { id: 'planadas',      nombre: 'Planadas',          color: '#2E7D32', emoji: '🌿', modelo: 'D', region: 'Sur' },
  { id: 'rioblanco',     nombre: 'Rio Blanco',        color: '#1565C0', emoji: '💧', modelo: 'C', region: 'Sur' },
  { id: 'roncesvalles',  nombre: 'Roncesvalles',      color: '#37474F', emoji: '🏔️', modelo: 'D', region: 'Sur' },
  { id: 'san_antonio',   nombre: 'San Antonio',       color: '#558B2F', emoji: '🌾', modelo: 'A', region: 'Sur' },
  { id: 'cajamarca',     nombre: 'Cajamarca',         color: '#1B5E20', emoji: '🥕', modelo: 'A', region: 'Sur' },
  { id: 'rovira',        nombre: 'Rovira',            color: '#00695C', emoji: '🦜', modelo: 'D', region: 'Sur' },
  { id: 'san_luis',      nombre: 'San Luis',          color: '#AD1457', emoji: '🌸', modelo: 'B', region: 'Sur' },
  { id: 'valle_san_juan',nombre: 'Valle de San Juan', color: '#0277BD', emoji: '🏞️', modelo: 'C', region: 'Sur' },
  // 🌿 Subregión Suroriente
  { id: 'alpujarra',     nombre: 'Alpujarra',         color: '#00695C', emoji: '🌱', modelo: 'B', region: 'Sur' },
  { id: 'cunday',        nombre: 'Cunday',            color: '#2E7D32', emoji: '🌿', modelo: 'B', region: 'Sur' },
  { id: 'dolores',       nombre: 'Dolores',           color: '#880E4F', emoji: '🌸', modelo: 'C', region: 'Sur' },
  { id: 'icononzo',      nombre: 'Icononzo',          color: '#33691E', emoji: '🦋', modelo: 'A', region: 'Sur' },
  { id: 'melgar',        nombre: 'Melgar',            color: '#F57F17', emoji: '☀️', modelo: 'B', region: 'Sur' },
  { id: 'prado',         nombre: 'Prado',             color: '#1565C0', emoji: '🏞️', modelo: 'A', region: 'Sur' },
  { id: 'purificacion',  nombre: 'Purificación',      color: '#F57F17', emoji: '🕊️', modelo: 'B', region: 'Sur' },
  { id: 'suarez',        nombre: 'Suárez',            color: '#6A1B9A', emoji: '🍇', modelo: 'D', region: 'Sur' },
  { id: 'villarrica',    nombre: 'Villarrica',        color: '#4A148C', emoji: '🦚', modelo: 'B', region: 'Sur' },
];

export interface Stand {
  id: string;
  nombre: string;
  municipioId: string;
  productos: string[];
  activo: boolean;
  ventas?: number;
  seccion?: string;
}

export const STANDS: Stand[] = [
  { id: 's1',  nombre: 'Café Planadas Premium',   municipioId: 'planadas',    productos: ['Café especial', 'Tostión media'],         activo: true,  ventas: 342, seccion: 'A' },
  { id: 's2',  nombre: 'Artesanías Ibagué',        municipioId: 'ibague',      productos: ['Sombreros', 'Canastos', 'Tejidos'],       activo: true,  ventas: 201, seccion: 'B' },
  { id: 's3',  nombre: 'Sabores del Rio Blanco',   municipioId: 'rioblanco',   productos: ['Arepas', 'Café de altura', 'Mermeladas'], activo: true,  ventas: 289, seccion: 'A' },
  { id: 's4',  nombre: 'Oro Verde Casabianca',     municipioId: 'casabianca',  productos: ['Café orgánico', 'Panela'],                activo: true,  ventas: 178, seccion: 'C' },
  { id: 's5',  nombre: 'Herrera Natural',          municipioId: 'herrera',     productos: ['Frutas deshidratadas', 'Aromáticas'],    activo: true,  ventas: 156, seccion: 'B' },
  { id: 's6',  nombre: 'Café Alpujarra',           municipioId: 'alpujarra',   productos: ['Café filtrado', 'Catas en vivo'],         activo: true,  ventas: 320, seccion: 'A' },
  { id: 's7',  nombre: 'Ataco Fuerte',             municipioId: 'ataco',       productos: ['Tostión oscura', 'Café molido'],          activo: true,  ventas: 145, seccion: 'C' },
  { id: 's8',  nombre: 'Maderas Chaparral',        municipioId: 'chaparral',   productos: ['Artesanías en madera', 'Cafeteras'],      activo: true,  ventas: 198, seccion: 'B' },
  { id: 's9',  nombre: 'Frescura Fresno',          municipioId: 'fresno',      productos: ['Café fresco', 'Mermeladas artesanales'],  activo: true,  ventas: 267, seccion: 'A' },
  { id: 's10', nombre: 'Nieves del Murillo',       municipioId: 'murillo',     productos: ['Café de páramo', 'Chocolate'],           activo: false, ventas: 89,  seccion: 'C' },
  { id: 's11', nombre: 'Líbano Café de Altura',    municipioId: 'libano',      productos: ['Café lavado', 'Tostión clara'],           activo: true,  ventas: 312, seccion: 'A' },
  { id: 's12', nombre: 'Cajamarca La Despensa',    municipioId: 'cajamarca',   productos: ['Papa, café y más', 'Productos frescos'], activo: true,  ventas: 134, seccion: 'B' },
];

export const PREMIOS = [
  { id: 'p1', nombre: 'Café Especial del Tolima', umbralPuntos: 1,   nivel: 1, icono: '☕', categoria: 'cafe'              },
  { id: 'p2', nombre: 'Kit de Café',              umbralPuntos: 201, nivel: 2, icono: '🎁', categoria: 'kits_cafe'         },
  { id: 'p3', nombre: 'Curso de Catación SCA',   umbralPuntos: 401, nivel: 3, icono: '📚', categoria: 'cursos'            },
  { id: 'p4', nombre: 'Visita Exclusiva a Finca', umbralPuntos: 601, nivel: 4, icono: '🏡', categoria: 'visitas_exclusivas'},
];

export const NIVELES = [
  {
    id: 'modo_cafetero',
    nombre: 'Modo Cafetero',
    minPuntos: 1,
    maxPuntos: 200,
    color: '#8B6914',
    emoji: '☕',
    premioKey: 'cafe',
    beneficios: ['Acceso a todos los stands', 'Café especial del Tolima', 'Colecciona sellos'],
  },
  {
    id: 'cazador_granos',
    nombre: 'Cazador de Granos',
    minPuntos: 201,
    maxPuntos: 400,
    color: '#2E7D32',
    emoji: '🌿',
    premioKey: 'kits_cafe',
    beneficios: ['Kit de café artesanal', 'Descuento 5% en stands', 'Acceso a catas guiadas'],
  },
  {
    id: 'maestro_grano',
    nombre: 'Maestro del Grano',
    minPuntos: 401,
    maxPuntos: 600,
    color: '#1565C0',
    emoji: '🏆',
    premioKey: 'cursos',
    beneficios: ['Curso certificado de catación SCA', 'Descuento 10%', 'Doble puntos en Happy Hour'],
  },
  {
    id: 'gold_brew',
    nombre: 'Gold Brew Society',
    minPuntos: 601,
    maxPuntos: 99999,
    color: '#CFA020',
    emoji: '👑',
    premioKey: 'visitas_exclusivas',
    beneficios: ['Visita exclusiva a finca cafetera', 'Descuento 15%', 'Acceso VIP', 'Kit premium'],
  },
];

export interface LoteSubasta {
  id: string;
  nombre: string;
  finca: string;
  municipioId: string;
  caficultor: string;
  variedad: string;
  proceso: string;
  altitud: number;
  peso_kg: number;
  sca: number;
  notas: string[];
  historia: string;
  puja_base_usd: number;
  puja_actual_usd: number;
  num_pujas: number;
  activa: boolean;
}

export const LOTES_SUBASTA: LoteSubasta[] = [
  {
    id: 'lot1',
    nombre: 'Lote Especial #1 — Geisha Honey',
    finca: 'Finca La Esperanza',
    municipioId: 'planadas',
    caficultor: 'Don Hernando Gómez Ospina',
    variedad: 'Geisha',
    proceso: 'Honey',
    altitud: 1800,
    peso_kg: 500,
    sca: 87.5,
    notas: ['Jazmín', 'Durazno', 'Panela', 'Cítricos'],
    historia: 'La familia Gómez lleva 3 generaciones cultivando en las laderas del Páramo de Las Hermosas. Este lote Geisha fue seleccionado grano a grano durante la cosecha de 2025.',
    puja_base_usd: 8500,
    puja_actual_usd: 9200,
    num_pujas: 7,
    activa: true,
  },
  {
    id: 'lot2',
    nombre: 'Lote Especial #2 — Tabi Natural',
    finca: 'Finca Las Brisas del Sur',
    municipioId: 'herrera',
    caficultor: 'Doña Carmen Rosa Vargas',
    variedad: 'Tabi',
    proceso: 'Natural',
    altitud: 1650,
    peso_kg: 300,
    sca: 89.0,
    notas: ['Frutos rojos', 'Chocolate oscuro', 'Uva pasa', 'Almendra'],
    historia: 'Doña Carmen Rosa es la primera mujer productora de Herrera en llegar a los 89 puntos SCA. Fundó su finca hace 20 años tras aprender el oficio de su padre. Hoy es referente del café tolimense.',
    puja_base_usd: 12000,
    puja_actual_usd: 14500,
    num_pujas: 12,
    activa: true,
  },
  {
    id: 'lot3',
    nombre: 'Lote Especial #3 — Colombia Washed',
    finca: 'Finca Los Pinos',
    municipioId: 'chaparral',
    caficultor: 'Carlos Arturo Pérez Ríos',
    variedad: 'Colombia',
    proceso: 'Washed',
    altitud: 1720,
    peso_kg: 400,
    sca: 86.5,
    notas: ['Caramelo', 'Mandarina', 'Manzana verde', 'Floral'],
    historia: 'Los Pinos fue fundada en 1987 y hoy produce algunos de los cafés lavados más consistentes del sur del Tolima. Carlos Arturo participa en la feria por quinto año consecutivo.',
    puja_base_usd: 7200,
    puja_actual_usd: 7800,
    num_pujas: 4,
    activa: true,
  },
  {
    id: 'lot4',
    nombre: 'Lote Especial #4 — Líbano Castillo',
    finca: 'Finca Villa María Alta',
    municipioId: 'libano',
    caficultor: 'Jesús Antonio Molina',
    variedad: 'Castillo',
    proceso: 'Fully Washed',
    altitud: 1900,
    peso_kg: 600,
    sca: 85.0,
    notas: ['Miel', 'Avellana', 'Vainilla', 'Cacao'],
    historia: 'Líbano, conocido como "La Ciudad Luz del Tolima", produce cafés de gran altitud con cuerpo destacado. Jesús Antonio heredó los cafetales de su abuelo y los ha modernizado con secado solar controlado.',
    puja_base_usd: 6500,
    puja_actual_usd: 6500,
    num_pujas: 0,
    activa: false,
  },
  {
    id: 'lot5',
    nombre: 'Lote Especial #5 — Roncesvalles Caturra',
    finca: 'Finca El Edén',
    municipioId: 'roncesvalles',
    caficultor: 'Familia Salcedo Trujillo',
    variedad: 'Caturra',
    proceso: 'Natural',
    altitud: 2050,
    peso_kg: 250,
    sca: 88.0,
    notas: ['Floral intenso', 'Fresa', 'Tamarindo', 'Azúcar morena'],
    historia: 'Ubicado a más de 2.000 m.s.n.m., El Edén es uno de los cafetales más altos del Tolima. La familia Salcedo ha ganado 3 reconocimientos nacionales en los últimos 5 años.',
    puja_base_usd: 11000,
    puja_actual_usd: 13200,
    num_pujas: 9,
    activa: true,
  },
];

export interface EventoAgenda {
  id: string;
  dia: number;
  fecha: string;
  hora: string;
  titulo: string;
  lugar: string;
  tipo: 'apertura' | 'cata' | 'subasta' | 'taller' | 'premiacion' | 'cultural' | 'conferencia';
  descripcion: string;
}

export const AGENDA: EventoAgenda[] = [
  { id: 'a1',  dia: 1, fecha: 'Jue 29 May', hora: '08:00',  titulo: 'Ceremonia de Apertura Oficial', lugar: 'Escenario Principal', tipo: 'apertura',    descripcion: 'Apertura oficial a cargo de la Gobernadora del Tolima, Adriana Magali Matiz, y representantes del Comité de Cafeteros.' },
  { id: 'a2',  dia: 1, fecha: 'Jue 29 May', hora: '10:00',  titulo: 'Cata Inaugural de Cafés Especiales', lugar: 'Salón de Catas A', tipo: 'cata',        descripcion: 'Cata guiada de los 5 mejores lotes de subasta con evaluadores certificados SCA.' },
  { id: 'a3',  dia: 1, fecha: 'Jue 29 May', hora: '14:00',  titulo: 'Conferencia: El Café Tolimense en el Mundo', lugar: 'Auditorio Central', tipo: 'conferencia', descripcion: 'Ponencia sobre la proyección internacional del café del Tolima.' },
  { id: 'a4',  dia: 1, fecha: 'Jue 29 May', hora: '16:30',  titulo: 'Música y Folclor del Tolima', lugar: 'Plaza Cultural', tipo: 'cultural',    descripcion: 'Muestra cultural con música, danzas y gastronomía típica del Tolima Grande.' },
  { id: 'a5',  dia: 2, fecha: 'Vie 30 May', hora: '09:00',  titulo: 'Taller: Métodos de Extracción de Café', lugar: 'Stand Taller #1', tipo: 'taller',      descripcion: 'Aprende V60, Chemex y AeroPress con baristas certificados Q-Grader.' },
  { id: 'a6',  dia: 2, fecha: 'Vie 30 May', hora: '11:00',  titulo: 'Subasta Internacional — Sesión 1', lugar: 'Sala de Subastas', tipo: 'subasta',     descripcion: 'Primera sesión de subastas en vivo. Lotes #1, #2 y #3. Pujas en dólares.' },
  { id: 'a7',  dia: 2, fecha: 'Vie 30 May', hora: '14:00',  titulo: 'Panel: Mujeres Líderes del Café', lugar: 'Auditorio Central', tipo: 'conferencia', descripcion: 'Panel de productoras cafeteras del Tolima: innovación, sostenibilidad y liderazgo.' },
  { id: 'a8',  dia: 2, fecha: 'Vie 30 May', hora: '16:00',  titulo: 'Taller: Catación SCA Nivel Básico', lugar: 'Salón de Catas B', tipo: 'cata',        descripcion: 'Introducción a los protocolos de catación de la Specialty Coffee Association.' },
  { id: 'a9',  dia: 2, fecha: 'Vie 30 May', hora: '19:00',  titulo: 'Noche Cultural Cafetera', lugar: 'Plaza Principal', tipo: 'cultural',    descripcion: 'Velada con música en vivo, gastronomía y coctelería de café.' },
  { id: 'a10', dia: 3, fecha: 'Sáb 31 May', hora: '09:00',  titulo: 'Campeonato de Barismo Tolima 2026', lugar: 'Escenario Barismo', tipo: 'taller',      descripcion: 'Competencia regional de baristas. Disciplinas: espresso, leche y bebida libre.' },
  { id: 'a11', dia: 3, fecha: 'Sáb 31 May', hora: '12:00',  titulo: 'Subasta Internacional — Sesión 2 (Final)', lugar: 'Sala de Subastas', tipo: 'subasta',     descripcion: 'Sesión final de subastas. Lotes #4 y #5. Gran remate de la Feria 2026.' },
  { id: 'a12', dia: 3, fecha: 'Sáb 31 May', hora: '15:00',  titulo: 'Ceremonia de Premiación y Clausura', lugar: 'Escenario Principal', tipo: 'premiacion',  descripcion: 'Entrega de reconocimientos a los mejores caficultores, baristas y compradores de la Feria 2026.' },
];

export interface Auspiciador {
  id: string;
  nombre: string;
  cargo?: string;
  rol: string;
  descripcion: string;
  color: string;
  emoji: string;
  destacado?: boolean;
}

export const AUSPICIADORES: Auspiciador[] = [
  {
    id: 'gob_tolima',
    nombre: 'Gobernación del Tolima',
    cargo: 'Gobernadora: Adriana Magali Matiz',
    rol: 'Auspiciador Principal',
    descripcion: 'La Gobernadora Adriana Magali Matiz ha sido una de las mandatarias regionales que más ha impulsado el sector cafetero del Tolima, liderando programas de internacionalización, apoyo a pequeños productores y posicionamiento del café tolimense en mercados de especialidad a nivel mundial. Su gestión ha transformado el sector.',
    color: '#1565C0',
    emoji: '🏛️',
    destacado: true,
  },
  {
    id: 'comite_cafeteros',
    nombre: 'Comité Departamental de Cafeteros del Tolima',
    rol: 'Co-organizador',
    descripcion: 'El Comité de Cafeteros del Tolima es el ente gremial que representa a más de 38.000 familias cafeteras del departamento. Lidera programas de asistencia técnica, sostenibilidad, investigación y comercialización del café tolimense en mercados nacionales e internacionales.',
    color: '#2E7D32',
    emoji: '☕',
    destacado: true,
  },
  {
    id: 'fnc',
    nombre: 'Federación Nacional de Cafeteros',
    rol: 'Aliado Estratégico',
    descripcion: 'La FNC, creadora del icónico Juan Valdez, lidera la estrategia de promoción y comercialización del café colombiano en más de 60 países. Su respaldo técnico y comercial es fundamental para el éxito de la Feria Internacional de Café de Chaparral.',
    color: '#BF360C',
    emoji: '🌿',
  },
  {
    id: 'alcaldia',
    nombre: 'Alcaldía de Chaparral',
    rol: 'Sede Anfitriona',
    descripcion: 'El municipio de Chaparral, sede de la Feria 2026, es uno de los principales productores de café de calidad del sur del Tolima. La Alcaldía lidera la logística y el apoyo comunitario para hacer de este evento un hito en la región.',
    color: '#6D4C41',
    emoji: '🏘️',
  },
];

export interface SeccionMapa {
  id: string;
  nombre: string;
  color: string;
  icono: string;
  descripcion: string;
}

export const SECCIONES_MAPA: SeccionMapa[] = [
  { id: 'A', nombre: 'Zona Cafés Especiales', color: '#CFA020', icono: '☕', descripcion: 'Productores de café de especialidad y microlotes' },
  { id: 'B', nombre: 'Zona Artesanías', color: '#2E7D32', icono: '🎨', descripcion: 'Artesanos y productores locales del Tolima' },
  { id: 'C', nombre: 'Zona Gastronomía', color: '#BF360C', icono: '🍽️', descripcion: 'Restaurantes y productos gastronómicos del Tolima' },
  { id: 'D', nombre: 'Zona Cultural', color: '#1565C0', icono: '🎭', descripcion: 'Escenarios culturales y presentaciones artísticas' },
];

export const getMunicipio = (id: string): Municipio | undefined =>
  MUNICIPIOS.find(m => m.id === id);

export const getNivelActual = (puntos: number) => {
  if (puntos <= 0) return null;
  return [...NIVELES].reverse().find(n => puntos >= n.minPuntos) ?? NIVELES[0];
};

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

export const getTopStands = (n = 5) =>
  [...STANDS].sort((a, b) => (b.ventas ?? 0) - (a.ventas ?? 0)).slice(0, n);
