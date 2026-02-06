import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../firebase/config';
import { useToast } from '../Toast';
import './Admin.css';

function AdminObras() {
  const toast = useToast();
  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  
  const [nuevaObra, setNuevaObra] = useState({
    nombre: '',
    categoria: 'Residencial',
    ubicacion: '',
    año: new Date().getFullYear(),
    descripcion: '',
    imagen: '',
    metrosCuadrados: '',
    cliente: '',
    destacada: false,
    visible: true,
    orden: 0
  });

  const categorias = ['Residencial', 'Comercial', 'Industrial', 'Reformas', 'Obra Nueva'];

  useEffect(() => {
    cargarObras();
  }, []);

  const cargarObras = async () => {
    try {
      setCargando(true);
      const obrasRef = collection(db, COLLECTIONS.OBRAS);
      const snapshot = await getDocs(obrasRef);
      
      const obrasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      obrasData.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setObras(obrasData);
    } catch (error) {
      console.error('Error al cargar obras:', error);
      toast.error('Error al cargar obras');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nuevaObra.nombre || !nuevaObra.categoria) {
      toast.warning('El nombre y categoría son obligatorios');
      return;
    }

    setGuardando(true);

    try {
      const obraData = {
        ...nuevaObra,
        metrosCuadrados: nuevaObra.metrosCuadrados ? parseFloat(nuevaObra.metrosCuadrados) : null,
        año: parseInt(nuevaObra.año)
      };

      if (editando) {
        const obraRef = doc(db, COLLECTIONS.OBRAS, editando);
        await updateDoc(obraRef, {
          ...obraData,
          fechaModificacion: serverTimestamp()
        });
        toast.success('Obra actualizada exitosamente');
      } else {
        await addDoc(collection(db, COLLECTIONS.OBRAS), {
          ...obraData,
          fechaCreacion: serverTimestamp()
        });
        toast.success('Obra creada exitosamente');
      }

      setNuevaObra({
        nombre: '',
        categoria: 'Residencial',
        ubicacion: '',
        año: new Date().getFullYear(),
        descripcion: '',
        imagen: '',
        metrosCuadrados: '',
        cliente: '',
        destacada: false,
        visible: true,
        orden: 0
      });
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
    setNuevaObra({
      nombre: obra.nombre || '',
      categoria: obra.categoria || 'Residencial',
      ubicacion: obra.ubicacion || '',
      año: obra.año || new Date().getFullYear(),
      descripcion: obra.descripcion || '',
      imagen: obra.imagen || '',
      metrosCuadrados: obra.metrosCuadrados || '',
      cliente: obra.cliente || '',
      destacada: obra.destacada || false,
      visible: obra.visible !== undefined ? obra.visible : true,
      orden: obra.orden || 0
    });
    setEditando(obra.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta obra?')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.OBRAS, id));
      toast.success('Obra eliminada');
      cargarObras();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la obra');
    }
  };

  const toggleVisibilidad = async (obra) => {
    try {
      const obraRef = doc(db, COLLECTIONS.OBRAS, obra.id);
      const nuevoEstado = !obra.visible;
      await updateDoc(obraRef, {
        visible: nuevoEstado,
        fechaModificacion: serverTimestamp()
      });
      toast.success(nuevoEstado ? 'Obra visible en el sitio' : 'Obra oculta del sitio');
      cargarObras();
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      toast.error('Error al cambiar visibilidad');
    }
  };

  const toggleDestacada = async (obra) => {
    try {
      const obraRef = doc(db, COLLECTIONS.OBRAS, obra.id);
      const nuevoEstado = !obra.destacada;
      await updateDoc(obraRef, {
        destacada: nuevoEstado,
        fechaModificacion: serverTimestamp()
      });
      toast.success(nuevoEstado ? 'Obra destacada' : 'Obra no destacada');
      cargarObras();
    } catch (error) {
      console.error('Error al cambiar destacada:', error);
      toast.error('Error al cambiar destacada');
    }
  };

  const handleCancelar = () => {
    setNuevaObra({
      nombre: '',
      categoria: 'Residencial',
      ubicacion: '',
      año: new Date().getFullYear(),
      descripcion: '',
      imagen: '',
      metrosCuadrados: '',
      cliente: '',
      destacada: false,
      visible: true,
      orden: 0
    });
    setEditando(null);
  };

  if (cargando) {
    return <div className="admin-loading">Cargando obras...</div>;
  }

  return (
    <div className="admin-section">
      <h2>{editando ? '✏️ Editar Obra' : '➕ Nueva Obra'}</h2>
      
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
            <label>Categoría *</label>
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
            <label>Ubicación</label>
            <input
              type="text"
              value={nuevaObra.ubicacion}
              onChange={(e) => setNuevaObra({ ...nuevaObra, ubicacion: e.target.value })}
              placeholder="Ej: Buenos Aires, Argentina"
            />
          </div>

          <div className="form-group">
            <label>Año</label>
            <input
              type="number"
              value={nuevaObra.año}
              onChange={(e) => setNuevaObra({ ...nuevaObra, año: e.target.value })}
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
              value={nuevaObra.metrosCuadrados}
              onChange={(e) => setNuevaObra({ ...nuevaObra, metrosCuadrados: e.target.value })}
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

        <div className="form-group">
          <label>URL de Imagen</label>
          <input
            type="text"
            value={nuevaObra.imagen}
            onChange={(e) => setNuevaObra({ ...nuevaObra, imagen: e.target.value })}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {nuevaObra.imagen && (
            <div className="image-preview">
              <img src={nuevaObra.imagen} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={nuevaObra.descripcion}
            onChange={(e) => setNuevaObra({ ...nuevaObra, descripcion: e.target.value })}
            placeholder="Descripción detallada de la obra..."
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
            <small>Número menor aparece primero</small>
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
        <h3>📋 Obras Registradas ({obras.length})</h3>
        {obras.length === 0 ? (
          <p className="empty-state">No hay obras registradas aún</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Ubicación</th>
                  <th>Año</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {obras.map(obra => (
                  <tr key={obra.id} className={!obra.visible ? 'oculta' : ''}>
                    <td>
                      {obra.imagen && (
                        <img src={obra.imagen} alt={obra.nombre} className="thumbnail" />
                      )}
                    </td>
                    <td>
                      <strong>{obra.nombre}</strong>
                      {obra.destacada && <span className="badge-destacada">⭐ Destacada</span>}
                    </td>
                    <td>{obra.categoria}</td>
                    <td>{obra.ubicacion || '-'}</td>
                    <td>{obra.año}</td>
                    <td>
                      <button
                        className={`btn-toggle ${obra.visible ? 'visible' : 'oculta'}`}
                        onClick={() => toggleVisibilidad(obra)}
                      >
                        {obra.visible ? '👁️ Visible' : '🚫 Oculta'}
                      </button>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-star"
                        onClick={() => toggleDestacada(obra)}
                        title={obra.destacada ? 'Quitar de destacadas' : 'Marcar como destacada'}
                      >
                        {obra.destacada ? '⭐' : '☆'}
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEditar(obra)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleEliminar(obra.id)}
                      >
                        🗑️
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
