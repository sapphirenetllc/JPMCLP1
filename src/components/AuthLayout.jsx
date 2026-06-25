import Brand from './Brand';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, showLang = true }) {
  return (
    <div className="auth-page page-enter">
      <div className="auth-top-bar">
        <Brand />
        {showLang && (
          <a href="#" className="lang-link" lang="es" hreflang="es">Español</a>
        )}
      </div>

      {children}

      <footer className="page-footer">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/privacy">Terms of Service</Link>
        <Link to="/help">Help & Support</Link>
      </footer>
    </div>
  );
}
