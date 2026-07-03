import { useState, useEffect } from 'react';
import { getPostulaciones, updatePostulacion, deletePostulacion } from '../../api/postulaciones';

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

function AdminPostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    cargarPostulaciones();
  }, []);

  const cargarPostulaciones = async () => {
    setCargando(true);
    try {
      const data = await getPostulaciones();
      setPostulaciones(data);
    } catch (err) {
      console.error('Error cargando postulaciones:', err);
    } finally {
      setCargando(false);
    }
  };

  const marcarLeido = async (id) => {
    try {
      await updatePostulacion(id, { leido: true });
      cargarPostulaciones();
    } catch (err) {
      console.error('Error al marcar como leído:', err);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta postulación?')) return;
    try {
      await deletePostulacion(id);
      cargarPostulaciones();
      if (seleccionado?.id === id) setSeleccionado(null);
    } catch (err) {
      console.error('Error al eliminar postulación:', err);
    }
  };

  const handleSelect = (p) => {
    setSeleccionado(p);
    if (!p.leido) marcarLeido(p.id);
  };

  const formatFecha = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const noLeidos = postulaciones.filter(p => !p.leido).length;

  return (
    <div className="adm-content-grid">

      {/* Lista */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <p className="adm-card-title">Postulaciones Recibidas</p>
            <p className="adm-card-subtitle">
              {postulaciones.length} postulación{postulaciones.length !== 1 ? 'es' : ''}
              {noLeidos > 0 && <span className="adm-badge adm-badge-accent" style={{ marginLeft: '0.5rem' }}>{noLeidos} nueva{noLeidos !== 1 ? 's' : ''}</span>}
            </p>
          </div>
        </div>
        <div className="adm-card-body">
          {cargando ? (
            <div className="adm-empty-state"><p>Cargando postulaciones...</p></div>
          ) : postulaciones.length === 0 ? (
            <div className="adm-empty-state">
              <p>No hay postulaciones aún. Cuando alguien complete el formulario de "Trabajá con nosotros", aparecerá aquí.</p>
            </div>
          ) : (
            <div className="adm-list">
              {postulaciones.map(p => (
                <div
                  key={p.id}
                  className={`adm-list-item adm-list-item-accent msg-item${!p.leido ? ' msg-unread' : ''}${seleccionado?.id === p.id ? ' msg-selected' : ''}`}
                  onClick={() => handleSelect(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="adm-list-item-info">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {p.nombre}
                      {!p.leido && <span className="adm-badge adm-badge-accent" style={{ fontSize: '0.625rem' }}>Nueva</span>}
                    </h3>
                    <p>{p.email}</p>
                    <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '2px' }}>{formatFecha(p.fecha_envio)}</p>
                  </div>
                  <div className="adm-list-item-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="adm-btn adm-btn-icon danger"
                      onClick={() => eliminar(p.id)}
                      title="Eliminar"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detalle */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <p className="adm-card-title">{seleccionado ? 'Detalle de Postulación' : 'Postulaciones'}</p>
            <p className="adm-card-subtitle">
              {seleccionado ? `De: ${seleccionado.nombre}` : 'Seleccioná una postulación para ver su contenido'}
            </p>
          </div>
        </div>
        <div className="adm-card-body">
          {seleccionado ? (
            <div className="msg-detail">
              <div className="msg-field">
                <span className="msg-label">Nombre</span>
                <span className="msg-value">{seleccionado.nombre}</span>
              </div>
              <div className="msg-field">
                <span className="msg-label">Email</span>
                <a href={`mailto:${seleccionado.email}`} className="msg-link">{seleccionado.email}</a>
              </div>
              {seleccionado.telefono && (
                <div className="msg-field">
                  <span className="msg-label">Teléfono</span>
                  <a href={`tel:${seleccionado.telefono}`} className="msg-link">{seleccionado.telefono}</a>
                </div>
              )}
              {seleccionado.linkedin && (
                <div className="msg-field">
                  <span className="msg-label">LinkedIn</span>
                  <a href={seleccionado.linkedin} target="_blank" rel="noopener noreferrer" className="msg-link">{seleccionado.linkedin}</a>
                </div>
              )}
              <div className="msg-field">
                <span className="msg-label">Fecha</span>
                <span className="msg-value">{formatFecha(seleccionado.fecha_envio)}</span>
              </div>
              {seleccionado.cv_url && (
                <div className="msg-field">
                  <span className="msg-label">CV</span>
                  <a href={seleccionado.cv_url} target="_blank" rel="noopener noreferrer" className="msg-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    Descargar CV (PDF)
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <a
                  href={`mailto:${seleccionado.email}?subject=Re: Postulación de ${seleccionado.nombre} - Otegui Obras`}
                  className="adm-btn adm-btn-primary"
                  style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none' }}
                >
                  <IconMail />
                  Responder por Email
                </a>
              </div>
            </div>
          ) : (
            <div className="adm-empty-state">
              <p>Hacé clic en una postulación de la lista para ver su contenido completo.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default AdminPostulaciones;
