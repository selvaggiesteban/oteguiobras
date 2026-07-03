import { useState, useEffect, useRef } from 'react';
import { getEquipo, createMiembro, updateMiembro, deleteMiembro, uploadMiembroFoto } from '../../api/equipo';
import { useToast } from '../Toast';
import './Admin.css';

const EMPTY_FORM = { nombre: '', cargo: '', foto: '', visible: true, orden: 0 };

function AdminEquipo() {
  const toast = useToast();
  const [equipo, setEquipo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevoMiembro, setNuevoMiembro] = useState({ ...EMPTY_FORM });
  const fileInputRef = useRef(null);

  useEffect(() => { cargarEquipo(); }, []);

  const cargarEquipo = async () => {
    try {
      setCargando(true);
      const data = await getEquipo();
      setEquipo(data);
    } catch (error) {
      console.error('Error al cargar equipo:', error);
      toast.error('Error al cargar equipo');
    } finally {
      setCargando(false);
    }
  };

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoFoto(true);
    try {
      const { url } = await uploadMiembroFoto(file);
      setNuevoMiembro(prev => ({ ...prev, foto: url }));
      toast.success('Foto subida');
    } catch (err) {
      console.error('Error subiendo foto:', err);
      toast.error('Error al subir la foto');
    } finally {
      setSubiendoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoMiembro.nombre && !nuevoMiembro.cargo && !nuevoMiembro.foto) {
      toast.warning('Completá al menos un campo');
      return;
    }
    setGuardando(true);
    try {
      const data = {
        nombre: nuevoMiembro.nombre,
        cargo: nuevoMiembro.cargo,
        foto: nuevoMiembro.foto,
        visible: nuevoMiembro.visible,
        orden: editando ? nuevoMiembro.orden : equipo.length,
      };
      if (editando) {
        await updateMiembro(editando, data);
        toast.success('Miembro actualizado');
      } else {
        await createMiembro(data);
        toast.success('Miembro agregado');
      }
      setNuevoMiembro({ ...EMPTY_FORM });
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
      foto: miembro.foto || '',
      visible: miembro.visible !== undefined ? miembro.visible : true,
      orden: miembro.orden || 0,
    });
    setEditando(miembro.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (miembro) => {
    if (!confirm('¿Eliminar este miembro?')) return;
    try {
      await deleteMiembro(miembro.id);
      toast.success('Miembro eliminado');
      cargarEquipo();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el miembro');
    }
  };

  const handleCancelar = () => {
    setNuevoMiembro({ ...EMPTY_FORM });
    setEditando(null);
  };

  const handleMoverArriba = async (index) => {
    if (index === 0) return;
    try {
      const a = equipo[index - 1];
      const b = equipo[index];
      await Promise.all([
        updateMiembro(a.id, { orden: b.orden }),
        updateMiembro(b.id, { orden: a.orden }),
      ]);
      const nuevo = [...equipo];
      [nuevo[index - 1], nuevo[index]] = [nuevo[index], nuevo[index - 1]];
      nuevo[index - 1].orden = equipo[index].orden;
      nuevo[index].orden = equipo[index - 1].orden;
      setEquipo(nuevo);
      toast.success('Orden actualizado');
    } catch (error) {
      console.error('Error al reordenar:', error);
      toast.error('Error al reordenar');
    }
  };

  const handleMoverAbajo = async (index) => {
    if (index >= equipo.length - 1) return;
    try {
      const a = equipo[index];
      const b = equipo[index + 1];
      await Promise.all([
        updateMiembro(a.id, { orden: b.orden }),
        updateMiembro(b.id, { orden: a.orden }),
      ]);
      const nuevo = [...equipo];
      [nuevo[index], nuevo[index + 1]] = [nuevo[index + 1], nuevo[index]];
      nuevo[index].orden = equipo[index + 1].orden;
      nuevo[index + 1].orden = equipo[index].orden;
      setEquipo(nuevo);
      toast.success('Orden actualizado');
    } catch (error) {
      console.error('Error al reordenar:', error);
      toast.error('Error al reordenar');
    }
  };

  if (cargando) {
    return <div className="admin-loading">Cargando equipo...</div>;
  }

  return (
    <div className="admin-section">
      <h2>{editando ? 'Editar Miembro' : 'Nuevo Miembro del Equipo'}</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              value={nuevoMiembro.nombre}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="form-group">
            <label>Cargo</label>
            <input
              type="text"
              value={nuevoMiembro.cargo}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, cargo: e.target.value })}
              placeholder="Ej: Director de Obras"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Foto</label>
          {nuevoMiembro.foto && (
            <div className="image-preview" style={{ marginBottom: '8px' }}>
              <img src={nuevoMiembro.foto} alt="Preview" style={{ maxWidth: '150px', borderRadius: '8px' }} />
            </div>
          )}
          <button
            type="button"
            className="btn-upload-hero"
            onClick={() => fileInputRef.current?.click()}
            disabled={subiendoFoto}
            style={{ marginBottom: '4px' }}
          >
            {subiendoFoto ? 'Subiendo foto...' : nuevoMiembro.foto ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFotoUpload}
            style={{ display: 'none' }}
          />
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
        <h3>Equipo ({equipo.length})</h3>
        {equipo.length === 0 ? (
          <p className="empty-state">No hay miembros registrados aún</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Foto</th>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipo.map((miembro, index) => (
                  <tr key={miembro.id} className={!miembro.visible ? 'oculta' : ''}>
                    <td className="actions" style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleMoverArriba(index)}
                        disabled={index === 0}
                        title="Subir"
                      >
                        ▲
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleMoverAbajo(index)}
                        disabled={index === equipo.length - 1}
                        title="Bajar"
                      >
                        ▼
                      </button>
                    </td>
                    <td>
                      {miembro.foto && (
                        <img src={miembro.foto} alt={miembro.nombre} className="thumbnail" />
                      )}
                    </td>
                    <td><strong>{miembro.nombre}</strong></td>
                    <td>{miembro.cargo}</td>
                    <td className="actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEditar(miembro)}>
                        Editar
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleEliminar(miembro)}>
                        Eliminar
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
