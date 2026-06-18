import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { fireStarRain } from '../components/StarRain';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(username, password, role);
    if (ok) {
      fireStarRain();
      navigate(role === 'editor' ? '/retro' : '/retro');
    } else {
      setError('Invalid credentials. Use editor/edit123 or viewer/view123');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>ORBIT</h1>
        </div>
        <p className="login-subtitle">
          Operations, Risk, and Backlog Intelligence Tracker
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="editor or viewer"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label>Access Level</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option${role === 'editor' ? ' selected' : ''}`}
                onClick={() => { setRole('editor'); setUsername('editor'); }}
              >
                <span className="role-title">Editor</span>
                <span className="role-desc">Edit values & rearrange widgets</span>
              </button>
              <button
                type="button"
                className={`role-option${role === 'viewer' ? ' selected' : ''}`}
                onClick={() => { setRole('viewer'); setUsername('viewer'); }}
              >
                <span className="role-title">Viewer</span>
                <span className="role-desc">View only & rearrange widgets</span>
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn-primary">Launch ORBIT</button>
        </form>

        <div className="login-hint">
          Demo credentials:<br />
          Editor — username: <strong>editor</strong> / password: <strong>edit123</strong><br />
          Viewer — username: <strong>viewer</strong> / password: <strong>view123</strong>
        </div>
      </div>
    </div>
  );
}
