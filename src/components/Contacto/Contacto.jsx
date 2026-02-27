import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../firebase/config';
import { useToast } from '../Toast';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import './Contacto.css';

function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Scroll reveal hooks
  const [heroRef, heroClass] = useScrollReveal('up');
  const [sidebarRef, sidebarRevealed] = useStaggerReveal({ threshold: 0.1 });
  const [formRef, formClass] = useScrollReveal('right', { threshold: 0.1 });

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'Ingresá un nombre válido';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresá un email válido';
    }
    if (!formData.mensaje.trim() || formData.mensaje.trim().length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, COLLECTIONS.CONTACTO), {
        ...formData,
        leido: false,
        fechaEnvio: serverTimestamp()
      });
      toast.success('¡Mensaje enviado! Te responderemos en breve.');
      setFormData({ nombre: '', email: '', telefono: '', empresa: '', mensaje: '' });
      setErrors({});
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      toast.error('Hubo un error al enviar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contacto-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero-background" style={{ backgroundImage: `url(/IMG-20251226-WA0076.jpg)` }}>
          <div className="page-hero-overlay"></div>
        </div>
        <div className="container">
          <div className={`page-hero-content ${heroClass}`} ref={heroRef}>
            <span className="page-badge">Contacto</span>
            <h1>Hablemos de tu proyecto</h1>
            <p>
              Estamos listos para transformar tu visión en realidad.
              Contáctanos y recibí una consultoría profesional sin compromiso.
            </p>
          </div>
        </div>
      </section>

      {/* Contacto Content */}
      <section className="contacto-section">
        <div className="container">
          <div className="contacto-layout">
            {/* Info Cards */}
            <div className="contacto-sidebar">
              <div className={`info-cards stagger-children ${sidebarRevealed ? 'revealed' : ''}`} ref={sidebarRef}>
                <div className="info-card">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Oficina Principal</h3>
                    <p>Cochabamba 1355</p>
                    <p>C1150AAB, Buenos Aires</p>
                    <p>CABA, Argentina</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Teléfono</h3>
                    <p><a href="tel:2080-1145">2080-1145</a></p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Email</h3>
                    <p><a href="mailto:oficina@oteguiobras.com">oficina@oteguiobras.com</a></p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Horario de Atención</h3>
                    <p>Lunes a Viernes: 8:00 - 18:00</p>
                    <p>Sábados: 9:00 - 13:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className={`contacto-form-container ${formClass}`} ref={formRef}>
              <div className="form-header">
                <h2>Envianos tu consulta</h2>
                <p>Responderemos en menos de 24 horas hábiles</p>
              </div>

              <form className="contacto-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className={`form-group ${errors.nombre ? 'has-error' : ''}`}>
                    <label htmlFor="nombre">Nombre Completo *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      disabled={loading}
                    />
                    {errors.nombre && <span className="form-error">{errors.nombre}</span>}
                  </div>

                  <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="juan@empresa.com"
                      disabled={loading}
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+54 11 1234-5678"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="empresa">Empresa</label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="Nombre de tu empresa"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={`form-group ${errors.mensaje ? 'has-error' : ''}`}>
                  <label htmlFor="mensaje">Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Contános sobre tu proyecto..."
                    disabled={loading}
                  ></textarea>
                  {errors.mensaje && <span className="form-error">{errors.mensaje}</span>}
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Consulta
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

export default Contacto;
