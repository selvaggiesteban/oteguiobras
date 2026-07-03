import { useState, useEffect, useRef } from 'react';
import { getObras, createObra, updateObra, deleteObra, uploadObraImage } from '../../api/obras';
import { useToast } from '../Toast';
import './Admin.css';

function AdminObras() {
  const toast = useToast();
  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const fileInputRef = useRef(null);

  const defaultObra = {
    nombre: '',
    categoria: 'Retail / Comercial',
    ubicacion: '',
    anno: new Date().getFullYear(),
    descripcion: '',
    imagenes: [],
    imagen_portada: 0,
    metros_cuadrados: '',
    cliente: '',
    destacada: false,
    visible: true,
    orden: 0
  };

  const [nuevaObra, setNuevaObra] = useState(defaultObra);
  const categorias = ['Retail / Comercial', 'Oficinas', 'Industrial', 'Bancos', 'Proyecto'];

  useEffect(() => {
    cargarObras();
  }, []);

  const cargarObras = async () => {
    try {
      setCargando(true);
      const data = await getObras();
      data.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setObras(data);
    } catch (error) {
      console.error('Error al cargar obras:', error);
      toast.error('Error al cargar obras');
    } finally {
      setCargando(false);
    }
  };

  // Subir imágenes al servidor
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    for (const file of files) {
      if (!tiposPermitidos.includes(file.type)) {
        toast.error(`Formato no soportado: ${file.name}`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} supera los 5MB`);
        return;
      }
    }

    setSubiendoImagen(true);
    try {
      const nuevasUrls = [];
      for (const file of files) {
        const result = await uploadObraImage(file);
        nuevasUrls.push(result.url);
      }
      setNuevaObra(prev => ({
        ...prev,
        imagenes: [...(prev.imagenes || []), ...nuevasUrls],
        imagen_portada: prev.imagen_portada || 0
      }));
      toast.success(`${files.length} imagen(es) subida(s)`);
    } catch (error) {
      console.error('Error subiendo:', error);
      toast.error('Error al subir imagenes');
    } finally {
      setSubiendoImagen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setNuevaObra(prev => {
      const imagenes = prev.imagenes.filter((_, i) => i !== index);
      let portada = prev.imagen_portada || 0;
      if (index === portada) portada = 0;
      else if (index < portada) portada--;
      if (portada >= imagenes.length) portada = Math.max(0, imagenes.length - 1);
      return { ...prev, imagenes, imagen_portada: portada };
    });
  };

  const handleSetPortada = (index) => {
    setNuevaObra(prev => ({ ...prev, imagen_portada: index }));
  };

  const getImagenes = (obra) => {
    return obra.imagenes || [];
  };

  const getPortadaUrl = (obra) => {
    const imgs = getImagenes(obra);
    if (imgs.length === 0) return '';
    const idx = obra.imagen_portada || 0;
    return imgs[idx] || imgs[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevaObra.nombre || !nuevaObra.categoria) {
      toast.warning('El nombre y categoria son obligatorios');
      return;
    }

    setGuardando(true);
    try {
      const obraData = {
        nombre: nuevaObra.nombre,
        categoria: nuevaObra.categoria,
        ubicacion: nuevaObra.ubicacion,
        anno: parseInt(nuevaObra.anno),
        descripcion: nuevaObra.descripcion,
        imagenes: nuevaObra.imagenes || [],
        imagen_portada: nuevaObra.imagen_portada || 0,
        metros_cuadrados: nuevaObra.metros_cuadrados ? parseFloat(nuevaObra.metros_cuadrados) : null,
        cliente: nuevaObra.cliente,
        destacada: nuevaObra.destacada,
        visible: nuevaObra.visible,
        orden: nuevaObra.orden
      };

      if (editando) {
        await updateObra(editando, obraData);
        toast.success('Obra actualizada exitosamente');
      } else {
        await createObra(obraData);
        toast.success('Obra creada exitosamente');
      }

      setNuevaObra(defaultObra);
      setEditando(null);
      cargarObras();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la obra');
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (obra) => {
    const imagenes = getImagenes(obra);
    setNuevaObra({
      nombre: obra.nombre || '',
      categoria: obra.categoria || 'Retail / Comercial',
      ubicacion: obra.ubicacion || '',
      anno: obra.anno || new Date().getFullYear(),
      descripcion: obra.descripcion || '',
      imagenes,
      imagen_portada: obra.imagen_portada || 0,
      metros_cuadrados: obra.metros_cuadrados || '',
      cliente: obra.cliente || '',
      destacada: obra.destacada || false,
      visible: obra.visible !== undefined ? obra.visible : true,
      orden: obra.orden || 0
    });
    setEditando(obra.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estas seguro de eliminar esta obra?')) return;
    try {
      await deleteObra(id);
      toast.success('Obra eliminada');
      cargarObras();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la obra');
    }
  };

  const toggleVisibilidad = async (obra) => {
    try {
      const nuevoEstado = !obra.visible;
      await updateObra(obra.id, { visible: nuevoEstado });
      toast.success(nuevoEstado ? 'Obra visible en el sitio' : 'Obra oculta del sitio');
      cargarObras();
    } catch (error) {
      toast.error('Error al cambiar visibilidad');
    }
  };

  const toggleDestacada = async (obra) => {
    try {
      const nuevoEstado = !obra.destacada;
      await updateObra(obra.id, { destacada: nuevoEstado });
      toast.success(nuevoEstado ? 'Obra destacada' : 'Obra no destacada');
      cargarObras();
    } catch (error) {
      toast.error('Error al cambiar destacada');
    }
  };

  const handleCancelar = () => {
    setNuevaObra(defaultObra);
    setEditando(null);
  };

  if (cargando) {
    return <div className="admin-loading">Cargando obras...</div>;
  }

  return (
    <div className="admin-section">
      <h2>{editando ? 'Editar Obra' : 'Nueva Obra'}</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre de la Obra *</label>
            <input
              type="text"
              value={nuevaObra.nombre}
              onChange={(e) => setNuevaObra({ ...nuevaObra, nombre: e.target.value })}
              placeholder="Ej: Edificio Torre Norte"
              required
            />
          </div>
          <div className="form-group">
            <label>Categoria *</label>
            <select
              value={nuevaObra.categoria}
              onChange={(e) => setNuevaObra({ ...nuevaObra, categoria: e.target.value })}
              required
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ubicacion</label>
            <input
              type="text"
              value={nuevaObra.ubicacion}
              onChange={(e) => setNuevaObra({ ...nuevaObra, ubicacion: e.target.value })}
              placeholder="Ej: Buenos Aires, Argentina"
            />
          </div>
          <div className="form-group">
            <label>Ano</label>
            <input
              type="number"
              value={nuevaObra.anno}
              onChange={(e) => setNuevaObra({ ...nuevaObra, anno: e.target.value })}
              min="1900"
              max={new Date().getFullYear() + 5}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Metros Cuadrados</label>
            <input
              type="number"
              value={nuevaObra.metros_cuadrados}
              onChange={(e) => setNuevaObra({ ...nuevaObra, metros_cuadrados: e.target.value })}
              placeholder="Ej: 450"
            />
          </div>
          <div className="form-group">
            <label>Cliente</label>
            <input
              type="text"
              value={nuevaObra.cliente}
              onChange={(e) => setNuevaObra({ ...nuevaObra, cliente: e.target.value })}
              placeholder="Nombre del cliente (opcional)"
            />
          </div>
        </div>

        {/* Multi-imagen */}
        <div className="form-group">
          <label>Imagenes ({(nuevaObra.imagenes || []).length}) — Clic en una imagen para elegirla como portada</label>

          {(nuevaObra.imagenes || []).length > 0 && (
            <div className="imagenes-grid">
              {nuevaObra.imagenes.map((url, idx) => (
                <div
                  key={idx}
                  className={`imagen-thumb${idx === (nuevaObra.imagen_portada || 0) ? ' imagen-portada' : ''}`}
                  onClick={() => handleSetPortada(idx)}
                  title={idx === (nuevaObra.imagen_portada || 0) ? 'Imagen de portada' : 'Clic para usar como portada'}
                >
                  <img src={url} alt={`Imagen ${idx + 1}`} />
                  {idx === (nuevaObra.imagen_portada || 0) && <span className="portada-badge">Portada</span>}
                  <button
                    type="button"
                    className="btn-remove-thumb"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                    title="Eliminar imagen"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '8px' }}>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
              multiple
              onChange={(e) => handleImageUpload(Array.from(e.target.files))}
              ref={fileInputRef}
              id="obras-file-upload"
              style={{ display: 'none' }}
            />
            <label
              htmlFor="obras-file-upload"
              className="btn-subir-imagen"
              style={{ cursor: subiendoImagen ? 'wait' : 'pointer', opacity: subiendoImagen ? 0.6 : 1 }}
            >
              {subiendoImagen ? 'Subiendo...' : 'Subir imagenes'}
            </label>
          </div>
          <small>JPG, PNG, WebP, AVIF. Max 5MB por imagen. Podes subir varias a la vez.</small>
        </div>

        <div className="form-group">
          <label>Descripcion</label>
          <textarea
            value={nuevaObra.descripcion}
            onChange={(e) => setNuevaObra({ ...nuevaObra, descripcion: e.target.value })}
            placeholder="Descripcion detallada de la obra..."
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              value={nuevaObra.orden}
              onChange={(e) => setNuevaObra({ ...nuevaObra, orden: parseInt(e.target.value) })}
              min="0"
            />
            <small>Numero menor aparece primero</small>
          </div>

          <div className="form-group checkboxes">
            <label>
              <input
                type="checkbox"
                checked={nuevaObra.destacada}
                onChange={(e) => setNuevaObra({ ...nuevaObra, destacada: e.target.checked })}
              />
              Obra Destacada
            </label>
            <label>
              <input
                type="checkbox"
                checked={nuevaObra.visible}
                onChange={(e) => setNuevaObra({ ...nuevaObra, visible: e.target.checked })}
              />
              Visible en el sitio
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={guardando}>
            {guardando ? 'Guardando...' : (editando ? 'Actualizar Obra' : 'Crear Obra')}
          </button>
          {editando && (
            <button type="button" className="btn-cancel" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="obras-list">
        <h3>Obras Registradas ({obras.length})</h3>
        {obras.length === 0 ? (
          <p className="empty-state">No hay obras registradas aun</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Ubicacion</th>
                  <th>Ano</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {obras.map(obra => (
                  <tr key={obra.id} className={!obra.visible ? 'oculta' : ''}>
                    <td>
                      {getPortadaUrl(obra) && (
                        <img src={getPortadaUrl(obra)} alt={obra.nombre} className="thumbnail" />
                      )}
                      {getImagenes(obra).length > 1 && (
                        <small style={{ display: 'block', color: '#888', fontSize: '11px' }}>
                          +{getImagenes(obra).length - 1} mas
                        </small>
                      )}
                    </td>
                    <td>
                      <strong>{obra.nombre}</strong>
                      {obra.destacada && <span className="badge-destacada">Destacada</span>}
                    </td>
                    <td>{obra.categoria}</td>
                    <td>{obra.ubicacion || '-'}</td>
                    <td>{obra.anno}</td>
                    <td>
                      <button
                        className={`btn-toggle ${obra.visible ? 'visible' : 'oculta'}`}
                        onClick={() => toggleVisibilidad(obra)}
                      >
                        {obra.visible ? 'Visible' : 'Oculta'}
                      </button>
                    </td>
                    <td className="actions">
                      <button className="btn-icon btn-star" onClick={() => toggleDestacada(obra)} title={obra.destacada ? 'Quitar de destacadas' : 'Marcar como destacada'}>
                        {obra.destacada ? '★' : '☆'}
                      </button>
                      <button className="btn-icon btn-edit" onClick={() => handleEditar(obra)}>
                        ✏
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleEliminar(obra.id)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminObras;
