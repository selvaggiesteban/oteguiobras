import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Obras Destacadas - Editable desde Admin

// Configuración por defecto
const defaultObrasDestacadas = [
  {
    id: 1,
    titulo: "Hicimos reformas en el Secretariado Nacional de la UOM",
    categoria: "Institucional",
    descripcion: "Reforma integral del edificio emblemático de la Unión Obrera Metalúrgica",
    imagen: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    año: 2023,
    metroCuadrados: "2,500",
    ubicacion: "Buenos Aires"
  },
  {
    id: 2,
    titulo: "Entregamos Oficinas Piso 10 MOSTAZA",
    categoria: "Gastronómico",
    descripcion: "Diseño y construcción de oficinas corporativas para MOSTAZA",
    imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    año: 2024,
    metroCuadrados: "1,800",
    ubicacion: "CABA"
  },
  {
    id: 3,
    titulo: "Construimos el nuevo Centro de Salud Integral",
    categoria: "Hospitalario",
    descripcion: "Centro médico de última generación con tecnología avanzada",
    imagen: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    año: 2024,
    metroCuadrados: "3,200",
    ubicacion: "Provincia de Buenos Aires"
  },
  {
    id: 4,
    titulo: "Completamos Torre Residencial Solares del Río",
    categoria: "Inmobiliario",
    descripcion: "Complejo residencial premium con amenities de primer nivel",
    imagen: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    año: 2023,
    metroCuadrados: "5,400",
    ubicacion: "Rosario"
  }
];

// Cache en memoria
let cachedObras = defaultObrasDestacadas; // Inicializar con default en lugar de null

// Cargar obras destacadas desde Firebase
export const loadObrasDestacadas = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'obras_destacadas');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      cachedObras = docSnap.data().obras;
      return cachedObras;
    } else {
      // Si no existe, crear documento con obras default
      await setDoc(docRef, { obras: defaultObrasDestacadas });
      cachedObras = defaultObrasDestacadas;
      return defaultObrasDestacadas;
    }
  } catch (error) {
    console.error('Error cargando obras destacadas:', error);
    return defaultObrasDestacadas;
  }
};

// Obtener obras desde cache
export const getObrasDestacadas = () => {
  return cachedObras; // Ya no devuelve null, siempre devuelve al menos defaultObrasDestacadas
};

// Función para actualizar obras destacadas en Firebase
export const actualizarObrasDestacadas = async (nuevasObras) => {
  try {
    const docRef = doc(db, 'otegui_config', 'obras_destacadas');
    await setDoc(docRef, { obras: nuevasObras });
    cachedObras = nuevasObras;
    
    // Disparar evento para actualizar componentes
    window.dispatchEvent(new Event('obrasDestacadasUpdated'));
    return nuevasObras;
  } catch (error) {
    console.error('Error actualizando obras destacadas:', error);
    throw error;
  }
};

// Función para actualizar una obra específica
export const actualizarObraDestacada = async (id, datosNuevos) => {
  const obras = await loadObrasDestacadas();
  const index = obras.findIndex(o => o.id === id);
  if (index !== -1) {
    obras[index] = { ...obras[index], ...datosNuevos };
    return await actualizarObrasDestacadas(obras);
  }
  return obras;
};

// Función para resetear a default
export const resetObrasDestacadas = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'obras_destacadas');
    await setDoc(docRef, { obras: defaultObrasDestacadas });
    cachedObras = defaultObrasDestacadas;
    window.dispatchEvent(new Event('obrasDestacadasUpdated'));
    return defaultObrasDestacadas;
  } catch (error) {
    console.error('Error reseteando obras destacadas:', error);
    throw error;
  }
};

// Función para cargar datos demo a Firebase (primera vez)
export const cargarDatosDemo = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'obras_destacadas');
    await setDoc(docRef, { obras: defaultObrasDestacadas });
    cachedObras = defaultObrasDestacadas;
    window.dispatchEvent(new Event('obrasDestacadasUpdated'));
    return defaultObrasDestacadas;
  } catch (error) {
    console.error('Error cargando datos demo:', error);
    throw error;
  }
};

// Inicializar - cargar obras al importar
loadObrasDestacadas();
