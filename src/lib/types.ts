// Shared content shapes. Sanity queries project into these, and the local seed matches them,
// so every page works the same whether content comes from Sanity or from src/content/seed.json.

export type Theme = {
  id: string;
  name: string;
  short: string | null;
  tagline: string;
  blurb: string;
  color: string; // main colour
  soft: string; // pale tint for backgrounds
  deep: string; // dark shade for text on tint
  subtopics: string[];
  quote: { text: string; by: string } | null; // by = person id
  order: number;
};

export type Person = {
  id: string;
  name: string;
  role: string;
  field: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  nudge: [number, number] | null; // small map offset when pins overlap
  themes: string[]; // first theme = the cloud they sit in on the map
  bio: string;
  connections: string[]; // manual links to other people, drawn on the map
  photo: string | null;
};

export type Conversation = {
  id: string;
  title: string;
  dek: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  format: 'video' | 'audio';
  featured: boolean;
  guests: string[];
  themes: string[];
  tags: string[];
  media: { youtubeId: string | null; audioUrl: string | null };
  questions: string[];
  chapters: { time: string; title: string }[];
  transcript: { time: string; speaker: string | null; text: string }[]; // speaker null = host
};

export type Note = {
  id: string;
  kicker: string;
  title: string;
  subtitle: string | null;
  dek: string;
  date: string;
  minutes: number;
  theme: string;
  glance: { label: string; text: string }[];
  nutrition: { topic: string; ingredients: string; complexity: number; time: string; goodFor: string };
  bigPicture: string;
  insights: { lead: string; text: string }[];
  takeaway: string;
  watchLabel: string;
  watch: { label: string; text: string }[];
  related: string[];
};

export type Settings = {
  tagline: string;
  intro: string;
  host: { name: string; role: string; location: string };
  featured: string | null; // conversation id
  contactEmail: string;
};

export type Content = {
  settings: Settings;
  themes: Theme[];
  people: Person[];
  conversations: Conversation[];
  notes: Note[];
  regions: string[];
};
