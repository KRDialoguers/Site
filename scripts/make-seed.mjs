// Converts src/content/seed.json into an NDJSON file Sanity can import:
//   npx sanity dataset import seed/dialoguers.ndjson production --replace
// Document IDs are stable (person.<slug>, etc.), so re-importing updates instead of duplicating.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const seed = JSON.parse(readFileSync(new URL('../src/content/seed.json', import.meta.url)));
const ref = (type, id) => ({ _type: 'reference', _ref: `${type}.${id}` });
const refs = (type, ids = []) => ids.map((id, i) => ({ ...ref(type, id), _key: `${type}-${i}-${id}` }));
const keyed = (arr = [], p) => arr.map((x, i) => ({ _key: `${p}${i}`, ...x }));
const slug = (s) => ({ _type: 'slug', current: s });
const docs = [];

seed.themes.forEach((t) => docs.push({
  _id: `theme.${t.id}`, _type: 'theme', name: t.name, slug: slug(t.id), shortName: t.short || undefined, tagline: t.tagline, blurb: t.blurb,
  color: t.color, soft: t.soft, deep: t.deep, subtopics: t.subtopics, order: t.order,
  quote: t.quote ? { text: t.quote.text, by: ref('person', t.quote.by) } : undefined,
}));
seed.people.forEach((p) => docs.push({
  _id: `person.${p.id}`, _type: 'person', name: p.name, slug: slug(p.id), role: p.role, field: p.field, city: p.city, region: p.region,
  location: { _type: 'geopoint', lat: p.lat, lng: p.lon }, themes: refs('theme', p.themes), connections: refs('person', p.connections), bio: p.bio,
}));
seed.conversations.forEach((c) => docs.push({
  _id: `conversation.${c.id}`, _type: 'conversation', title: c.title, slug: slug(c.id), dek: c.dek, date: c.date, minutes: c.minutes, format: c.format,
  featured: c.featured, guests: refs('person', c.guests), themes: refs('theme', c.themes), tags: c.tags, questions: c.questions,
  youtubeId: c.media.youtubeId || undefined, audioUrl: c.media.audioUrl || undefined,
  chapters: keyed(c.chapters, 'ch'),
  transcript: keyed(c.transcript.map((l) => ({ time: l.time, text: l.text, ...(l.speaker ? { speaker: ref('person', l.speaker) } : {}) })), 'tl'),
}));
seed.notes.forEach((n) => docs.push({
  _id: `fieldNote.${n.id}`, _type: 'fieldNote', title: n.title, subtitle: n.subtitle || undefined, slug: slug(n.id), kicker: n.kicker, dek: n.dek, date: n.date,
  minutes: n.minutes, theme: ref('theme', n.theme), glance: keyed(n.glance, 'g'), nutrition: n.nutrition, bigPicture: n.bigPicture,
  insights: keyed(n.insights, 'i'), takeaway: n.takeaway, watchLabel: n.watchLabel, watch: keyed(n.watch, 'w'), related: refs('conversation', n.related),
}));
const s = seed.settings;
docs.push({ _id: 'siteSettings', _type: 'siteSettings', tagline: s.tagline, intro: s.intro, featured: s.featured ? ref('conversation', s.featured) : undefined,
  hostName: s.host.name, hostRole: s.host.role, hostLocation: s.host.location, contactEmail: s.contactEmail });

mkdirSync(new URL('../seed/', import.meta.url), { recursive: true });
writeFileSync(new URL('../seed/dialoguers.ndjson', import.meta.url), docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
console.log(`Wrote ${docs.length} documents to seed/dialoguers.ndjson`);
