import { useState, useEffect } from 'react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import { getFaqConfig } from '../../api/config';
import './FAQ.css';

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);

  // Scroll reveal hooks
  const [headerRef, headerClass] = useScrollReveal('up');
  const [listRef, listRevealed] = useStaggerReveal({ threshold: 0.08 });

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    try {
      const data = await getFaqConfig();
      setFaqs(data.preguntas || []);
    } catch (error) {
      console.error('Error cargando FAQ:', error);
    }
  };

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (faqs.length === 0) return null;

  return (
    <section className="faq-section">
      <div className="container-narrow">
        <div className={`faq-header ${headerClass}`} ref={headerRef}>
          <span className="section-badge">Preguntas Frecuentes</span>
          <h2>¿Tenés dudas?</h2>
          <p>Respondemos las consultas más comunes sobre nuestros servicios y procesos de trabajo</p>
        </div>

        <div className={`faq-list stagger-children ${listRevealed ? 'revealed' : ''}`} ref={listRef}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
              >
                <span>{faq.pregunta}</span>
                <svg 
                  className="faq-icon" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path 
                    d="M6 9l6 6 6-6" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="faq-answer">
                <p>{faq.respuesta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
