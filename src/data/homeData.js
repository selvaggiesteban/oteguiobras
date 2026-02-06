import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Configuración del Home - Editable desde Admin

// Configuración por defecto
const defaultConfig = {
  // Hero
  hero: {
    videoUrl: "https://ocreconstrucciones.com/wp-content/uploads/2025/06/Ocre-Construcciones.mp4",
    titulo: "Construimos",
    tituloDestacado: "Espacios",
    subtitulo: "Excelencia en construcción"
  },

  // Métricas
  metricas: {
    anos: {
      valor: 22,
      label: "Años de experiencia"
    },
    metrosConstructidos: {
      valor: 150000,
      label: "Metros construidos"
    },
    proyectos: {
      valor: 200,
      label: "Proyectos realizados"
    }
  }
};

// Cache en memoria
let cachedConfig = defaultConfig; // Inicializar con default en lugar de null

// Cargar configuración desde Firebase
export const loadConfig = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'home');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      cachedConfig = docSnap.data();
      return cachedConfig;
    } else {
      // Si no existe, crear documento con config default
      await setDoc(docRef, defaultConfig);
      cachedConfig = defaultConfig;
      return defaultConfig;
    }
  } catch (error) {
    console.error('Error cargando configuración:', error);
    return defaultConfig;
  }
};

// Obtener config desde cache o cargar
export const getHomeConfig = () => {
  return cachedConfig; // Ya no devuelve null, siempre devuelve al menos defaultConfig
};

// Función para actualizar y guardar configuración en Firebase
export const actualizarHomeConfig = async (nuevaConfig) => {
  try {
    const configActualizada = { ...cachedConfig, ...nuevaConfig };
    const docRef = doc(db, 'otegui_config', 'home');
    await setDoc(docRef, configActualizada);
    cachedConfig = configActualizada;
    
    // Disparar evento para actualizar componentes
    window.dispatchEvent(new Event('homeConfigUpdated'));
    return configActualizada;
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    throw error;
  }
};

// Función para resetear a configuración default
export const resetHomeConfig = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'home');
    await setDoc(docRef, defaultConfig);
    cachedConfig = defaultConfig;
    window.dispatchEvent(new Event('homeConfigUpdated'));
    return defaultConfig;
  } catch (error) {
    console.error('Error reseteando configuración:', error);
    throw error;
  }
};

// Función para cargar datos demo a Firebase (primera vez)
export const cargarDatosDemo = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'home');
    await setDoc(docRef, defaultConfig);
    cachedConfig = defaultConfig;
    window.dispatchEvent(new Event('homeConfigUpdated'));
    return defaultConfig;
  } catch (error) {
    console.error('Error cargando datos demo:', error);
    throw error;
  }
};

// Inicializar - cargar config al importar
loadConfig();
