import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fireStarRain } from './StarRain';

export function NavBar() {
  const { user, logout, isEditor } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = () => {
    fireStarRain();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-logo">ORBIT</div>
        <ul className="nav-links">
          <li>
            <NavLink to="/retro" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'active' : '')}>
              Retrospective
            </NavLink>
          </li>
          <li>
            <NavLink to="/planning" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'active' : '')}>
              Planning
            </NavLink>
          </li>
        </ul>
        <div className="nav-user">
          <span>{user?.displayName}</span>
          <span className={`role-badge ${isEditor ? 'editor' : 'viewer'}`}>
            {isEditor ? 'Editor' : 'Viewer'}
          </span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="gradient-line" />
    </>
  );
}
