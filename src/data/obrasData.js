// Base de datos de obras - Sistema CMS simple
export const obrasData = [
  {
    id: 1,
    nombre: "ROUGE UNICENTER",
    categoria: "Retail / Comercial",
    ubicacion: "Martínez, Buenos Aires",
    año: 2024,
    descripcion: "Proyecto comercial de alto estándar en Unicenter Shopping. Refacción completa de local comercial con diseño moderno y funcional, cumpliendo con los más altos estándares de calidad.",
    imagen: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80"
    ],
    destacada: true,
    metrosCuadrados: 450,
    cliente: "Rouge Cosmetics"
  },
  {
    id: 2,
    nombre: "EDIFICIO CORPORATIVO MADERO",
    categoria: "Oficinas",
    ubicacion: "Puerto Madero, CABA",
    año: 2024,
    descripcion: "Construcción y refacción de oficinas corporativas de última generación. Proyecto integral que incluye diseño arquitectónico, instalaciones de alta complejidad y acabados premium.",
    imagen: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
    ],
    destacada: true,
    metrosCuadrados: 1200,
    cliente: "Grupo Empresarial"
  },
  {
    id: 3,
    nombre: "PLANTA INDUSTRIAL",
    categoria: "Industrial",
    ubicacion: "Campana, Buenos Aires",
    año: 2023,
    descripcion: "Ampliación de planta industrial con instalaciones de alta complejidad. Construcción de naves industriales con tecnología de punta.",
    imagen: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80"
    ],
    destacada: true,
    metrosCuadrados: 2500,
    cliente: "Industria Manufacturera"
  },
  {
    id: 4,
    nombre: "CENTRO EDUCATIVO",
    categoria: "Oficinas",
    ubicacion: "San Isidro, Buenos Aires",
    año: 2023,
    descripcion: "Refacción y ampliación de institución educativa. Incluye aulas modernas, laboratorios y espacios recreativos.",
    imagen: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"
    ],
    destacada: false,
    metrosCuadrados: 1800,
    cliente: "Instituto Educativo"
  },
  {
    id: 5,
    nombre: "CLÍNICA PRIVADA",
    categoria: "Industrial",
    ubicacion: "Vicente López, Buenos Aires",
    año: 2024,
    descripcion: "Construcción de anexo hospitalario con quirófanos de última generación y habitaciones premium.",
    imagen: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"
    ],
    destacada: true,
    metrosCuadrados: 3200,
    cliente: "Sanatorio Privado"
  },
  {
    id: 6,
    nombre: "EDIFICIO RESIDENCIAL",
    categoria: "Oficinas",
    ubicacion: "Nordelta, Buenos Aires",
    año: 2023,
    descripcion: "Desarrollo inmobiliario de 24 unidades con amenities de primer nivel y diseño contemporáneo.",
    imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
    ],
    destacada: false,
    metrosCuadrados: 4200,
    cliente: "Desarrollador Inmobiliario"
  },
  {
    id: 7,
    nombre: "RESTAURANTE GOURMET",
    categoria: "Retail / Comercial",
    ubicacion: "Palermo, CABA",
    año: 2024,
    descripcion: "Refacción integral de restaurante de alta cocina. Diseño exclusivo con cocina profesional y ambientes sofisticados.",
    imagen: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
    ],
    destacada: true,
    metrosCuadrados: 380,
    cliente: "Grupo Gastronómico"
  },
  {
    id: 8,
    nombre: "SEDE INSTITUCIONAL",
    categoria: "Bancos",
    ubicacion: "Centro, CABA",
    año: 2023,
    descripcion: "Restauración y modernización de edificio histórico para sede institucional. Preservación de fachada original con actualización completa interior.",
    imagen: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80"
    ],
    destacada: false,
    metrosCuadrados: 1500,
    cliente: "Organización Civil"
  }
];

// Función para agregar nueva obra (simulación de CMS)
export const agregarObra = (obra) => {
  const nuevaObra = {
    ...obra,
    id: obrasData.length + 1
  };
  obrasData.push(nuevaObra);
  return nuevaObra;
};

// Función para editar obra
export const editarObra = (id, datosActualizados) => {
  const index = obrasData.findIndex(obra => obra.id === id);
  if (index !== -1) {
    obrasData[index] = { ...obrasData[index], ...datosActualizados };
    return obrasData[index];
  }
  return null;
};

// Función para eliminar obra
export const eliminarObra = (id) => {
  const index = obrasData.findIndex(obra => obra.id === id);
  if (index !== -1) {
    obrasData.splice(index, 1);
    return true;
  }
  return false;
};

// Obtener obras destacadas
export const getObrasDestacadas = () => {
  return obrasData.filter(obra => obra.destacada);
};

// Obtener obras por categoría
export const getObrasPorCategoria = (categoria) => {
  return obrasData.filter(obra => obra.categoria === categoria);
};
