import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../firebase/config';

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

function AdminMensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    cargarMensajes();
  }, []);

  const cargarMensajes = async () => {
    setCargando(true);
    try {
      const q = query(collection(db, COLLECTIONS.CONTACTO), orderBy('fechaEnvio', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMensajes(data);
    } catch (err) {
      // Fallback sin ordenamiento si no existe el índice aún
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.CONTACTO));
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setMensajes(data);
      } catch (err2) {
        console.error('Error cargando mensajes:', err2);
      }
    } finally {
      setCargando(false);
    }
  };

  const marcarLeido = async (id) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.CONTACTO, id), { leido: true });
      setMensajes(prev => prev.map(m => m.id === id ? { ...m, leido: true } : m));
    } catch (err) {
      console.error('Error al marcar como leído:', err);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.CONTACTO, id));
      setMensajes(prev => prev.filter(m => m.id !== id));
      if (seleccionado?.id === id) setSeleccionado(null);
    } catch (err) {
      console.error('Error al eliminar mensaje:', err);
    }
  };

  const handleSelect = (m) => {
    setSeleccionado(m);
    if (!m.leido) marcarLeido(m.id);
  };

  const formatFecha = (ts) => {
    if (!ts?.toDate) return '—';
    return ts.toDate().toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const noLeidos = mensajes.filter(m => !m.leido).length;

  return (
    <div className="adm-content-grid">

      {/* Lista */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <p className="adm-card-title">Mensajes de Contacto</p>
            <p className="adm-card-subtitle">
              {mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''}
              {noLeidos > 0 && <span className="adm-badge adm-badge-accent" style={{ marginLeft: '0.5rem' }}>{noLeidos} nuevo{noLeidos !== 1 ? 's' : ''}</span>}
            </p>
          </div>
        </div>
        <div className="adm-card-body">
          {cargando ? (
            <div className="adm-empty-state"><p>Cargando mensajes...</p></div>
          ) : mensajes.length === 0 ? (
            <div className="adm-empty-state">
              <p>No hay mensajes aún. Cuando alguien complete el formulario de contacto, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="adm-list">
              {mensajes.map(m => (
                <div
                  key={m.id}
                  className={`adm-list-item adm-list-item-accent msg-item${!m.leido ? ' msg-unread' : ''}${seleccionado?.id === m.id ? ' msg-selected' : ''}`}
                  onClick={() => handleSelect(m)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="adm-list-item-info">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {m.nombre}
                      {!m.leido && <span className="adm-badge adm-badge-accent" style={{ fontSize: '0.625rem' }}>Nuevo</span>}
                    </h3>
                    <p>{m.email}{m.empresa ? ` · ${m.empresa}` : ''}</p>
                    <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '2px' }}>{formatFecha(m.fechaEnvio)}</p>
                  </div>
                  <div className="adm-list-item-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="adm-btn adm-btn-icon danger"
                      onClick={() => eliminar(m.id)}
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
            <p className="adm-card-title">{seleccionado ? 'Detalle del Mensaje' : 'Bandeja de Entrada'}</p>
            <p className="adm-card-subtitle">
              {seleccionado ? `De: ${seleccionado.nombre}` : 'Seleccioná un mensaje para ver su contenido'}
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
              {seleccionado.empresa && (
                <div className="msg-field">
                  <span className="msg-label">Empresa</span>
                  <span className="msg-value">{seleccionado.empresa}</span>
                </div>
              )}
              <div className="msg-field">
                <span className="msg-label">Fecha</span>
                <span className="msg-value">{formatFecha(seleccionado.fechaEnvio)}</span>
              </div>
              <div className="msg-field msg-field-full">
                <span className="msg-label">Mensaje</span>
                <p className="msg-texto">{seleccionado.mensaje}</p>
              </div>
              <a
                href={`mailto:${seleccionado.email}?subject=Re: Consulta de ${seleccionado.nombre}`}
                className="adm-btn adm-btn-primary"
                style={{ marginTop: '1.5rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center', textDecoration: 'none' }}
              >
                <IconMail />
                Responder por Email
              </a>
            </div>
          ) : (
            <div className="adm-empty-state">
              <p>Hacé clic en un mensaje de la lista para ver su contenido completo.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default AdminMensajes;
