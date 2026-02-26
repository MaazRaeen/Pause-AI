import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">⏸️</span>
          <span className="logo-text">Pause AI</span>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <a href="#docs" className="nav-link">Docs</a>
          <a href="#about" className="nav-link">About</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
