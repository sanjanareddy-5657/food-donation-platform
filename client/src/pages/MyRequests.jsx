import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/requests/mine')
      .then((d) => setRequests(d.requests))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h2>My Requests</h2>
      {error && <p className="error">{error}</p>}
      {requests.length === 0 && !error && <p className="muted">You have not requested any food yet.</p>}
      <div className="grid">
        {requests.map((r) => (
          <div className="card" key={r._id}>
            <h3>{r.donation?.title || 'Donation removed'}</h3>
            <p><span className={`tag ${r.status}`}>{r.status}</span></p>
            {r.donation && (
              <>
                <p>{r.donation.quantity} &middot; {r.donation.foodType}</p>
                <p>📍 {r.donation.pickupAddress}, {r.donation.city}</p>
                <p className="muted">Donation status: {r.donation.status}</p>
              </>
            )}
            {r.status === 'approved' && <p className="success">Approved! Please collect the food from the pickup address.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
