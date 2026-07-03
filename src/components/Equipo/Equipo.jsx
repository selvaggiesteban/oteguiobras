import { useState, useEffect } from 'react';
import { getEquipo } from '../../api/equipo';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import './Equipo.css';

function Equipo() {
  const [heroRef, heroClass] = useScrollReveal('up');
  const [introRef, introClass] = useScrollReveal('up');
  const [gridRef, gridRevealed] = useStaggerReveal({ threshold: 0.08 });
  const [equipo, setEquipo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cargarEquipo = async () => {
      try {
        const datos = await getEquipo();
        const visible = datos.filter(m => m.visible !== false);
        setEquipo(visible);
      } catch (error) {
        setError(true);
      } finally {
        setCargando(false);
      }
    };
    cargarEquipo();

    const handleEquipoUpdate = () => cargarEquipo();
    window.addEventListener('equipoUpdated', handleEquipoUpdate);
    return () => window.removeEventListener('equipoUpdated', handleEquipoUpdate);
  }, []);

  return (
    <div className="equipo-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero-background" style={{ backgroundImage: `url(/equipo.jpeg)` }}>
          <div className="page-hero-overlay"></div>
        </div>
        <div className="container">
          <div className={`page-hero-content ${heroClass}`} ref={heroRef}>
            <span className="page-badge">Equipo</span>
            <h1>Profesionales que construyen excelencia</h1>
            <p>
              Más de 22 años de experiencia en construcción corporativa respaldan cada proyecto.
              Nuestro equipo combina expertise técnico con compromiso absoluto a la calidad.
            </p>
          </div>
        </div>
      </section>

      {/* Equipo Grid */}
      <section className="equipo-section">
        <div className="container">
          <div className={`section-intro ${introClass}`} ref={introRef}>
            <h2>Conoce a nuestros líderes</h2>
            <p>
              Arquitectos, ingenieros y maestros mayores de obra certificados,
              todos comprometidos con entregar obras excepcionales.
            </p>
          </div>

          {cargando ? (
            <div className="equipo-loading">Cargando equipo...</div>
          ) : error ? (
            <div className="equipo-empty">
              <p>Hubo un problema al cargar el equipo.</p>
              <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', cursor: 'pointer', background: 'none', border: '1px solid currentColor', padding: '0.5rem 1.5rem', borderRadius: '4px', color: 'inherit' }}>Reintentar</button>
            </div>
          ) : equipo.length === 0 ? (
            <div className="equipo-empty">Próximamente conocerás a nuestro equipo.</div>
          ) : (
            <div className={`equipo-grid stagger-scale ${gridRevealed ? 'revealed' : ''}`} ref={gridRef}>
              {equipo.map((miembro) => (
                <article key={miembro.id} className="miembro-card">
                  <div className="miembro-image-wrapper">
                    <img
                      src={miembro.foto}
                      alt={miembro.nombre}
                      className="miembro-image"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                    />
                    <div className="miembro-overlay"></div>
                  </div>
                  <div className="miembro-content">
                    <h3 className="miembro-nombre">{miembro.nombre}</h3>
                    <p className="miembro-cargo">{miembro.cargo}</p>
                    <p className="miembro-especialidad">{miembro.especialidad}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Equipo;
