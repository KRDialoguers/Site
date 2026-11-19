import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import ConversationsBrowser from '@/components/ConversationsBrowser';
import Newsletter from '@/components/Newsletter';

export const metadata: Metadata = { title: 'Conversations' };

export default async function ConversationsPage() {
  const content = await getContent();
  return (
    <>
      <div className="wrap">
        <div className="phead"><h1>Conversations</h1><p className="lead">Every Dialoguers conversation, newest first. Filter by theme, format or the region a guest is speaking from.</p></div>
        <ConversationsBrowser content={content} />
      </div>
      <section><div className="wrap"><Newsletter /></div></section>
    </>
  );
}
