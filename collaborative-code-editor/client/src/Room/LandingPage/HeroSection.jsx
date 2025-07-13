import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className={`${styles.heroTitle} animate__animated animate__fadeInDown`}>
              Code Together in Real-Time
            </h1>
            <p className={`${styles.heroSubtitle} animate__animated animate__fadeIn animate__delay-1s`}>
              The most powerful collaborative code editor for pair programming, interviews, and teaching. No setup required.
            </p>
            <div className={`d-flex gap-3 animate__animated animate__fadeIn animate__delay-2s ${styles.heroButtons}`}>
              <a href="/HomePage" className={`btn ${styles.btnPrimary}`}>Start Coding Now</a>
              <a href="#features" className={`btn ${styles.btnOutlineLight}`}>See How It Works</a>
            </div>
          </div>
          <div className="col-lg-6 d-none d-lg-block animate__animated animate__fadeIn animate__delay-3s">
            <div className={`${styles.editorPreview} ${styles.floating}`}>
              <div className={styles.editorHeader}>
                <div className={`${styles.editorDot} ${styles.red}`}></div>
                <div className={`${styles.editorDot} ${styles.yellow}`}></div>
                <div className={`${styles.editorDot} ${styles.green}`}></div>
              </div>
              <div className={styles.editorBody}>
                <div className={styles.codeLine}>
                  <span className={styles.lineNumber}>1</span>
                  <span className={styles.codeKeyword}>function</span>{' '}
                  <span className={styles.codeFunction}>greet</span>(name) {'{'}
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.lineNumber}>2</span>
                  &nbsp;&nbsp;<span className={styles.codeKeyword}>return</span>{' '}
                  <span className={styles.codeString}>`Hello, ${'{'}name{'}'}!`</span>;
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.lineNumber}>3</span>
                  {'}'}
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.lineNumber}>4</span>
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.lineNumber}>5</span>
                  <span className={styles.codeComment}>// Real-time collaboration</span>
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.lineNumber}>6</span>
                  <span className={styles.codeKeyword}>const</span> message ={' '}
                  <span className={styles.codeFunction}>greet</span>(
                  <span className={styles.codeString}>'Team'</span>);
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.lineNumber}>7</span>
                  console.<span className={styles.codeFunction}>log</span>(message);
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
