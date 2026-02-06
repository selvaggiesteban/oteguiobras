import { db, storage } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Clientes/Marcas - Editable desde Admin

// Configuración por defecto
const defaultClientes = [
  {
    id: 1,
    nombre: "UOM",
    logoUrl: "https://via.placeholder.com/200x100/d4a574/ffffff?text=UOM",
    orden: 1
  },
  {
    id: 2,
    nombre: "Mostaza",
    logoUrl: "https://via.placeholder.com/200x100/d4a574/ffffff?text=Mostaza",
    orden: 2
  },
  {
    id: 3,
    nombre: "Hospital",
    logoUrl: "https://via.placeholder.com/200x100/d4a574/ffffff?text=Hospital",
    orden: 3
  },
  {
    id: 4,
    nombre: "Constructora",
    logoUrl: "https://via.placeholder.com/200x100/d4a574/ffffff?text=Constructora",
    orden: 4
  },
  {
    id: 5,
    nombre: "Inmobiliaria",
    logoUrl: "https://via.placeholder.com/200x100/d4a574/ffffff?text=Inmobiliaria",
    orden: 5
  },
  {
    id: 6,
    nombre: "Empresa",
    logoUrl: "https://via.placeholder.com/200x100/d4a574/ffffff?text=Empresa",
    orden: 6
  }
];

// Cache en memoria
let cachedClientes = defaultClientes;

// Cargar clientes desde Firebase
export const loadClientes = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'clientes');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      cachedClientes = docSnap.data().clientes.sort((a, b) => a.orden - b.orden);
      return cachedClientes;
    } else {
      // Si no existe, crear documento con clientes default
      await setDoc(docRef, { clientes: defaultClientes });
      cachedClientes = defaultClientes;
      return defaultClientes;
    }
  } catch (error) {
    console.error('Error cargando clientes:', error);
    return defaultClientes;
  }
};

// Obtener clientes desde cache
export const getClientes = () => {
  return cachedClientes;
};

// Subir imagen a Firebase Storage
export const subirLogoCliente = async (file, clienteId) => {
  try {
    const storageRef = ref(storage, `clientes/${clienteId}_${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error subiendo logo:', error);
    throw error;
  }
};

// Eliminar imagen de Firebase Storage (opcional, por si quieres limpiar)
export const eliminarLogoStorage = async (logoUrl) => {
  try {
    if (logoUrl && logoUrl.includes('firebase')) {
      const logoRef = ref(storage, logoUrl);
      await deleteObject(logoRef);
    }
  } catch (error) {
    console.error('Error eliminando logo del storage:', error);
  }
};

// Actualizar clientes en Firebase
export const actualizarClientes = async (nuevosClientes) => {
  try {
    const clientesOrdenados = nuevosClientes.map((cliente, index) => ({
      ...cliente,
      orden: index + 1
    }));
    
    const docRef = doc(db, 'otegui_config', 'clientes');
    await setDoc(docRef, { clientes: clientesOrdenados });
    cachedClientes = clientesOrdenados;
    
    window.dispatchEvent(new Event('clientesUpdated'));
    return clientesOrdenados;
  } catch (error) {
    console.error('Error actualizando clientes:', error);
    throw error;
  }
};

// Agregar nuevo cliente
export const agregarCliente = async (cliente) => {
  const clientes = await loadClientes();
  const nuevoId = Math.max(0, ...clientes.map(c => c.id)) + 1;
  const nuevoCliente = {
    ...cliente,
    id: nuevoId,
    orden: clientes.length + 1
  };
  
  const nuevosClientes = [...clientes, nuevoCliente];
  return await actualizarClientes(nuevosClientes);
};

// Eliminar cliente
export const eliminarCliente = async (id) => {
  const clientes = await loadClientes();
  const cliente = clientes.find(c => c.id === id);
  
  // Eliminar logo del storage si existe
  if (cliente && cliente.logoUrl) {
    await eliminarLogoStorage(cliente.logoUrl);
  }
  
  const nuevosClientes = clientes.filter(c => c.id !== id);
  return await actualizarClientes(nuevosClientes);
};

// Reordenar clientes
export const reordenarClientes = async (clientesReordenados) => {
  return await actualizarClientes(clientesReordenados);
};

// Función para cargar datos demo
export const cargarDatosDemo = async () => {
  try {
    const docRef = doc(db, 'otegui_config', 'clientes');
    await setDoc(docRef, { clientes: defaultClientes });
    cachedClientes = defaultClientes;
    window.dispatchEvent(new Event('clientesUpdated'));
    return defaultClientes;
  } catch (error) {
    console.error('Error cargando datos demo:', error);
    throw error;
  }
};

// Inicializar - cargar clientes al importar
loadClientes();
