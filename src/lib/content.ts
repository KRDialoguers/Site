import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { defineQuery } from 'next-sanity';
import { client } from '@/sanity/client';
import seed from '@/content/seed.json';
import type { Content } from './types';

// One query pulls the whole site. Dialoguers is small (dozens of conversations), so this is
// simpler and faster than per-page queries, and it is cached until Sanity's webhook revalidates it.
const CONTENT_QUERY = defineQuery(`{
  "settings": *[_type == "siteSettings"][0]{
    tagline, intro, contactEmail,
    "host": { "name": hostName, "role": hostRole, "location": hostLocation },
    "featured": featured->slug.current
  },
  "themes": *[_type == "theme"] | order(order asc){
    "id": slug.current, name, "short": shortName, tagline, blurb,
    "color": color, "soft": soft, "deep": deep, "subtopics": coalesce(subtopics, []),
    "quote": select(defined(quote.text) => { "text": quote.text, "by": quote.by->slug.current }, null),
    "order": coalesce(order, 0)
  },
  "people": *[_type == "person"] | order(name asc){
    "id": slug.current, name, role, field, city, region,
    "lat": location.lat, "lon": location.lng, "nudge": null,
    "themes": themes[]->slug.current, bio,
    "connections": coalesce(connections[]->slug.current, []),
    "photo": photo.asset->url
  },
  "conversations": *[_type == "conversation" && defined(slug.current)] | order(date desc){
    "id": slug.current, title, dek, date, minutes, format, "featured": coalesce(featured, false),
    "guests": guests[]->slug.current, "themes": themes[]->slug.current, "tags": coalesce(tags, []),
    "media": { "youtubeId": youtubeId, "audioUrl": audioUrl },
    "questions": coalesce(questions, []),
    "chapters": coalesce(chapters[]{ time, title }, []),
    "transcript": coalesce(transcript[]{ time, "speaker": speaker->slug.current, text }, [])
  },
  "notes": *[_type == "fieldNote" && defined(slug.current)] | order(date desc){
    "id": slug.current, kicker, title, subtitle, dek, date, minutes, "theme": theme->slug.current,
    "glance": coalesce(glance[]{ label, text }, []), nutrition, bigPicture,
    "insights": coalesce(insights[]{ lead, text }, []), takeaway, watchLabel,
    "watch": coalesce(watch[]{ label, text }, []), "related": coalesce(related[]->slug.current, [])
  }
}`);

const REGIONS = ['North America', 'Latin America', 'Europe', 'Africa', 'Middle East', 'Asia', 'Oceania'];

export async function getContent(): Promise<Content> {
  'use cache';
  cacheTag('content'); // the Sanity webhook (app/api/revalidate) refreshes this tag on publish
  cacheLife('hours'); // safety net: refresh at least every few hours even without the webhook
  if (!client) return seed as unknown as Content;
  const data = await client.fetch(CONTENT_QUERY);
  return { ...(data as unknown as Omit<Content, 'regions'>), regions: REGIONS } as Content;
}
