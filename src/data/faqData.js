import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Datos de preguntas frecuentes por defecto
const defaultFAQ = [
  {
    id: 1,
    pregunta: "¿Puedo fraccionar la obra por etapas?",
    respuesta: "Sí, ofrecemos la posibilidad de fraccionar tu proyecto en etapas para adaptarnos a tus necesidades y presupuesto. Podemos planificar juntos el cronograma de ejecución.",
    orden: 1
  },
  {
    id: 2,
    pregunta: "¿Cómo garantizan los tiempos de entrega?",
    respuesta: "Trabajamos con cronogramas detallados y un sistema de gestión de proyectos que nos permite monitorear cada etapa. Nuestro equipo está comprometido con cumplir los plazos establecidos.",
    orden: 2
  },
  {
    id: 3,
    pregunta: "¿Tienen casos de obras similares?",
    respuesta: "Contamos con un amplio portfolio de obras residenciales, comerciales e industriales. Podemos mostrarte proyectos similares al que tienes en mente para que veas nuestro trabajo.",
    orden: 3
  },
  {
    id: 4,
    pregunta: "¿Incluyen la ingeniería y los planos?",
    respuesta: "Sí, contamos con un equipo de ingenieros y arquitectos que se encargan del diseño completo, cálculos estructurales y toda la documentación necesaria para el proyecto.",
    orden: 4
  },
  {
    id: 5,
    pregunta: "¿Qué tipo de obras hacen?",
    respuesta: "Realizamos todo tipo de construcciones: viviendas unifamiliares, edificios, locales comerciales, galpones industriales, remodelaciones y ampliaciones. Cada proyecto se adapta a las necesidades del cliente.",
    orden: 5
  }
];

// Cache en memoria
let cachedFAQ = defaultFAQ;

// Cargar FAQ desde Firebase
export const loadFAQ = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'faq');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      cachedFAQ = data.preguntas || defaultFAQ;
      console.log('FAQ cargadas desde Firebase:', cachedFAQ);
    } else {
      console.log('No hay FAQ en Firebase, usando datos por defecto');
      cachedFAQ = defaultFAQ;
    }
    
    return cachedFAQ;
  } catch (error) {
    console.error('Error cargando FAQ:', error);
    return cachedFAQ;
  }
};

// Obtener FAQ (desde caché)
export const getFAQ = () => {
  return cachedFAQ;
};

// Guardar FAQ en Firebase
export const actualizarFAQ = async (preguntas) => {
  try {
    // Asegurar orden correcto
    const preguntasOrdenadas = preguntas.map((p, index) => ({
      ...p,
      orden: index + 1
    }));

    const docRef = doc(db, 'otegui_config', 'faq');
    await setDoc(docRef, {
      preguntas: preguntasOrdenadas,
      ultimaActualizacion: new Date().toISOString()
    });
    
    cachedFAQ = preguntasOrdenadas;
    console.log('FAQ guardadas en Firebase:', preguntasOrdenadas);
    
    // Notificar a otros componentes
    window.dispatchEvent(new Event('faqUpdated'));
    
    return true;
  } catch (error) {
    console.error('Error guardando FAQ:', error);
    throw error;
  }
};

// Agregar nueva pregunta
export const agregarPregunta = async (pregunta, respuesta) => {
  try {
    const nuevasPreguntaas = [...cachedFAQ];
    const nuevoId = Math.max(...nuevasPreguntaas.map(p => p.id), 0) + 1;
    
    nuevasPreguntaas.push({
      id: nuevoId,
      pregunta,
      respuesta,
      orden: nuevasPreguntaas.length + 1
    });
    
    await actualizarFAQ(nuevasPreguntaas);
    return true;
  } catch (error) {
    console.error('Error agregando pregunta:', error);
    throw error;
  }
};

// Eliminar pregunta
export const eliminarPregunta = async (id) => {
  try {
    const nuevasPreguntas = cachedFAQ.filter(p => p.id !== id);
    await actualizarFAQ(nuevasPreguntas);
    return true;
  } catch (error) {
    console.error('Error eliminando pregunta:', error);
    throw error;
  }
};

// Editar pregunta
export const editarPregunta = async (id, pregunta, respuesta) => {
  try {
    const nuevasPreguntas = cachedFAQ.map(p => 
      p.id === id ? { ...p, pregunta, respuesta } : p
    );
    await actualizarFAQ(nuevasPreguntas);
    return true;
  } catch (error) {
    console.error('Error editando pregunta:', error);
    throw error;
  }
};

// Reordenar preguntas
export const reordenarPreguntas = async (preguntaId, direccion) => {
  try {
    const nuevasPreguntas = [...cachedFAQ];
    const index = nuevasPreguntas.findIndex(p => p.id === preguntaId);
    
    if (index === -1) return false;
    
    if (direccion === 'arriba' && index > 0) {
      [nuevasPreguntas[index], nuevasPreguntas[index - 1]] = 
      [nuevasPreguntas[index - 1], nuevasPreguntas[index]];
    } else if (direccion === 'abajo' && index < nuevasPreguntas.length - 1) {
      [nuevasPreguntas[index], nuevasPreguntas[index + 1]] = 
      [nuevasPreguntas[index + 1], nuevasPreguntas[index]];
    } else {
      return false;
    }
    
    await actualizarFAQ(nuevasPreguntas);
    return true;
  } catch (error) {
    console.error('Error reordenando preguntas:', error);
    throw error;
  }
};

// Cargar datos de demostración
export const cargarDatosDemo = async () => {
  try {
    await actualizarFAQ(defaultFAQ);
    return true;
  } catch (error) {
    console.error('Error cargando datos demo:', error);
    throw error;
  }
};
