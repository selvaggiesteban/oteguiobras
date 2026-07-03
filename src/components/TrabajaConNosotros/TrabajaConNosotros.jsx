import { useState } from 'react';
import { enviarPostulacion } from '../../api/postulaciones';
import { useToast } from '../Toast';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import './TrabajaConNosotros.css';

function TrabajaConNosotros() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    linkedin: '',
    cv: null
  });
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();

  // Scroll reveal hooks
  const [heroRef, heroClass] = useScrollReveal('up');
  const [introRef, introClass] = useScrollReveal('up');
  const [beneficiosRef, beneficiosRevealed] = useStaggerReveal({ threshold: 0.08 });
  const [cvInfoRef, cvInfoClass] = useScrollReveal('left', { threshold: 0.1 });
  const [cvFormRef, cvFormClass] = useScrollReveal('right', { threshold: 0.1 });

  const handleChange = (e) => {
    if (e.target.name === 'cv') {
      setFormData({ ...formData, cv: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('linkedin', formData.linkedin);
      if (formData.cv) {
        formDataToSend.append('cv', formData.cv);
      }

      await enviarPostulacion(formDataToSend);

      toast.success('¡Gracias por tu interés! Revisaremos tu CV y nos contactaremos pronto.');
      setFormData({ nombre: '', email: '', telefono: '', linkedin: '', cv: null });
      const fileInput = document.getElementById('cv');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Error al enviar postulación:', err);
      toast.error('Hubo un error al enviar tu postulación. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="trabaja-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero-background" style={{ backgroundImage: `url(/IMG-20251226-WA0073.jpg)` }}>
          <div className="page-hero-overlay"></div>
        </div>
        <div className="container">
          <div className={`page-hero-content ${heroClass}`} ref={heroRef}>
            <span className="page-badge">Unite!</span>
            <h1>Unite a nuestro equipo</h1>
            <p>
              Sumáte a un equipo líder en la industria de la construcción corporativa.
              Buscamos profesionales apasionados que quieran crecer y dejar su huella.
            </p>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="beneficios-section">
        <div className="container">
          <div className={`section-intro ${introClass}`} ref={introRef}>
            <h2>¿Por qué trabajar en Otegui?</h2>
            <p>
              Ofrecemos un ambiente profesional donde el talento y la dedicación
              son reconocidos y recompensados.
            </p>
          </div>

          <div className={`beneficios-grid stagger-scale ${beneficiosRevealed ? 'revealed' : ''}`} ref={beneficiosRef}>
            <div className="beneficio-card">
              <div className="beneficio-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 5v30M5 20h30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M20 8l-3 3 3 3 3-3-3-3zM8 20l3-3-3-3-3 3 3 3zM32 20l-3-3 3-3 3 3-3 3zM20 32l3-3-3-3-3 3 3 3z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Obras Desafiantes</h3>
              <p>Participá en obras corporativas y comerciales de gran escala y complejidad técnica.</p>
            </div>

            <div className="beneficio-card">
              <div className="beneficio-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="12" r="5" stroke="currentColor" strokeWidth="2.5"/>
                  <circle cx="12" cy="28" r="5" stroke="currentColor" strokeWidth="2.5"/>
                  <circle cx="28" cy="28" r="5" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M17 16l-3 8M23 16l3 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Equipo Experto</h3>
              <p>Aprendé de profesionales con más de 22 años de experiencia en la industria.</p>
            </div>

            <div className="beneficio-card">
              <div className="beneficio-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M10 30l10-20 10 20H10z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 15v10M15 25h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Crecimiento Continuo</h3>
              <p>Capacitación constante y oportunidades de desarrollo profesional.</p>
            </div>

            <div className="beneficio-card">
              <div className="beneficio-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M35 20c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15C5 11.716 11.716 5 20 5c8.284 0 15 6.716 15 15z" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M15 20l5 5 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Cultura de Excelencia</h3>
              <p>Ambiente colaborativo enfocado en la calidad y la innovación.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="cv-section">
        <div className="container">
          <div className="cv-layout">
            <div className={`cv-info ${cvInfoClass}`} ref={cvInfoRef}>
              <h2>Postulate ahora</h2>
              <p>
                Enviá tu CV y formá parte de un equipo que está transformando
                el skyline de Buenos Aires.
              </p>
              <div className="cv-features">
                <div className="cv-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Proceso de selección transparente</span>
                </div>
                <div className="cv-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Respuesta en 7 días hábiles</span>
                </div>
                <div className="cv-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Información confidencial</span>
                </div>
              </div>
            </div>

            <div className={`cv-form-container ${cvFormClass}`} ref={cvFormRef}>
              <form className="cv-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={enviando}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={enviando}
                    placeholder="juan@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono *</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    disabled={enviando}
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin">LinkedIn (opcional)</label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/tu-perfil"
                    disabled={enviando}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cv">CV (PDF) *</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="cv"
                      name="cv"
                      onChange={handleChange}
                      accept=".pdf"
                      required
                      disabled={enviando}
                    />
                    <label htmlFor="cv" className="file-label">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M13 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-3-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13 2v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {formData.cv ? formData.cv.name : 'Seleccionar archivo PDF'}
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={enviando}>
                  {enviando ? (
                    <>
                      <span className="btn-spinner"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Postulación
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TrabajaConNosotros;
