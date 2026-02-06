import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../firebase/config';
import { useToast } from '../Toast';
import './Admin.css';

function AdminEquipo() {
  const toast = useToast();
  const [equipo, setEquipo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  
  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombre: '',
    cargo: '',
    especialidad: '',
    email: '',
    telefono: '',
    foto: '',
    linkedin: '',
    descripcion: '',
    destacado: false,
    visible: true,
    orden: 0
  });

  useEffect(() => {
    cargarEquipo();
  }, []);

  const cargarEquipo = async () => {
    try {
      setCargando(true);
      const equipoRef = collection(db, COLLECTIONS.EQUIPO);
      const snapshot = await getDocs(equipoRef);
      
      const equipoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      equipoData.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setEquipo(equipoData);
    } catch (error) {
      console.error('Error al cargar equipo:', error);
      toast.error('Error al cargar equipo');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nuevoMiembro.nombre || !nuevoMiembro.cargo) {
      toast.warning('El nombre y cargo son obligatorios');
      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        const miembroRef = doc(db, COLLECTIONS.EQUIPO, editando);
        await updateDoc(miembroRef, {
          ...nuevoMiembro,
          fechaModificacion: serverTimestamp()
        });
        toast.success('Miembro actualizado exitosamente');
      } else {
        await addDoc(collection(db, COLLECTIONS.EQUIPO), {
          ...nuevoMiembro,
          fechaCreacion: serverTimestamp()
        });
        toast.success('Miembro agregado exitosamente');
      }

      setNuevoMiembro({
        nombre: '',
        cargo: '',
        especialidad: '',
        email: '',
        telefono: '',
        foto: '',
        linkedin: '',
        descripcion: '',
        destacado: false,
        visible: true,
        orden: 0
      });
      setEditando(null);
      cargarEquipo();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el miembro');
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (miembro) => {
    setNuevoMiembro({
      nombre: miembro.nombre || '',
      cargo: miembro.cargo || '',
      especialidad: miembro.especialidad || '',
      email: miembro.email || '',
      telefono: miembro.telefono || '',
      foto: miembro.foto || '',
      linkedin: miembro.linkedin || '',
      descripcion: miembro.descripcion || '',
      destacado: miembro.destacado || false,
      visible: miembro.visible !== undefined ? miembro.visible : true,
      orden: miembro.orden || 0
    });
    setEditando(miembro.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este miembro?')) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.EQUIPO, id));
      toast.success('Miembro eliminado');
      cargarEquipo();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el miembro');
    }
  };

  const toggleVisibilidad = async (miembro) => {
    try {
      const miembroRef = doc(db, COLLECTIONS.EQUIPO, miembro.id);
      const nuevoEstado = !miembro.visible;
      await updateDoc(miembroRef, {
        visible: nuevoEstado,
        fechaModificacion: serverTimestamp()
      });
      toast.success(nuevoEstado ? 'Miembro visible en el sitio' : 'Miembro oculto del sitio');
      cargarEquipo();
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
      toast.error('Error al cambiar visibilidad');
    }
  };

  const handleCancelar = () => {
    setNuevoMiembro({
      nombre: '',
      cargo: '',
      especialidad: '',
      email: '',
      telefono: '',
      foto: '',
      linkedin: '',
      descripcion: '',
      destacado: false,
      visible: true,
      orden: 0
    });
    setEditando(null);
  };

  if (cargando) {
    return <div className="admin-loading">Cargando equipo...</div>;
  }

  return (
    <div className="admin-section">
      <h2>{editando ? '✏️ Editar Miembro' : '➕ Nuevo Miembro del Equipo'}</h2>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre Completo *</label>
            <input
              type="text"
              value={nuevoMiembro.nombre}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label>Cargo *</label>
            <input
              type="text"
              value={nuevoMiembro.cargo}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, cargo: e.target.value })}
              placeholder="Ej: Director de Obras"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Especialidad</label>
            <input
              type="text"
              value={nuevoMiembro.especialidad}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, especialidad: e.target.value })}
              placeholder="Ej: Construcción en altura"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={nuevoMiembro.email}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={nuevoMiembro.telefono}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, telefono: e.target.value })}
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="text"
              value={nuevoMiembro.linkedin}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>

        <div className="form-group">
          <label>URL de Foto</label>
          <input
            type="text"
            value={nuevoMiembro.foto}
            onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, foto: e.target.value })}
            placeholder="https://ejemplo.com/foto.jpg"
          />
          {nuevoMiembro.foto && (
            <div className="image-preview">
              <img src={nuevoMiembro.foto} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Descripción / Bio</label>
          <textarea
            value={nuevoMiembro.descripcion}
            onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, descripcion: e.target.value })}
            placeholder="Breve descripción del miembro del equipo..."
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Orden</label>
            <input
              type="number"
              value={nuevoMiembro.orden}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, orden: parseInt(e.target.value) })}
              min="0"
            />
            <small>Número menor aparece primero</small>
          </div>

          <div className="form-group checkboxes">
            <label>
              <input
                type="checkbox"
                checked={nuevoMiembro.destacado}
                onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, destacado: e.target.checked })}
              />
              Miembro Destacado
            </label>

            <label>
              <input
                type="checkbox"
                checked={nuevoMiembro.visible}
                onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, visible: e.target.checked })}
              />
              Visible en el sitio
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={guardando}>
            {guardando ? 'Guardando...' : (editando ? 'Actualizar Miembro' : 'Agregar Miembro')}
          </button>
          {editando && (
            <button type="button" className="btn-cancel" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="obras-list">
        <h3>👥 Equipo ({equipo.length})</h3>
        {equipo.length === 0 ? (
          <p className="empty-state">No hay miembros registrados aún</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipo.map(miembro => (
                  <tr key={miembro.id} className={!miembro.visible ? 'oculta' : ''}>
                    <td>
                      {miembro.foto && (
                        <img src={miembro.foto} alt={miembro.nombre} className="thumbnail" />
                      )}
                    </td>
                    <td>
                      <strong>{miembro.nombre}</strong>
                      {miembro.destacado && <span className="badge-destacada">⭐</span>}
                    </td>
                    <td>{miembro.cargo}</td>
                    <td>{miembro.email || '-'}</td>
                    <td>
                      <button
                        className={`btn-toggle ${miembro.visible ? 'visible' : 'oculta'}`}
                        onClick={() => toggleVisibilidad(miembro)}
                      >
                        {miembro.visible ? '👁️ Visible' : '🚫 Oculto'}
                      </button>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEditar(miembro)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleEliminar(miembro.id)}
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

export default AdminEquipo;
