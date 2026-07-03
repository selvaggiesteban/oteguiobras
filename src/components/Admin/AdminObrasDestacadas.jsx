import { useState, useEffect, useRef } from 'react';
import { useToast } from '../Toast';
import { useUnsavedWarning } from '../../hooks/useUnsavedWarning';
import { getDestacadasConfig, updateDestacadasConfig, uploadConfigImage } from '../../api/config';
import './AdminObrasDestacadas.css';

// Helper: obtener la imagen de portada de una obra (retrocompatible)
const getPortada = (obra) => {
  if (obra.imagenes && obra.imagenes.length > 0) {
    const idx = obra.imagen_portada || 0;
    return obra.imagenes[idx] || obra.imagenes[0] || '';
  }
  return obra.imagen || '';
};

function AdminObrasDestacadas() {
  const toast = useToast();
  const categorias = ['Retail / Comercial', 'Oficinas', 'Industrial', 'Bancos', 'Gastronómico', 'Hospitalario', 'Inmobiliario', 'Proyecto'];
  const [obras, setObras] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRefs = useRef({});
  const markSaved = useUnsavedWarning(hasChanges);

  useEffect(() => {
    const cargarObras = async () => {
      setCargando(true);
      const data = await getDestacadasConfig();
      setObras(data.obras || data || []);
      setCargando(false);
    };
    cargarObras();
  }, []);

  const handleInputChange = (id, campo, valor) => {
    setObras(prev => prev.map(obra =>
      obra.id === id ? { ...obra, [campo]: valor } : obra
    ));
    setHasChanges(true);
  };

  // Subir múltiples imágenes a una obra
  const handleImagesUpload = async (obraId, files) => {
    if (!files || files.length === 0) return;

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    for (const file of files) {
      if (!tiposPermitidos.includes(file.type)) {
        toast.error(`Formato no soportado: ${file.name}. Usa JPG, PNG, WebP o AVIF`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} supera los 5MB`);
        return;
      }
    }

    setSubiendoImagen(obraId);
    try {
      const nuevasImagenes = [];
      for (const file of files) {
        const result = await uploadConfigImage(file, 'imagen');
        nuevasImagenes.push(result.url);
      }

      setObras(prev => prev.map(obra => {
        if (obra.id !== obraId) return obra;
        const imagenesActuales = obra.imagenes || (obra.imagen ? [obra.imagen] : []);
        return {
          ...obra,
          imagenes: [...imagenesActuales, ...nuevasImagenes],
          imagen_portada: obra.imagen_portada || 0
        };
      }));
      setHasChanges(true);
      toast.success(`${files.length} imagen(es) subida(s). Guardá los cambios.`);
    } catch (error) {
      console.error('Error subiendo imágenes:', error);
      toast.error('Error al subir: ' + error.message);
    } finally {
      setSubiendoImagen(null);
      if (fileInputRefs.current[obraId]) fileInputRefs.current[obraId].value = '';
    }
  };

  const handleRemoveImage = async (obraId, imgIndex) => {
    setObras(prev => prev.map(obra => {
      if (obra.id !== obraId) return obra;
      const imagenes = [...(obra.imagenes || [])];
      imagenes.splice(imgIndex, 1);

      // Ajustar portada si es necesario
      let portada = obra.imagen_portada || 0;
      if (imgIndex === portada) portada = 0;
      else if (imgIndex < portada) portada = portada - 1;
      if (portada >= imagenes.length) portada = Math.max(0, imagenes.length - 1);

      return { ...obra, imagenes, imagen_portada: portada };
    }));
    setHasChanges(true);
  };

  const handleSetPortada = (obraId, imgIndex) => {
    handleInputChange(obraId, 'imagen_portada', imgIndex);
  };

  const handleEliminarObra = (id) => {
    if (obras.length <= 1) {
      toast.warning('Debe haber al menos 1 obra destacada');
      return;
    }
    if (!window.confirm('¿Estás seguro de eliminar esta obra destacada?')) return;
    setObras(prev => prev.filter(obra => obra.id !== id));
    setHasChanges(true);
    toast.success('Obra eliminada. Guardá los cambios para confirmar.');
  };

  const handleAgregarObra = () => {
    const nuevoId = obras.length > 0 ? Math.max(...obras.map(o => o.id)) + 1 : 1;
    const nuevaObra = {
      id: nuevoId,
      titulo: '',
      categoria: 'Retail / Comercial',
      descripcion: '',
      imagenes: [],
      imagen_portada: 0,
      anno: new Date().getFullYear(),
      metros_cuadrados: '',
      ubicacion: ''
    };
    setObras(prev => [...prev, nuevaObra]);
    setHasChanges(true);
    toast.success('Nueva obra agregada. Completá los datos y guardá.');
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleGuardar = async () => {
    const sinTitulo = obras.find(o => !o.titulo.trim());
    if (sinTitulo) {
      toast.warning('Todas las obras deben tener un título');
      return;
    }

    setGuardando(true);
    try {
      // Normalizar antes de guardar
      const obrasNormalizadas = obras.map(obra => {
        if (!obra.imagenes && obra.imagen) {
          return { ...obra, imagenes: [obra.imagen], imagen_portada: 0 };
        }
        return obra;
      });
      await updateDestacadasConfig({obras: obrasNormalizadas});
      setObras(obrasNormalizadas);
      setHasChanges(false);
      markSaved();
      toast.success('Obras destacadas guardadas exitosamente!');
    } catch (error) {
      toast.error('Error al guardar las obras: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-obras-destacadas">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando obras destacadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-obras-destacadas">
      <div className="admin-header">
        <div>
          <h2>Gestion de Obras Destacadas</h2>
          <p>Administra las obras destacadas que aparecen en el Home ({obras.length} obras)</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-agregar-obra" onClick={handleAgregarObra}>
            + Agregar Obra
          </button>
        </div>
      </div>

      <div className="obras-destacadas-list">
        {obras.map((obra, index) => {
          const imagenes = obra.imagenes || (obra.imagen ? [obra.imagen] : []);
          const portadaIdx = obra.imagen_portada || 0;

          return (
            <div key={obra.id} className="obra-destacada-form">
              <div className="obra-form-header">
                <h3>Obra Destacada #{index + 1}</h3>
                <button
                  className="btn-eliminar-obra"
                  onClick={() => handleEliminarObra(obra.id)}
                  title="Eliminar esta obra destacada"
                >
                  Eliminar
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Titulo de la obra</label>
                  <input
                    type="text"
                    value={obra.titulo}
                    onChange={(e) => handleInputChange(obra.id, 'titulo', e.target.value)}
                    placeholder="Ej: Hicimos reformas en el Secretariado Nacional de la UOM"
                  />
                </div>

                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={obra.categoria}
                    onChange={(e) => handleInputChange(obra.id, 'categoria', e.target.value)}
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ubicacion</label>
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
                    value={obra.metros_cuadrados}
                    onChange={(e) => handleInputChange(obra.id, 'metros_cuadrados', e.target.value)}
                    placeholder="Ej: 2,500"
                  />
                </div>

                <div className="form-group">
                  <label>Ano</label>
                  <input
                    type="number"
                    value={obra.anno}
                    onChange={(e) => handleInputChange(obra.id, 'anno', parseInt(e.target.value) || new Date().getFullYear())}
                    placeholder={new Date().getFullYear().toString()}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descripcion</label>
                  <textarea
                    value={obra.descripcion}
                    onChange={(e) => handleInputChange(obra.id, 'descripcion', e.target.value)}
                    placeholder="Descripcion breve de la obra..."
                    rows="3"
                  />
                </div>

                {/* Multi-imagen */}
                <div className="form-group full-width">
                  <label>Imagenes ({imagenes.length}) — Hacé clic en una imagen para elegirla como portada</label>

                  {imagenes.length > 0 && (
                    <div className="imagenes-grid">
                      {imagenes.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          className={`imagen-thumb${imgIdx === portadaIdx ? ' imagen-portada' : ''}`}
                          onClick={() => handleSetPortada(obra.id, imgIdx)}
                          title={imgIdx === portadaIdx ? 'Imagen de portada' : 'Clic para usar como portada'}
                        >
                          <img src={img} alt={`Imagen ${imgIdx + 1}`} />
                          {imgIdx === portadaIdx && <span className="portada-badge">Portada</span>}
                          <button
                            type="button"
                            className="btn-remove-thumb"
                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(obra.id, imgIdx); }}
                            title="Eliminar imagen"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="imagen-upload-container">
                    <div className="imagen-upload-archivo">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                        multiple
                        onChange={(e) => handleImagesUpload(obra.id, Array.from(e.target.files))}
                        ref={el => fileInputRefs.current[obra.id] = el}
                        id={`file-upload-${obra.id}`}
                        className="file-input-hidden"
                      />
                      <label
                        htmlFor={`file-upload-${obra.id}`}
                        className={`btn-subir-imagen ${subiendoImagen === obra.id ? 'subiendo' : ''}`}
                      >
                        {subiendoImagen === obra.id ? 'Subiendo...' : 'Subir imagenes'}
                      </label>
                    </div>
                  </div>

                  <small className="recomendacion">
                    Tamano recomendado: 800x600px (ratio 4:3) - Peso max: 5MB - Formatos: JPG, PNG, WebP, AVIF. Podes subir varias a la vez.
                  </small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {obras.length === 0 && (
        <div className="obras-empty">
          <p>No hay obras destacadas. Agrega una nueva para comenzar.</p>
          <button className="btn-agregar-obra" onClick={handleAgregarObra}>
            + Agregar Primera Obra
          </button>
        </div>
      )}

      <div className="admin-actions">
        <button onClick={handleGuardar} className="btn-guardar" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="admin-info">
        <h4>Informacion</h4>
        <ul>
          <li>Podes subir varias imagenes por obra</li>
          <li>Hacé clic en una imagen para elegirla como portada (la que se muestra en el Home)</li>
          <li>La primera obra aparece mas grande en el Home</li>
          <li>Los cambios se guardan en el servidor y persisten en la nube</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminObrasDestacadas;
