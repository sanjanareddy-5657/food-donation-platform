import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receiver', phone: '', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) return setError('Name, email and password are required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await api('/auth/register', { method: 'POST', body: form });
      saveSession(data);
      navigate(data.user.role === 'donor' ? '/donor' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-card">
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input placeholder="Full name" value={form.name} onChange={set('name')} />
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} />
        <input type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={set('password')} />
        <select value={form.role} onChange={set('role')}>
          <option value="receiver">I need food (Receiver / NGO)</option>
          <option value="donor">I want to donate food (Donor)</option>
        </select>
        <input placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <input placeholder="City" value={form.city} onChange={set('city')} />
        <button className="btn" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
      </form>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
