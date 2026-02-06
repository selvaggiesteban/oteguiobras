import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      {/* Sección de Redes Sociales */}
      <section className="footer-redes">
        <div className="container">
          <div className="redes-content">
            <h2>Nuestras redes</h2>
            <p>Seguinos en nuestras redes sociales para enterarte de las últimas novedades.</p>
            
            <div className="social-links">
              <a href="https://www.instagram.com/oteguiobras/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/otegui-obras/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/oteguiobrass/?mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Principal */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column footer-brand">
              <img src="/logo-fondo-blanco.jpg" alt="Otegui Obras" className="footer-logo" />
              <p className="footer-tagline">Líderes en construcción y desarrollo arquitectónico en Argentina</p>
              <div className="footer-contact-items">
                <a href="mailto:info@oteguiobras.com" className="contact-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 5l-8 5.5L2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  info@oteguiobras.com
                </a>
                <a href="tel:+5491120801145" className="contact-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2 3h3l2 5-2.5 1.5a11 11 0 005 5L11 12l5 2v3a2 2 0 01-2 2A16 16 0 012 5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  +54 9 11 2080-1145
                </a>
                <div className="contact-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2a6 6 0 00-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  Cochabamba 1355, CABA
                </div>
              </div>
            </div>

            <div className="footer-column">
              <h4>Navegación</h4>
              <ul className="footer-links">
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/obras">Proyectos</Link></li>
                <li><Link to="/equipo">Equipo</Link></li>
                <li><Link to="/contacto">Contacto</Link></li>
                <li><Link to="/trabaja-con-nosotros">Carreras</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Servicios</h4>
              <ul className="footer-links">
                <li><a href="#obras">Construcción Industrial</a></li>
                <li><a href="#obras">Proyectos Institucionales</a></li>
                <li><a href="#obras">Obras Gastronómicas</a></li>
                <li><a href="#obras">Desarrollos Inmobiliarios</a></li>
                <li><a href="#obras">Proyectos Hospitalarios</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><a href="#privacidad">Política de Privacidad</a></li>
                <li><a href="#terminos">Términos y Condiciones</a></li>
                <li><Link to="/admin">Panel Administrativo</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {new Date().getFullYear()} Otegui Obras SRL | Todos los derechos reservados</p>
            <p className="footer-credits">
              Sitio web desarrollado por <a href="https://techdi.com.ar" target="_blank" rel="noopener noreferrer" className="techdi-link">techdi.com.ar</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
