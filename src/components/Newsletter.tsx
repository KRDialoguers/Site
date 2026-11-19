'use client';
import { useState } from 'react';

// Placeholder sign-up. Wire `action` to the newsletter tool once chosen (e.g. Buttondown, Beehiiv, Substack).
export default function Newsletter({ title = 'Get the next conversation in your inbox.', id }: { title?: string; id?: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="band" id={id}>
      <div>
        <span className="eyebrow">Field Notes</span>
        <h2 style={{ marginTop: 10 }}>{title}</h2>
        <p className="ink2" style={{ marginTop: 12 }}>New conversations, short essays and what to watch next. Roughly twice a month.</p>
      </div>
      <div>
        <form className="nl" onSubmit={(e) => { e.preventDefault(); setDone(true); (e.target as HTMLFormElement).reset(); }}>
          <input type="email" required placeholder="you@example.com" aria-label="Email address" />
          <button className="btn" type="submit">Subscribe</button>
        </form>
        <p className="ok" aria-live="polite">{done ? 'Thanks — you’re on the list.' : ''}</p>
      </div>
    </div>
  );
}
