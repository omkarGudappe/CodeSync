import { useEffect } from 'react';
import CTASection from './CTASection';
import Footer from './Footer';
import HeroSection from './HeroSection';
import LanguagesSection from './LanguagesSection';
import FeaturesSection from './FeaturesSection';
import Navbar from './Navbar';
import TestimonialsSection from './TestimonialsSection';
import UseCasesSection from './UseCasesSection';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  useEffect(() => {
    // Simple animation trigger on scroll
    const animateElements = document.querySelectorAll('.animate__animated');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const animation = entry.target.getAttribute('data-animation');
          entry.target.classList.add(animation);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    animateElements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      animateElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className={styles.landingPage}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <UseCasesSection />
      <LanguagesSection />
      {/* <TestimonialsSection /> */}
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;