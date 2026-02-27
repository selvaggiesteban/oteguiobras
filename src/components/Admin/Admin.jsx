import { useState } from 'react';
import { equipoData, agregarMiembro, editarMiembro, eliminarMiembro } from '../../data/equipoData';
import AdminHome from './AdminHome';
import AdminObras from './AdminObras';
import AdminObrasDestacadas from './AdminObrasDestacadas';
import AdminClientes from './AdminClientes';
import AdminFAQ from './AdminFAQ';
import AdminMensajes from './AdminMensajes';
import './Admin.css';

// SVG Icons
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <rect x="9" y="14" width="6" height="8"/>
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconQuestion = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconConstruction = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconInbox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const NAV_ITEMS = [
  { id: 'home',       label: 'Home',              icon: <IconHome />,         desc: 'Configuración del hero y métricas' },
  { id: 'destacadas', label: 'Obras Destacadas',   icon: <IconStar />,         desc: 'Obras que aparecen en el Home' },
  { id: 'obras',      label: 'Todas las Obras',    icon: <IconConstruction />, desc: 'Catálogo completo de proyectos' },
  { id: 'clientes',   label: 'Clientes',           icon: <IconBuilding />,     desc: 'Logos del carrusel de clientes' },
  { id: 'faq',        label: 'Preguntas FAQ',       icon: <IconQuestion />,     desc: 'Preguntas frecuentes del sitio' },
  { id: 'equipo',     label: 'Equipo',             icon: <IconUsers />,        desc: 'Miembros del equipo de trabajo' },
  { id: 'mensajes',   label: 'Mensajes',           icon: <IconInbox />,        desc: 'Consultas recibidas del formulario de contacto' },
];

