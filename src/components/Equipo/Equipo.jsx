import { Link } from 'react-router-dom';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import { equipoData } from '../../data/equipoData';
import './Equipo.css';

function Equipo() {
  const [heroRef, heroClass] = useScrollReveal('up');
  const [introRef, introClass] = useScrollReveal('up');
  const [gridRef, gridRevealed] = useStaggerReveal({ threshold: 0.08 });

  return (
    <div className="equipo-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero-background" style={{ backgroundImage: `url(/IMG-20251226-WA0073.jpg)` }}>
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
              todos comprometidos con entregar proyectos excepcionales.
            </p>
          </div>

          <div className={`equipo-grid stagger-scale ${gridRevealed ? 'revealed' : ''}`} ref={gridRef}>
            {equipoData.map((miembro, index) => (
              <article key={miembro.id} className="miembro-card">
                <div className="miembro-image-wrapper">
                  <img src={miembro.foto} alt={miembro.nombre} className="miembro-image" />
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
        </div>
      </section>
    </div>
  );
}

export default Equipo;
