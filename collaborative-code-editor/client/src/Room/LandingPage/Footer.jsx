import styles from './Footer.module.css';
import LOGO from '../../Logo/CodeSync.png'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className='d-flex align-item-center justify-content-center' style={{overflow:'hidden'}}>
        <img src={LOGO} className={styles.LOGOFooter} />
      </div>
     <div className={styles.footerPadding}>
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mb-4">
            <h4 className="mb-4"><span>Code</span>Sync</h4>
            <p>
              CodeSync is a free, real-time collaborative code editor built for developers, learners, and teams. It runs in the browser — no installation, no account needed.
            </p>
          </div>

          <div className="col-lg-4 mb-4">
            <h5 className="mb-3">Coming Soon</h5>
            <p>We're working on documentation, and community support. Stay tuned!</p>
          </div>
        </div>


        <hr className={`my-4 ${styles.footerHr}`} />

        <div className="text-center">
          <p className={styles.copyright}>
            © {new Date().getFullYear()} CodeSync.
          </p>
        </div>
      </div>
     </div>
    </footer>
  );
};

export default Footer;