function Admin() {
  const [seccionActiva, setSeccionActiva] = useState('home');
  const [modoEdicion, setModoEdicion] = useState(null);

  const [formMiembro, setFormMiembro] = useState({
    nombre: '', cargo: '', especialidad: '', email: '',
    telefono: '', foto: '', linkedin: '', descripcion: '', destacado: false
  });

  const seccionInfo = NAV_ITEMS.find(n => n.id === seccionActiva);

  const handleChangeMiembro = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormMiembro({ ...formMiembro, [e.target.name]: value });
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

  const resetFormMiembro = () => {
    setFormMiembro({ nombre: '', cargo: '', especialidad: '', email: '', telefono: '', foto: '', linkedin: '', descripcion: '', destacado: false });
    setModoEdicion(null);
  };

  const handleEditarMiembro = (miembro) => {
    setFormMiembro(miembro);
    setModoEdicion(miembro.id);
  };

  const handleEliminarMiembro = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este miembro?')) {
      eliminarMiembro(id);
      alert('Miembro eliminado');
    }
  };

  return (
    <div className="admin-shell">

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">OO</div>
          <div className="brand-text">
            <span className="brand-name">Otegui Obras</span>
            <span className="brand-sub">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Contenido</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item${seccionActiva === item.id ? ' active' : ''}`}
              onClick={() => setSeccionActiva(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-env-badge">
            <div className="sidebar-env-dot" />
            <span className="sidebar-env-text">Firebase conectado</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">

        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>{seccionInfo?.label}</h1>
            <p>{seccionInfo?.desc}</p>
          </div>
          <div className="topbar-right">
            <span className="topbar-badge">
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="currentColor"/></svg>
              Producción
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-page-content">

          {seccionActiva === 'home' && <AdminHome />}
          {seccionActiva === 'destacadas' && <AdminObrasDestacadas />}
          {seccionActiva === 'clientes' && <AdminClientes />}
          {seccionActiva === 'faq' && <AdminFAQ />}
          {seccionActiva === 'obras' && <AdminObras />}
          {seccionActiva === 'mensajes' && <AdminMensajes />}

          {seccionActiva === 'equipo' && (
            <div className="adm-content-grid">

              {/* Form */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div>
                    <p className="adm-card-title">
                      {modoEdicion === 'nueva' ? 'Nuevo Miembro' : modoEdicion ? 'Editar Miembro' : 'Miembros del Equipo'}
                    </p>
                    <p className="adm-card-subtitle">
                      {modoEdicion ? 'Completá los datos del miembro' : 'Gestioná el equipo de trabajo'}
                    </p>
                  </div>
                  {!modoEdicion && (
                    <button className="adm-btn adm-btn-primary" onClick={() => setModoEdicion('nueva')}>
                      <IconPlus /> Nuevo Miembro
                    </button>
                  )}
                </div>

                <div className="adm-card-body">
                  {modoEdicion ? (
                    <form onSubmit={handleSubmitMiembro} className="adm-form">
                      <div className="adm-form-row">
                        <div className="adm-field">
                          <label className="adm-label">Nombre Completo <span className="required">*</span></label>
                          <input className="adm-input" type="text" name="nombre" value={formMiembro.nombre} onChange={handleChangeMiembro} required placeholder="Juan Pérez" />
                        </div>
                        <div className="adm-field">
                          <label className="adm-label">Cargo <span className="required">*</span></label>
                          <input className="adm-input" type="text" name="cargo" value={formMiembro.cargo} onChange={handleChangeMiembro} required placeholder="Director de Obras" />
                        </div>
                      </div>

                      <div className="adm-field">
                        <label className="adm-label">Especialidad <span className="required">*</span></label>
                        <input className="adm-input" type="text" name="especialidad" value={formMiembro.especialidad} onChange={handleChangeMiembro} required placeholder="Construcción Civil" />
                      </div>

                      <div className="adm-form-row">
                        <div className="adm-field">
                          <label className="adm-label">Email <span className="required">*</span></label>
                          <input className="adm-input" type="email" name="email" value={formMiembro.email} onChange={handleChangeMiembro} required />
                        </div>
                        <div className="adm-field">
                          <label className="adm-label">Teléfono <span className="required">*</span></label>
                          <input className="adm-input" type="tel" name="telefono" value={formMiembro.telefono} onChange={handleChangeMiembro} required />
                        </div>
                      </div>

                      <div className="adm-field">
                        <label className="adm-label">URL de Foto <span className="required">*</span></label>
                        <input className="adm-input" type="url" name="foto" value={formMiembro.foto} onChange={handleChangeMiembro} required placeholder="https://..." />
                        <span className="adm-hint">URL directa de la imagen (Unsplash, Firebase, etc.)</span>
                      </div>

                      <div className="adm-field">
                        <label className="adm-label">LinkedIn</label>
                        <input className="adm-input" type="url" name="linkedin" value={formMiembro.linkedin} onChange={handleChangeMiembro} placeholder="https://linkedin.com/in/..." />
                      </div>

                      <div className="adm-field">
                        <label className="adm-label">Descripción <span className="required">*</span></label>
                        <textarea className="adm-textarea" name="descripcion" value={formMiembro.descripcion} onChange={handleChangeMiembro} rows="3" required placeholder="Breve descripción del miembro..." />
                      </div>

                      <div className="adm-checkbox-group">
                        <label className="adm-checkbox-label">
                          <input type="checkbox" name="destacado" checked={formMiembro.destacado} onChange={handleChangeMiembro} />
                          Marcar como miembro destacado
                        </label>
                      </div>

                      <div className="adm-form-actions">
                        <button type="submit" className="adm-btn adm-btn-primary adm-btn-lg">
                          {modoEdicion === 'nueva' ? 'Agregar Miembro' : 'Guardar Cambios'}
                        </button>
                        <button type="button" className="adm-btn adm-btn-secondary adm-btn-lg" onClick={resetFormMiembro}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="adm-empty-state">
                      <p>Seleccioná "Nuevo Miembro" para agregar uno, o hacé clic en editar en la lista.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <div>
                    <p className="adm-card-title">Miembros del Equipo</p>
                    <p className="adm-card-subtitle">{equipoData.length} miembros registrados</p>
                  </div>
                </div>
                <div className="adm-card-body">
                  <div className="adm-list">
                    {equipoData.map(miembro => (
                      <div key={miembro.id} className="adm-list-item adm-list-item-accent">
                        <div className="adm-list-item-info">
                          <h3>{miembro.nombre}</h3>
                          <p>{miembro.cargo} · {miembro.especialidad}</p>
                          {miembro.destacado && (
                            <span className="adm-badge adm-badge-accent" style={{ marginTop: '4px' }}>Destacado</span>
                          )}
                        </div>
                        <div className="adm-list-item-actions">
                          <button
                            className="adm-btn adm-btn-icon"
                            onClick={() => handleEditarMiembro(miembro)}
                            title="Editar"
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="adm-btn adm-btn-icon danger"
                            onClick={() => handleEliminarMiembro(miembro.id)}
                            title="Eliminar"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
