import { useEffect, useState } from 'react';
import { api } from '../api.js';

const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const defaultExpiry = () => toLocalInput(new Date(Date.now() + 6 * 60 * 60 * 1000));

const emptyForm = () => ({
  title: '', description: '', foodType: 'veg', quantity: '', unit: 'meals',
  pickupAddress: '', city: '', expiryTime: defaultExpiry(),
});

export default function DonorDashboard() {
  const [form, setForm] = useState(emptyForm());
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const load = async () => {
    try {
      const [d, r] = await Promise.all([api('/donations/mine'), api('/requests/received')]);
      setDonations(d.donations);
      setRequests(r.requests);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const run = async (fn, okMsg) => {
    setError('');
    setInfo('');
    try {
      await fn();
      if (okMsg) setInfo(okMsg);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.quantity || !form.pickupAddress || !form.city) {
      return setError('Title, quantity, pickup address and city are required');
    }
    run(async () => {
      await api('/donations', {
        method: 'POST',
        body: { ...form, quantity: Number(form.quantity), expiryTime: new Date(form.expiryTime).toISOString() },
      });
      setForm(emptyForm());
    }, 'Donation posted!');
  };

  return (
    <div>
      <h2>Donor Dashboard</h2>
      {error && <p className="error">{error}</p>}
      {info && <p className="success">{info}</p>}

      <div className="card">
        <h3>Post a new donation</h3>
        <form onSubmit={submit} className="form-grid">
          <input placeholder="Title (e.g. Veg biryani)" value={form.title} onChange={set('title')} />
          <select value={form.foodType} onChange={set('foodType')}>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-veg</option>
            <option value="packaged">Packaged</option>
            <option value="other">Other</option>
          </select>
          <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={set('quantity')} />
          <input placeholder="Unit (meals, kg, packs)" value={form.unit} onChange={set('unit')} />
          <input placeholder="Pickup address" value={form.pickupAddress} onChange={set('pickupAddress')} />
          <input placeholder="City" value={form.city} onChange={set('city')} />
          <label className="muted">Food expires at
            <input type="datetime-local" value={form.expiryTime} onChange={set('expiryTime')} />
          </label>
          <input placeholder="Description (optional)" value={form.description} onChange={set('description')} />
          <button className="btn">Post Donation</button>
        </form>
      </div>

      <h3>Requests on my donations</h3>
      {requests.length === 0 && <p className="muted">No requests yet.</p>}
      <div className="grid">
        {requests.map((r) => (
          <div className="card" key={r._id}>
            <p><b>{r.donation?.title}</b> <span className={`tag ${r.status}`}>{r.status}</span></p>
            <p>From: {r.receiver?.name} ({r.receiver?.phone || r.receiver?.email})</p>
            <p className="muted">{r.message}</p>
            {r.status === 'pending' && (
              <div className="row">
                <button className="btn small" onClick={() => run(() => api(`/requests/${r._id}/approve`, { method: 'PATCH' }), 'Request approved')}>Approve</button>
                <button className="btn small outline" onClick={() => run(() => api(`/requests/${r._id}/reject`, { method: 'PATCH' }), 'Request rejected')}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <h3>My donations</h3>
      {donations.length === 0 && <p className="muted">You have not posted anything yet.</p>}
      <div className="grid">
        {donations.map((d) => (
          <div className="card" key={d._id}>
            <h4>{d.title} <span className={`tag ${d.status}`}>{d.status}</span></h4>
            <p>{d.quantity} {d.unit} &middot; {d.foodType}</p>
            <p>📍 {d.pickupAddress}, {d.city}</p>
            <p>⏰ {new Date(d.expiryTime).toLocaleString()}</p>
            <div className="row">
              {d.status === 'approved' && (
                <button className="btn small" onClick={() => run(() => api(`/donations/${d._id}/collected`, { method: 'PATCH' }), 'Marked as collected')}>Mark collected</button>
              )}
              {d.status !== 'collected' && (
                <button className="btn small danger" onClick={() => window.confirm('Delete this donation?') && run(() => api(`/donations/${d._id}`, { method: 'DELETE' }), 'Donation deleted')}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
