import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🍲 Food Donation Platform</Link>
      <div className="nav-links">
        <Link to="/">Browse Food</Link>
        {user?.role === 'donor' && <Link to="/donor">My Dashboard</Link>}
        {user?.role === 'receiver' && <Link to="/my-requests">My Requests</Link>}
        {user ? (
          <>
            <span className="user-tag">{user.name} ({user.role})</span>
            <button className="btn small outline" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
