import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogIn, Building2, Users, MapPin } from 'lucide-react';
import './Presentation.css';

// Import images
import muni1 from '../../assets/images/muni1.png';
import muni2 from '../../assets/images/muni2.png';
import muni3 from '../../assets/images/muni3.png';

const carouselData = [
  {
    image: muni1,
    title: "Innovación Municipal",
    description: "Impulsando el desarrollo tecnológico para una gestión más eficiente y transparente en beneficio de todos los ciudadanos."
  },
  {
    image: muni2,
    title: "Espacios Públicos Vivos",
    description: "Creando y manteniendo áreas verdes de calidad para el esparcimiento, deporte y la unión de nuestras familias."
  },
  {
    image: muni3,
    title: "Comunidad Activa",
    description: "Fomentando la participación ciudadana y el desarrollo económico local para construir un futuro próspero juntos."
  }
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselData.length - 1 : prev - 1));
  };

  return (
    <div className="presentation-container">
      {/* Header / Nav */}
      <header className="presentation-header">
        <div className="logo-container">
          <Building2 size={32} className="logo-icon" />
          <span className="logo-text">SIGEDOC</span>
        </div>
        <button className="login-btn" onClick={() => navigate('/login')}>
          <LogIn size={18} />
          <span>Ingresar al Sistema</span>
        </button>
      </header>

      {/* Main Hero Section with Carousel */}
      <main className="hero-section">
        <div className="carousel-container">
          {carouselData.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="slide-image-container">
                <img src={slide.image} alt={slide.title} className="slide-image" />
                <div className="slide-overlay"></div>
              </div>
              <div className="slide-content">
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-description">{slide.description}</p>
                <button className="cta-btn" onClick={() => navigate('/login')}>
                  Comenzar ahora
                </button>
              </div>
            </div>
          ))}

          {/* Carousel Controls */}
          <button className="carousel-control prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          <button className="carousel-control next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {carouselData.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Features Section */}
      {/* <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <Building2 size={24} />
          </div>
          <h3>Gestión Documental</h3>
          <p>Digitalizamos y optimizamos los procesos administrativos de la municipalidad.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <Users size={24} />
          </div>
          <h3>Atención al Ciudadano</h3>
          <p>Mejoramos los tiempos de respuesta y la calidad del servicio a los vecinos.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <MapPin size={24} />
          </div>
          <h3>Desarrollo Urbano</h3>
          <p>Planificación inteligente para una ciudad moderna, sostenible y accesible.</p>
        </div>
      </section> */}
    </div>
  );
}
