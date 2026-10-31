import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Email and password are required');
    setLoading(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: form });
      saveSession(data);
      navigate(data.user.role === 'donor' ? '/donor' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fill = (email) => setForm({ email, password: 'demo123' });

  return (
    <div className="card form-card">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="muted">
        New here? <Link to="/register">Create an account</Link>
      </p>
      <p className="muted small-text">
        Demo accounts (password <b>demo123</b>):{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); fill('donor@demo.com'); }}>donor</a>{' | '}
        <a href="#" onClick={(e) => { e.preventDefault(); fill('receiver@demo.com'); }}>receiver</a>
      </p>
    </div>
  );
}
