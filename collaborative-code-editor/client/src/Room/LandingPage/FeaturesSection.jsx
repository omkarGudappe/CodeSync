import styles from './FeaturesSection.module.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'fas fa-users',
      title: 'Real-time Collaboration',
      description: 'Code together with teammates in real-time, just like Google Docs. See code changes instantly.'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Instant Setup',
      description: 'No installations or configurations needed. Just open your browser and start coding immediately.'
    },
    {
      icon: 'fas fa-terminal',
      title: 'Built-in Terminal',
      description: 'Run your code directly in the browser with our secure, containerized execution environment.'
    },
    {
      icon: 'fas fa-code',
      title: 'Multi-language Support',
      description: 'From JavaScript to Python, C++ to Java - we support all major programming languages.'
    },
    {
      icon: 'fas fa-comments',
      title: 'Integrated Chat',
      description: 'Discuss code changes with built-in chat without leaving your editor.'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Mobile Friendly',
      description: 'Code on the go with our responsive design that works on any device.'
    }
  ];

  return (
    <section id="features" className={`${styles.section} section my-3 mb-5`}>
      <div className="container">
        <h2 className={`${styles.sectionTitle} section-title text-center animate__animated animate__fadeIn`}>
          Why Choose CodeSync?
        </h2>
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div className={`${styles.featureCard} animate__animated animate__fadeInUp ${index >= 3 ? '' : `delay-${index + 1}`}`}>
                <div className={styles.featureIcon}>
                  <i className={feature.icon}></i>
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;