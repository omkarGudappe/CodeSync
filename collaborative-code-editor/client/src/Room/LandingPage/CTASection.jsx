import styles from './CTASection.module.css';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className={`${styles.section} section`}>
      <div className="container">
        <div className={`${styles.ctaSection} animate__animated animate__fadeIn`}>
          <div className={styles.ctaContent}>
            <h2 className="mb-4">Ready to Code Together?</h2>
            <p className={`lead mb-5 ${styles.ctaSubtitle}`}>
              Develop, collaborate, and run code together — all in real-time with CodeSync.
            </p>
            <div className={styles.ctaButtons}>
             <Link to="/editor" className={`btn ${styles.btnPrimary} btn-lg me-3`}>
                Get Started for Free
              </Link>
              <a href="#features" className={`btn ${styles.btnOutlineLight} btn-lg`}>See Features</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;