import { useState } from 'react';
import { obrasData, agregarObra, editarObra, eliminarObra } from '../../data/obrasData';
import { equipoData, agregarMiembro, editarMiembro, eliminarMiembro } from '../../data/equipoData';
import AdminHome from './AdminHome';
import AdminObrasDestacadas from './AdminObrasDestacadas';
import AdminClientes from './AdminClientes';
import AdminFAQ from './AdminFAQ';
import './Admin.css';

function Admin() {
  const [seccionActiva, setSeccionActiva] = useState('home');
  const [modoEdicion, setModoEdicion] = useState(null); // null, 'nueva', o ID
  
  // Estado para formulario de obra
  const [formObra, setFormObra] = useState({
    nombre: '',
    categoria: '',
    ubicacion: '',
    año: new Date().getFullYear(),
    descripcion: '',
    imagen: '',
    metrosCuadrados: '',
    cliente: '',
    destacada: false
  });

  // Estado para formulario de miembro
  const [formMiembro, setFormMiembro] = useState({
    nombre: '',
    cargo: '',
    especialidad: '',
    email: '',
    telefono: '',
    foto: '',
    linkedin: '',
    descripcion: '',
    destacado: false
  });

  const handleChangeObra = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormObra({ ...formObra, [e.target.name]: value });
  };

  const handleChangeMiembro = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormMiembro({ ...formMiembro, [e.target.name]: value });
  };

  const handleSubmitObra = (e) => {
    e.preventDefault();
    if (modoEdicion === 'nueva') {
      agregarObra(formObra);
      alert('Obra agregada exitosamente');
    } else if (typeof modoEdicion === 'number') {
      editarObra(modoEdicion, formObra);
      alert('Obra actualizada exitosamente');
    }
    resetFormObra();
  };

  const handleSubmitMiembro = (e) => {
    e.preventDefault();
    if (modoEdicion === 'nueva') {
      agregarMiembro(formMiembro);
      alert('Miembro agregado exitosamente');
    } else if (typeof modoEdicion === 'number') {
      editarMiembro(modoEdicion, formMiembro);
      alert('Miembro actualizado exitosamente');
    }
    resetFormMiembro();
  };

  const resetFormObra = () => {
    setFormObra({
      nombre: '',
      categoria: '',
      ubicacion: '',
      año: new Date().getFullYear(),
      descripcion: '',
      imagen: '',
      metrosCuadrados: '',
      cliente: '',
      destacada: false
    });
    setModoEdicion(null);
  };

  const resetFormMiembro = () => {
    setFormMiembro({
      nombre: '',
      cargo: '',
      especialidad: '',
      email: '',
      telefono: '',
      foto: '',
      linkedin: '',
      descripcion: '',
      destacado: false
    });
    setModoEdicion(null);
  };

  const handleEditarObra = (obra) => {
    setFormObra(obra);
    setModoEdicion(obra.id);
  };

  const handleEditarMiembro = (miembro) => {
    setFormMiembro(miembro);
    setModoEdicion(miembro.id);
  };

  const handleEliminarObra = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta obra?')) {
      eliminarObra(id);
      alert('Obra eliminada');
    }
  };

  const handleEliminarMiembro = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este miembro?')) {
      eliminarMiembro(id);
      alert('Miembro eliminado');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p>Gestión de Contenidos</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${seccionActiva === 'home' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('home')}
        >
          📱 Home
        </button>
        <button
          className={`tab ${seccionActiva === 'destacadas' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('destacadas')}
        >
          ⭐ Obras Destacadas
        </button>
        <button
          className={`tab ${seccionActiva === 'clientes' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('clientes')}
        >
          🏢 Clientes
        </button>
        <button
          className={`tab ${seccionActiva === 'faq' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('faq')}
        >
          ❓ Preguntas FAQ
        </button>
        <button
          className={`tab ${seccionActiva === 'obras' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('obras')}
        >
          🏗️ Todas las Obras
        </button>
        <button
          className={`tab ${seccionActiva === 'equipo' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('equipo')}
        >
          👥 Equipo
        </button>
      </div>

      {seccionActiva === 'home' && <AdminHome />}

      {seccionActiva === 'destacadas' && <AdminObrasDestacadas />}

      {seccionActiva === 'clientes' && <AdminClientes />}

      {seccionActiva === 'faq' && <AdminFAQ />}

      {seccionActiva === 'obras' && (
        <div className="admin-content">
          <div className="admin-form-section">
            <h2>{modoEdicion === 'nueva' ? 'Nueva Obra' : modoEdicion ? 'Editar Obra' : 'Agregar Obra'}</h2>
            {!modoEdicion && (
              <button className="btn btn-primary" onClick={() => setModoEdicion('nueva')}>
                + Nueva Obra
              </button>
            )}
            
            {modoEdicion && (
              <form onSubmit={handleSubmitObra} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input type="text" name="nombre" value={formObra.nombre} onChange={handleChangeObra} required />
                  </div>
                  <div className="form-group">
                    <label>Categoría *</label>
                    <select name="categoria" value={formObra.categoria} onChange={handleChangeObra} required>
                      <option value="">Seleccionar...</option>
                      <option value="Retail / Comercial">Retail / Comercial</option>
                      <option value="Oficinas">Oficinas</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Bancos">Bancos</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ubicación *</label>
                    <input type="text" name="ubicacion" value={formObra.ubicacion} onChange={handleChangeObra} required />
                  </div>
                  <div className="form-group">
                    <label>Año *</label>
                    <input type="number" name="año" value={formObra.año} onChange={handleChangeObra} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción *</label>
                  <textarea name="descripcion" value={formObra.descripcion} onChange={handleChangeObra} rows="3" required />
                </div>

                <div className="form-group">
                  <label>URL de Imagen *</label>
                  <input type="url" name="imagen" value={formObra.imagen} onChange={handleChangeObra} required />
                  <small>URL de la imagen principal (Unsplash, etc.)</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Metros Cuadrados</label>
                    <input type="number" name="metrosCuadrados" value={formObra.metrosCuadrados} onChange={handleChangeObra} />
                  </div>
                  <div className="form-group">
                    <label>Cliente</label>
                    <input type="text" name="cliente" value={formObra.cliente} onChange={handleChangeObra} />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" name="destacada" checked={formObra.destacada} onChange={handleChangeObra} />
                    Obra Destacada
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {modoEdicion === 'nueva' ? 'Agregar' : 'Actualizar'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetFormObra}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="admin-list-section">
            <h2>Obras Existentes ({obrasData.length})</h2>
            <div className="admin-list">
              {obrasData.map(obra => (
                <div key={obra.id} className="admin-item">
                  <div className="admin-item-info">
                    <h3>{obra.nombre}</h3>
                    <p>{obra.categoria} • {obra.ubicacion} • {obra.año}</p>
                    {obra.destacada && <span className="badge-destacado">Destacada</span>}
                  </div>
                  <div className="admin-item-actions">
                    <button className="btn-edit" onClick={() => handleEditarObra(obra)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleEliminarObra(obra.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {seccionActiva === 'equipo' && (
        <div className="admin-content">
          <div className="admin-form-section">
            <h2>{modoEdicion === 'nueva' ? 'Nuevo Miembro' : modoEdicion ? 'Editar Miembro' : 'Agregar Miembro'}</h2>
            {!modoEdicion && (
              <button className="btn btn-primary" onClick={() => setModoEdicion('nueva')}>
                + Nuevo Miembro
              </button>
            )}
            
            {modoEdicion && (
              <form onSubmit={handleSubmitMiembro} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input type="text" name="nombre" value={formMiembro.nombre} onChange={handleChangeMiembro} required />
                  </div>
                  <div className="form-group">
                    <label>Cargo *</label>
                    <input type="text" name="cargo" value={formMiembro.cargo} onChange={handleChangeMiembro} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Especialidad *</label>
                  <input type="text" name="especialidad" value={formMiembro.especialidad} onChange={handleChangeMiembro} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={formMiembro.email} onChange={handleChangeMiembro} required />
                  </div>
                  <div className="form-group">
                    <label>Teléfono *</label>
                    <input type="tel" name="telefono" value={formMiembro.telefono} onChange={handleChangeMiembro} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>URL de Foto *</label>
                  <input type="url" name="foto" value={formMiembro.foto} onChange={handleChangeMiembro} required />
                  <small>URL de la foto (Unsplash, etc.)</small>
                </div>

                <div className="form-group">
                  <label>LinkedIn</label>
                  <input type="url" name="linkedin" value={formMiembro.linkedin} onChange={handleChangeMiembro} />
                </div>

                <div className="form-group">
                  <label>Descripción *</label>
                  <textarea name="descripcion" value={formMiembro.descripcion} onChange={handleChangeMiembro} rows="3" required />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" name="destacado" checked={formMiembro.destacado} onChange={handleChangeMiembro} />
                    Miembro Destacado
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {modoEdicion === 'nueva' ? 'Agregar' : 'Actualizar'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetFormMiembro}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="admin-list-section">
            <h2>Miembros del Equipo ({equipoData.length})</h2>
            <div className="admin-list">
              {equipoData.map(miembro => (
                <div key={miembro.id} className="admin-item">
                  <div className="admin-item-info">
                    <h3>{miembro.nombre}</h3>
                    <p>{miembro.cargo} • {miembro.especialidad}</p>
                    {miembro.destacado && <span className="badge-destacado">Destacado</span>}
                  </div>
                  <div className="admin-item-actions">
                    <button className="btn-edit" onClick={() => handleEditarMiembro(miembro)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleEliminarMiembro(miembro.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
