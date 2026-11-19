import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="phead"><h1>Not found</h1><p className="lead">That page isn’t here. It may have moved, or the conversation isn’t published yet. <Link href="/" style={{ color: 'var(--accent)' }}>Back to the map</Link>.</p></div>
    </div>
  );
}
