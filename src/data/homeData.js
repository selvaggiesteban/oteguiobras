import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Configuración del Home - Editable desde Admin

// Configuración por defecto
const defaultConfig = {
  // Hero
  hero: {
    heroImageUrl: "",
    titulo: "Construimos",
    tituloDestacado: "Espacios",
    subtitulo: "Excelencia en construcción corporativa e industrial"
  },

  // Métricas
  metricas: {
    anos: {
      valor: 22,
      label: "Años de experiencia"
    },
    metrosConstructidos: {
      valor: 150000,
      label: "m²"
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
      let data = docSnap.data();
      // Migrar valores desactualizados
      let needsUpdate = false;
      if (!data.hero?.titulo || /dise[ñn]amos/i.test(data.hero.titulo)) {
        data = { ...data, hero: { ...data.hero, titulo: defaultConfig.hero.titulo } };
        needsUpdate = true;
      }
      if (!data.hero?.tituloDestacado) {
        data = { ...data, hero: { ...data.hero, tituloDestacado: defaultConfig.hero.tituloDestacado } };
        needsUpdate = true;
      }
      if (!data.hero?.subtitulo) {
        data = { ...data, hero: { ...data.hero, subtitulo: defaultConfig.hero.subtitulo } };
        needsUpdate = true;
      }
      if (data.metricas?.metrosConstructidos?.label === 'Metros construidos') {
        data = { ...data, metricas: { ...data.metricas, metrosConstructidos: { ...data.metricas.metrosConstructidos, label: 'm²' } } };
        needsUpdate = true;
      }
      if (needsUpdate) {
        await setDoc(docRef, data);
      }
      cachedConfig = data;
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
