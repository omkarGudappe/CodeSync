import styles from './LanguagesSection.module.css';

const LanguagesSection = () => {
  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 
    'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Dart', 'SQL', 'HTML/CSS'
  ];

  return (
    <section id="languages" className={`${styles.section} section my-3`}>
      <div className="container">
        <h2 className={`${styles.sectionTitle} section-title text-center animate__animated animate__fadeIn`}>
          Supported Languages
        </h2>
        <div className={`text-center mb-5 animate__animated animate__fadeIn ${styles.languagesContainer}`}>
          {languages.map((language, index) => (
            <span key={index} className={styles.languageBadge}>{language}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LanguagesSection;