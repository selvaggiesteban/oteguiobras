import { useState, useEffect, useRef } from 'react';
import { getHomeConfig, updateHomeConfig, uploadConfigImage } from '../../api/config';
import { useToast } from '../Toast';
import { useUnsavedWarning } from '../../hooks/useUnsavedWarning';
import './AdminHome.css';

function AdminHome() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [subiendoVideo, setSubiendoVideo] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const videoInputRef = useRef(null);
  const markSaved = useUnsavedWarning(hasChanges);

  useEffect(() => {
    const cargarConfig = async () => {
      setCargando(true);
      try {
        const data = await getHomeConfig();
        setConfig(data);
      } catch (err) {
        console.error('Error cargando configuración:', err);
        toast.error('Error al cargar la configuración.');
      } finally {
        setCargando(false);
      }
    };
    cargarConfig();
  }, []);

  const handleInputChange = (seccion, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
    setHasChanges(true);
  };

  const handleMetricaChange = (metrica, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      metricas: {
        ...prev.metricas,
        [metrica]: {
          ...prev.metricas[metrica],
          [campo]: campo === 'valor' ? (isNaN(Number(valor)) ? valor : Number(valor)) : valor
        }
      }
    }));
    setHasChanges(true);
  };

  const handleHeroVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoVideo(true);
    try {
      const result = await uploadConfigImage(file, 'video');
      setConfig(prev => ({ ...prev, hero: { ...prev.hero, heroVideoUrl: result.url } }));
      setHasChanges(true);
      toast.success('Video subido. Guardá los cambios para aplicar.');
    } catch (err) {
      console.error('Error subiendo video:', err);
      toast.error('Error al subir el video.');
    } finally {
      setSubiendoVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleRemoveHeroVideo = () => {
    if (!window.confirm('¿Eliminar el video del hero?')) return;
    setConfig(prev => ({ ...prev, hero: { ...prev.hero, heroVideoUrl: '' } }));
    setHasChanges(true);
    toast.success('Video eliminado. Guardá los cambios.');
  };

  const handleHeroFieldChange = (campo, valor) => {
    setConfig(prev => ({
      ...prev,
      hero: { ...prev.hero, [campo]: valor }
    }));
    setHasChanges(true);
  };

  const POSICIONES = [
    { value: 'centro',          label: 'Centro' },
    { value: 'centro-arriba',   label: 'Centro Arriba' },
    { value: 'centro-abajo',    label: 'Centro Abajo' },
    { value: 'izquierda',       label: 'Izquierda' },
    { value: 'izquierda-abajo', label: 'Izquierda Abajo' },
    { value: 'derecha',         label: 'Derecha' },
    { value: 'derecha-abajo',   label: 'Derecha Abajo' },
  ];

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await updateHomeConfig(config);
      setHasChanges(false);
      markSaved();
      toast.success('Cambios guardados en el servidor.');
    } catch (error) {
      toast.error('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="admin-home">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="admin-home">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No se pudo cargar la configuración.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-home-header">
        <div>
          <h2>Configuración del Home</h2>
          <p className="admin-subtitle">Gestiona el contenido del hero y las métricas</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-guardar"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="admin-section">
        <h3>Hero Principal — Video de Fondo</h3>

        {/* Video */}
        <div className="form-group">
          <label>Video del Hero</label>
          {config.hero?.heroVideoUrl && (
            <div className="hero-video-preview" style={{ marginBottom: '12px' }}>
              <video src={config.hero.heroVideoUrl} muted loop autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
              <button type="button" className="btn-remove-image" onClick={handleRemoveHeroVideo} title="Eliminar video" style={{ marginLeft: '8px' }}>✕ Quitar video</button>
            </div>
          )}
          <button
            type="button"
            className="btn-upload-hero"
            onClick={() => videoInputRef.current?.click()}
            disabled={subiendoVideo}
          >
            {subiendoVideo ? (
              <>
                <span className="upload-spinner"></span>
                Subiendo video...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                {config.hero?.heroVideoUrl ? 'Cambiar video' : 'Subir video'}
              </>
            )}
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleHeroVideoUpload}
            style={{ display: 'none' }}
          />
          <small>MP4 recomendado. Se reproducirá en loop sin sonido.</small>
        </div>

        {/* Texto del Hero */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'block' }}>Texto del Hero</label>
          <div className="hero-slide-fields">
            <div className="hero-slide-field-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Título</label>
                <input
                  type="text"
                  value={config.hero?.titulo || ''}
                  onChange={(e) => handleHeroFieldChange('titulo', e.target.value)}
                  placeholder="Título principal"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Texto destacado</label>
                <input
                  type="text"
                  value={config.hero?.tituloDestacado || ''}
                  onChange={(e) => handleHeroFieldChange('tituloDestacado', e.target.value)}
                  placeholder="Texto resaltado"
                />
              </div>
            </div>
            <div className="hero-slide-field-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Subtítulo</label>
                <input
                  type="text"
                  value={config.hero?.subtitulo || ''}
                  onChange={(e) => handleHeroFieldChange('subtitulo', e.target.value)}
                  placeholder="Descripción breve"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Posición del texto</label>
                <select
                  value={config.hero?.posicion || 'centro'}
                  onChange={(e) => handleHeroFieldChange('posicion', e.target.value)}
                >
                  {POSICIONES.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="hero-slide-field-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Color del texto</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={config.hero?.colorTexto || '#ffffff'}
                    onChange={(e) => handleHeroFieldChange('colorTexto', e.target.value)}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={config.hero?.colorTexto || '#ffffff'}
                    onChange={(e) => handleHeroFieldChange('colorTexto', e.target.value)}
                    placeholder="#ffffff"
                    className="color-text-input"
                  />
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Color del destacado</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={config.hero?.colorDestacado || '#e8b84b'}
                    onChange={(e) => handleHeroFieldChange('colorDestacado', e.target.value)}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={config.hero?.colorDestacado || '#e8b84b'}
                    onChange={(e) => handleHeroFieldChange('colorDestacado', e.target.value)}
                    placeholder="#e8b84b"
                    className="color-text-input"
                  />
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Tamaño del título</label>
                <select
                  value={config.hero?.fontSize || 'normal'}
                  onChange={(e) => handleHeroFieldChange('fontSize', e.target.value)}
                >
                  <option value="chico">Chico</option>
                  <option value="normal">Normal</option>
                  <option value="grande">Grande</option>
                  <option value="muy-grande">Muy Grande</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas Section */}
      <section className="admin-section">
        <h3>Métricas (Contadores Animados)</h3>

        {/* Años */}
        <div className="metrica-group">
          <h4>Años de Experiencia</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Valor</label>
              <input
                type="text"
                value={config.metricas?.anos?.valor ?? ''}
                onChange={(e) => handleMetricaChange('anos', 'valor', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Unidad (se muestra grande al lado)</label>
              <input
                type="text"
                value={config.metricas?.anos?.unidad || ''}
                onChange={(e) => handleMetricaChange('anos', 'unidad', e.target.value)}
                placeholder="Ej: m², años"
              />
            </div>
            <div className="form-group">
              <label>Etiqueta (debajo)</label>
              <input
                type="text"
                value={config.metricas?.anos?.label ?? ''}
                onChange={(e) => handleMetricaChange('anos', 'label', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Metros */}
        <div className="metrica-group">
          <h4>Metros Construidos</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Valor</label>
              <input
                type="text"
                value={config.metricas?.metrosConstructidos?.valor ?? ''}
                onChange={(e) => handleMetricaChange('metrosConstructidos', 'valor', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Unidad (se muestra grande al lado)</label>
              <input
                type="text"
                value={config.metricas?.metrosConstructidos?.unidad || ''}
                onChange={(e) => handleMetricaChange('metrosConstructidos', 'unidad', e.target.value)}
                placeholder="Ej: m², años"
              />
            </div>
            <div className="form-group">
              <label>Etiqueta (debajo)</label>
              <input
                type="text"
                value={config.metricas?.metrosConstructidos?.label ?? ''}
                onChange={(e) => handleMetricaChange('metrosConstructidos', 'label', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Obras */}
        <div className="metrica-group">
          <h4>Obras Realizadas</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Valor</label>
              <input
                type="text"
                value={config.metricas?.proyectos?.valor ?? ''}
                onChange={(e) => handleMetricaChange('proyectos', 'valor', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Unidad (se muestra grande al lado)</label>
              <input
                type="text"
                value={config.metricas?.proyectos?.unidad || ''}
                onChange={(e) => handleMetricaChange('proyectos', 'unidad', e.target.value)}
                placeholder="Ej: m², años"
              />
            </div>
            <div className="form-group">
              <label>Etiqueta (debajo)</label>
              <input
                type="text"
                value={config.metricas?.proyectos?.label ?? ''}
                onChange={(e) => handleMetricaChange('proyectos', 'label', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Preview de Métricas */}
        <div className="preview-metricas">
          <div className="preview-metric">
            <div className="preview-metric-value">+{config.metricas?.anos?.valor ?? ''}{config.metricas?.anos?.unidad ? ` ${config.metricas.anos.unidad}` : ''}</div>
            <div className="preview-metric-label">{config.metricas?.anos?.label ?? ''}</div>
          </div>
          <div className="preview-metric">
            <div className="preview-metric-value">+{typeof config.metricas?.metrosConstructidos?.valor === 'number' ? config.metricas.metrosConstructidos.valor.toLocaleString() : (config.metricas?.metrosConstructidos?.valor ?? '')}{config.metricas?.metrosConstructidos?.unidad ? ` ${config.metricas.metrosConstructidos.unidad}` : ''}</div>
            <div className="preview-metric-label">{config.metricas?.metrosConstructidos?.label ?? ''}</div>
          </div>
          <div className="preview-metric">
            <div className="preview-metric-value">+{config.metricas?.proyectos?.valor ?? ''}{config.metricas?.proyectos?.unidad ? ` ${config.metricas.proyectos.unidad}` : ''}</div>
            <div className="preview-metric-label">{config.metricas?.proyectos?.label ?? ''}</div>
          </div>
        </div>
      </section>

      <div className="admin-footer-actions">
        <button
          className="btn-guardar-grande"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar Todos los Cambios'}
        </button>
        <p className="info-guardar">
          Los cambios se guardan en el servidor y se aplican instantáneamente
        </p>
      </div>
    </div>
  );
}

export default AdminHome;
