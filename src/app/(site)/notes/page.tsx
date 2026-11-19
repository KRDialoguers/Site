import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { byDate, indexes } from '@/lib/util';
import { NoteRow } from '@/lib/ui';
import Newsletter from '@/components/Newsletter';

export const metadata: Metadata = { title: 'Field Notes' };

export default async function NotesPage() {
  const content = await getContent();
  const { T } = indexes(content);
  return (
    <>
      <div className="wrap">
        <div className="phead"><h1>Field Notes</h1><p className="lead">Short essays, global context and what to watch next — notes from the conversations, and toward the book.</p></div>
        <div className="rows nlist" style={{ marginTop: 28 }}>{[...content.notes].sort(byDate).map((n) => <NoteRow key={n.id} n={n} T={T} />)}</div>
      </div>
      <section><div className="wrap"><Newsletter title="Field Notes, in your inbox." /></div></section>
    </>
  );
}
