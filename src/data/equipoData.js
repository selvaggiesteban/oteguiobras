// Base de datos del equipo - Sistema CMS simple
export const equipoData = [
  {
    id: 1,
    nombre: "Juan Otegui",
    cargo: "Director General",
    especialidad: "Gestión de Proyectos",
    email: "jotegui@oteguiobras.com",
    telefono: "+54 11 2080-1145",
    foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    linkedin: "https://www.linkedin.com/",
    descripcion: "Más de 20 años de experiencia en gestión y dirección de obras.",
    destacado: true
  },
  {
    id: 2,
    nombre: "María González",
    cargo: "Arquitecta Senior",
    especialidad: "Diseño y Planificación",
    email: "mgonzalez@oteguiobras.com",
    telefono: "+54 11 2080-1145",
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    linkedin: "https://www.linkedin.com/",
    descripcion: "Especialista en diseño arquitectónico y coordinación de proyectos.",
    destacado: true
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    cargo: "Ingeniero Civil",
    especialidad: "Estructuras",
    email: "crodriguez@oteguiobras.com",
    telefono: "+54 11 2080-1145",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    linkedin: "https://www.linkedin.com/",
    descripcion: "Experto en cálculo estructural y supervisión de obra.",
    destacado: false
  }
];

// Función para agregar miembro del equipo (simulación de CMS)
export const agregarMiembro = (miembro) => {
  const nuevoMiembro = {
    ...miembro,
    id: equipoData.length + 1
  };
  equipoData.push(nuevoMiembro);
  return nuevoMiembro;
};

// Función para editar miembro
export const editarMiembro = (id, datosActualizados) => {
  const index = equipoData.findIndex(miembro => miembro.id === id);
  if (index !== -1) {
    equipoData[index] = { ...equipoData[index], ...datosActualizados };
    return equipoData[index];
  }
  return null;
};

// Función para eliminar miembro
export const eliminarMiembro = (id) => {
  const index = equipoData.findIndex(miembro => miembro.id === id);
  if (index !== -1) {
    equipoData.splice(index, 1);
    return true;
  }
  return false;
};

// Obtener miembros destacados
export const getMiembrosDestacados = () => {
  return equipoData.filter(miembro => miembro.destacado);
};
