import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [filters, setFilters] = useState({ city: '', foodType: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const load = async (f = filters) => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams();
      if (f.city) qs.set('city', f.city);
      if (f.foodType) qs.set('foodType', f.foodType);
      const data = await api(`/donations?${qs.toString()}`);
      setDonations(data.donations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const requestFood = async (id) => {
    setError('');
    setInfo('');
    try {
      await api(`/donations/${id}/request`, { method: 'POST', body: { message: 'I would like to collect this food.' } });
      setInfo('Request sent! Check "My Requests" for the donor\'s response.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="hero card">
        <h1>Share surplus food. Feed someone today.</h1>
        <p>Restaurants, event hosts and individuals can post leftover food. NGOs and people in need can find it and request pickup.</p>
        <div className="row">
          <Link className="btn" to="/register">Get Started</Link>
          <Link className="btn outline" to="/login">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Available Food Donations</h2>
      <div className="card filters">
        <input placeholder="Filter by city" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <select value={filters.foodType} onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}>
          <option value="">All types</option>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-veg</option>
          <option value="packaged">Packaged</option>
          <option value="other">Other</option>
        </select>
        <button className="btn" onClick={() => load()}>Search</button>
        <button className="btn outline" onClick={() => { const f = { city: '', foodType: '' }; setFilters(f); load(f); }}>Clear</button>
      </div>

      {error && <p className="error">{error}</p>}
      {info && <p className="success">{info}</p>}
      {loading && <p className="muted">Loading...</p>}
      {!loading && donations.length === 0 && <p className="muted">No donations available right now.</p>}

      <div className="grid">
        {donations.map((d) => (
          <div className="card" key={d._id}>
            <h3>{d.title}</h3>
            <p className="muted">{d.description}</p>
            <p><b>{d.quantity} {d.unit}</b> &middot; <span className="tag">{d.foodType}</span></p>
            <p>📍 {d.pickupAddress}, {d.city}</p>
            <p>⏰ Expires: {new Date(d.expiryTime).toLocaleString()}</p>
            <p className="muted">Donor: {d.donor?.name} {d.donor?.phone ? `(${d.donor.phone})` : ''}</p>
            {user.role === 'receiver' && (
              <button className="btn" onClick={() => requestFood(d._id)}>Request this food</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
