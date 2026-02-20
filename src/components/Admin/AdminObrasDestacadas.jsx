import { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { useToast } from '../Toast';
import { getObrasDestacadas, actualizarObrasDestacadas, loadObrasDestacadas, cargarDatosDemo } from '../../data/obrasDestacadasData';
import './AdminObrasDestacadas.css';

function AdminObrasDestacadas() {
  const toast = useToast();
  const [obras, setObras] = useState(getObrasDestacadas());
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoDemo, setCargandoDemo] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(null); // id de la obra que está subiendo
  const fileInputRefs = useRef({});

  // Cargar obras desde Firebase al montar
  useEffect(() => {
    const cargarObras = async () => {
      setCargando(true);
      const obrasCargadas = await loadObrasDestacadas();
      setObras(obrasCargadas);
      setCargando(false);
    };
    cargarObras();
  }, []);

  const handleInputChange = (id, campo, valor) => {
    setObras(prev => prev.map(obra => 
      obra.id === id ? { ...obra, [campo]: valor } : obra
    ));
  };

  const handleImageUpload = async (obraId, file) => {
    if (!file) return;

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Formato no soportado. Usa JPG, PNG, WebP o AVIF');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    setSubiendoImagen(obraId);

    try {
      const extension = file.name.split('.').pop();
      const nombreArchivo = `obras-destacadas/obra_${obraId}_${Date.now()}.${extension}`;
      const storageRef = ref(storage, nombreArchivo);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      handleInputChange(obraId, 'imagen', url);
      toast.success('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      toast.error('Error al subir la imagen: ' + error.message);
    } finally {
      setSubiendoImagen(null);
      // Limpiar el input
      if (fileInputRefs.current[obraId]) {
        fileInputRefs.current[obraId].value = '';
      }
    }
  };

  const handleEliminarObra = (id) => {
    if (obras.length <= 1) {
      toast.warning('Debe haber al menos 1 obra destacada');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar esta obra destacada?')) return;

    setObras(prev => prev.filter(obra => obra.id !== id));
    toast.success('Obra eliminada. Guardá los cambios para confirmar.');
  };

  const handleAgregarObra = () => {
    const nuevoId = obras.length > 0 ? Math.max(...obras.map(o => o.id)) + 1 : 1;
    const nuevaObra = {
      id: nuevoId,
      titulo: '',
      categoria: 'Retail / Comercial',
      descripcion: '',
      imagen: '',
      año: new Date().getFullYear(),
      metroCuadrados: '',
      ubicacion: ''
    };
    setObras(prev => [...prev, nuevaObra]);
    toast.success('Nueva obra agregada. Completá los datos y guardá.');

    // Scroll al final
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleGuardar = async () => {
    // Validar que todas tengan al menos título
    const sinTitulo = obras.find(o => !o.titulo.trim());
    if (sinTitulo) {
      toast.warning('Todas las obras deben tener un título');
      return;
    }

    setGuardando(true);
    try {
      await actualizarObrasDestacadas(obras);
      toast.success('Obras destacadas guardadas exitosamente!');
    } catch (error) {
      toast.error('Error al guardar las obras: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleCargarDemo = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de cargar las obras demo?\n\nEsto sobrescribirá las obras destacadas actuales con los ejemplos.')) {
      setCargandoDemo(true);
      try {
        const obrasDemo = await cargarDatosDemo();
        setObras(obrasDemo);
        toast.success('Obras demo cargadas exitosamente!');
      } catch (error) {
        toast.error('Error al cargar obras demo: ' + error.message);
      } finally {
        setCargandoDemo(false);
      }
    }
  };

  if (cargando) {
    return (
      <div className="admin-obras-destacadas">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>⏳ Cargando obras destacadas desde Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-obras-destacadas">
      <div className="admin-header">
        <div>
          <h2>🏗️ Gestión de Obras Destacadas</h2>
          <p>Administra las obras destacadas que aparecen en el Home ({obras.length} obras)</p>
        </div>
        <div className="admin-header-actions">
          <button 
            className="btn-agregar-obra"
            onClick={handleAgregarObra}
          >
            ➕ Agregar Obra
          </button>
          <button 
            className="btn-demo"
            onClick={handleCargarDemo}
            disabled={cargandoDemo}
          >
            {cargandoDemo ? '⏳ Cargando...' : '📦 Cargar Demo'}
          </button>
        </div>
      </div>

      <div className="obras-destacadas-list">
        {obras.map((obra, index) => (
          <div key={obra.id} className="obra-destacada-form">
            <div className="obra-form-header">
              <h3>Obra Destacada #{index + 1}</h3>
              <button
                className="btn-eliminar-obra"
                onClick={() => handleEliminarObra(obra.id)}
                title="Eliminar esta obra destacada"
              >
                🗑️ Eliminar
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Título de la obra</label>
                <input
                  type="text"
                  value={obra.titulo}
                  onChange={(e) => handleInputChange(obra.id, 'titulo', e.target.value)}
                  placeholder="Ej: Hicimos reformas en el Secretariado Nacional de la UOM"
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={obra.categoria}
                  onChange={(e) => handleInputChange(obra.id, 'categoria', e.target.value)}
                >
                  <option value="Retail / Comercial">Retail / Comercial</option>
                  <option value="Oficinas">Oficinas</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Bancos">Bancos</option>
                  <option value="Institucional">Institucional</option>
                  <option value="Gastronómico">Gastronómico</option>
                  <option value="Hospitalario">Hospitalario</option>
                  <option value="Inmobiliario">Inmobiliario</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  value={obra.ubicacion}
                  onChange={(e) => handleInputChange(obra.id, 'ubicacion', e.target.value)}
                  placeholder="Ej: Buenos Aires"
                />
              </div>

              <div className="form-group">
                <label>Metros Cuadrados</label>
                <input
                  type="text"
                  value={obra.metroCuadrados}
                  onChange={(e) => handleInputChange(obra.id, 'metroCuadrados', e.target.value)}
                  placeholder="Ej: 2,500"
                />
              </div>

              <div className="form-group">
                <label>Año</label>
                <input
                  type="number"
                  value={obra.año}
                  onChange={(e) => handleInputChange(obra.id, 'año', parseInt(e.target.value) || new Date().getFullYear())}
                  placeholder={new Date().getFullYear().toString()}
                />
              </div>

              <div className="form-group full-width">
                <label>Descripción</label>
                <textarea
                  value={obra.descripcion}
                  onChange={(e) => handleInputChange(obra.id, 'descripcion', e.target.value)}
                  placeholder="Descripción breve de la obra..."
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label>Imagen</label>
                
                <div className="imagen-upload-container">
                  {/* Subir archivo */}
                  <div className="imagen-upload-archivo">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                      onChange={(e) => handleImageUpload(obra.id, e.target.files[0])}
                      ref={el => fileInputRefs.current[obra.id] = el}
                      id={`file-upload-${obra.id}`}
                      className="file-input-hidden"
                    />
                    <label 
                      htmlFor={`file-upload-${obra.id}`} 
                      className={`btn-subir-imagen ${subiendoImagen === obra.id ? 'subiendo' : ''}`}
                    >
                      {subiendoImagen === obra.id ? '⏳ Subiendo...' : '📁 Subir imagen'}
                    </label>
                  </div>

                  <span className="imagen-separador">o</span>

                  {/* URL manual */}
                  <input
                    type="text"
                    value={obra.imagen}
                    onChange={(e) => handleInputChange(obra.id, 'imagen', e.target.value)}
                    placeholder="Pegar URL de imagen..."
                    className="imagen-url-input"
                  />

                  {obra.imagen && (
                    <button
                      type="button"
                      className="btn-quitar-imagen"
                      onClick={() => handleInputChange(obra.id, 'imagen', '')}
                      title="Quitar imagen"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <small className="recomendacion">
                  📐 Tamaño recomendado: 800x600px (ratio 4:3) • Peso máx: 5MB • Formatos: JPG, PNG, WebP, AVIF
                </small>

                {obra.imagen && (
                  <div className="image-preview">
                    <img src={obra.imagen} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {obras.length === 0 && (
        <div className="obras-empty">
          <p>No hay obras destacadas. Agregá una nueva para comenzar.</p>
          <button className="btn-agregar-obra" onClick={handleAgregarObra}>
            ➕ Agregar Primera Obra
          </button>
        </div>
      )}

      <div className="admin-actions">
        <button onClick={handleGuardar} className="btn-guardar" disabled={guardando}>
          {guardando ? '⏳ Guardando en Firebase...' : '💾 Guardar Cambios'}
        </button>
      </div>

      <div className="admin-info">
        <h4>ℹ️ Información</h4>
        <ul>
          <li>Las obras se muestran en un diseño especial en el Home</li>
          <li>La primera obra aparece más grande</li>
          <li>Las obras 2 y 3 aparecen juntas en una fila</li>
          <li>La cuarta obra aparece grande al final</li>
          <li>Podés agregar, editar y eliminar obras destacadas</li>
          <li>Las imágenes se pueden subir desde tu PC o pegar una URL</li>
          <li>Los cambios se guardan en Firebase y persisten en la nube ☁️</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminObrasDestacadas;
