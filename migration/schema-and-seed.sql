-- ============================================================
-- Otegui Obras — Schema MySQL + Datos
-- Host: localhost | DB: oteguiobra_web
-- ============================================================

CREATE TABLE IF NOT EXISTS obras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) DEFAULT 'Retail / Comercial',
  ubicacion VARCHAR(255),
  anno INT,
  descripcion TEXT,
  imagenes JSON,
  imagen_portada INT DEFAULT 0,
  metros_cuadrados DECIMAL(10,2),
  cliente VARCHAR(255),
  destacada TINYINT(1) DEFAULT 0,
  visible TINYINT(1) DEFAULT 1,
  orden INT DEFAULT 0,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  cargo VARCHAR(255),
  especialidad VARCHAR(255),
  foto VARCHAR(500),
  visible TINYINT(1) DEFAULT 1,
  orden INT DEFAULT 0,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(100),
  empresa VARCHAR(255),
  mensaje TEXT,
  leido TINYINT(1) DEFAULT 0,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS postulaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(100),
  linkedin VARCHAR(500),
  cv_url VARCHAR(500),
  leido TINYINT(1) DEFAULT 0,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS config (
  config_key VARCHAR(100) PRIMARY KEY,
  config_value JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  creado DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Admin: admin@oteguiobras.com / Otegui2026!
-- ============================================================
INSERT INTO admins (email, password_hash) VALUES
('admin@oteguiobras.com', '$2y$10$LgTcRvg1vD3DYivZ7ANsr.iz6PsExhM6SDzf7e6CS5uJzuFtS9Uly');

-- ============================================================
-- Config defaults
-- ============================================================
INSERT INTO config (config_key, config_value) VALUES ('home', '{"hero":{"heroVideoUrl":"","titulo":"Construimos","tituloDestacado":"Espacios","subtitulo":"Excelencia en construcción corporativa e industrial","posicion":"centro","colorTexto":"#ffffff","colorDestacado":"#e8b84b","fontSize":"normal"},"metricas":{"anos":{"valor":22,"unidad":"","label":"Años de experiencia"},"metrosConstructidos":{"valor":150000,"unidad":"m²","label":"construidos"},"proyectos":{"valor":200,"unidad":"","label":"Obras realizadas"}}}') ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

INSERT INTO config (config_key, config_value) VALUES ('clientes', '{"clientes":[{"id":1,"nombre":"BBVA","logoUrl":"/logos/bbva.svg","orden":1},{"id":2,"nombre":"Banco Galicia","logoUrl":"/logos/banco-galicia.svg","orden":2},{"id":3,"nombre":"Isadora","logoUrl":"/logos/isadora.svg","orden":3},{"id":4,"nombre":"Mercedes-Benz","logoUrl":"/logos/mercedes-benz.svg","orden":4},{"id":5,"nombre":"Pfizer","logoUrl":"/logos/pfizer.svg","orden":5},{"id":6,"nombre":"Samsung","logoUrl":"/logos/samsung.svg","orden":6}]}') ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

INSERT INTO config (config_key, config_value) VALUES ('faq', '{"preguntas":[{"id":1,"pregunta":"¿Puedo fraccionar la obra por etapas?","respuesta":"Sí, ofrecemos la posibilidad de fraccionar tu proyecto en etapas para adaptarnos a tus necesidades y presupuesto.","orden":1},{"id":2,"pregunta":"¿Cómo garantizan los tiempos de entrega?","respuesta":"Trabajamos con cronogramas detallados y un sistema de gestión de proyectos que nos permite monitorear cada etapa.","orden":2},{"id":3,"pregunta":"¿Tienen casos de obras similares?","respuesta":"Contamos con un amplio portfolio de obras residenciales, comerciales e industriales.","orden":3},{"id":4,"pregunta":"¿Incluyen la ingeniería y los planos?","respuesta":"Sí, contamos con un equipo de ingenieros y arquitectos que se encargan del diseño completo.","orden":4},{"id":5,"pregunta":"¿Qué tipo de obras hacen?","respuesta":"Realizamos todo tipo de construcciones: viviendas unifamiliares, edificios, locales comerciales, galpones industriales.","orden":5}]}') ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

INSERT INTO config (config_key, config_value) VALUES ('obras_destacadas', '{"obras":[{"id":1,"titulo":"Hicimos reformas en el Secretariado Nacional de la UOM","categoria":"Retail / Comercial","descripcion":"Reforma integral del edificio emblemático de la Unión Obrera Metalúrgica","imagen":"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80","anno":2023,"metros_cuadrados":"2,500","ubicacion":"Buenos Aires"},{"id":2,"titulo":"Entregamos Oficinas Piso 10 MOSTAZA","categoria":"Gastronómico","descripcion":"Diseño y construcción de oficinas corporativas","imagen":"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80","anno":2024,"metros_cuadrados":"1,800","ubicacion":"CABA"},{"id":3,"titulo":"Construimos el nuevo Centro de Salud Integral","categoria":"Hospitalario","descripcion":"Centro médico de última generación","imagen":"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80","anno":2024,"metros_cuadrados":"3,200","ubicacion":"Provincia de Buenos Aires"},{"id":4,"titulo":"Completamos Torre Residencial Solares del Río","categoria":"Inmobiliario","descripcion":"Complejo residencial premium","imagen":"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80","anno":2023,"metros_cuadrados":"5,400","ubicacion":"Rosario"}]}') ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);
