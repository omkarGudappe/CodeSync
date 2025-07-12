import styles from './UseCasesSection.module.css';

const UseCasesSection = () => {
  const useCases = [
    {
      icon: 'fas fa-user-friends',
      title: 'Pair Programming',
      description: 'Work on code together in real-time, whether you\'re in the same room or across the world.'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Teaching & Learning',
      description: 'Perfect for coding bootcamps, university courses, or one-on-one tutoring sessions.'
    },
    {
      icon: 'fas fa-briefcase',
      title: 'Technical Interviews',
      description: 'Conduct coding interviews with candidates in a realistic coding environment.'
    }
  ];

  return (
    <section className={`${styles.section} ${styles.bgDark} section`}>
      <div className="container">
        <h2 className={`${styles.sectionTitle} section-title text-center animate__animated animate__fadeIn`}>
          Perfect For
        </h2>
        <div className="row g-4">
          {useCases.map((useCase, index) => (
            <div key={index} className="col-md-4">
              <div className={`${styles.featureCard} animate__animated ${
                index === 0 ? 'animate__fadeInLeft' : 
                index === 1 ? 'animate__fadeInUp' : 
                'animate__fadeInRight'
              }`}>
                <div className={styles.featureIcon}>
                  <i className={useCase.icon}></i>
                </div>
                <h3 className={styles.featureTitle}>{useCase.title}</h3>
                <p className={styles.featureDesc}>{useCase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;