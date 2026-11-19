'use client';
import { useState } from 'react';

export default function NewsletterBox() {
  const [done, setDone] = useState(false);
  return (
    <div className="box" style={{ background: 'var(--paper2)', border: 0 }}>
      <h4>In your inbox</h4>
      <p className="ink2" style={{ fontSize: 14, marginBottom: 14 }}>Field Notes: short essays, global context, and what to watch next.</p>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onSubmit={(e) => { e.preventDefault(); setDone(true); (e.target as HTMLFormElement).reset(); }}>
        <input type="email" required placeholder="you@example.com" aria-label="Email address" style={{ height: 44, borderRadius: 10, border: '1px solid var(--line)', padding: '0 14px', font: 'inherit' }} />
        <button className="btn" type="submit" style={{ justifyContent: 'center' }}>Subscribe</button>
      </form>
      <p className="ok" aria-live="polite" style={{ fontSize: 13, marginTop: 8 }}>{done ? 'Thanks — you’re on the list.' : ''}</p>
    </div>
  );
}
