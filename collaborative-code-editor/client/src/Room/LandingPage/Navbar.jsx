import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className={`${styles.navbar} navbar navbar-expand-lg fixed-top`}>
      <div className="container">
        <Link className={`${styles.navbarBrand} navbar-brand`} to="/">
          <span>Code</span>Sync
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <i className="fas fa-bars text-white"></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a href='#features' className='nav-link text-white'>Features</a>
            </li>
            <li className="nav-item">
              <a href='#languages' className='nav-link text-white'>Languages</a>
            </li>
            <li className="nav-item">
              <a href='#testimonials' className='nav-link text-white'>Testimonials</a>
            </li>
            <li className="nav-item ms-lg-2">
              <Link className={`btn ${styles.btnPrimary}`} to="/HomePage">Get Started</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;