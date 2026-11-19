import { defineArrayMember, defineField, defineType, type StringRule } from 'sanity';

const timecode = (r: StringRule) => r.regex(/^(\d+:)?\d{1,2}:\d{2}$/, { name: 'time like 12:30 or 1:02:45' });

export const conversation = defineType({
  name: 'conversation',
  title: 'Conversation',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'media', title: 'Media' },
    { name: 'text', title: 'Chapters & transcript' },
  ],
  fields: [
    defineField({ name: 'title', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', group: 'main', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'dek', title: 'Short description', type: 'string', group: 'main' }),
    defineField({ name: 'date', type: 'date', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'format', type: 'string', group: 'main', options: { list: ['video', 'audio'], layout: 'radio' }, initialValue: 'video' }),
    defineField({ name: 'minutes', title: 'Length (minutes)', type: 'number', group: 'main' }),
    defineField({ name: 'featured', type: 'boolean', group: 'main', description: 'Prefer Site settings → Featured conversation; this is a fallback.' }),
    defineField({ name: 'guests', type: 'array', group: 'main', of: [{ type: 'reference', to: [{ type: 'person' }] }], validation: (r) => r.min(1) }),
    defineField({ name: 'themes', type: 'array', group: 'main', of: [{ type: 'reference', to: [{ type: 'theme' }] }] }),
    defineField({ name: 'tags', type: 'array', group: 'main', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'questions', title: 'Questions explored', type: 'array', group: 'main', of: [{ type: 'string' }] }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID',
      type: 'string',
      group: 'media',
      description: 'The part after v= in the YouTube link, e.g. dQw4w9WgXcQ.',
      validation: (r) => r.regex(/^[A-Za-z0-9_-]{11}$/, { name: 'YouTube ID (11 characters)' }),
    }),
    defineField({ name: 'audioUrl', title: 'Audio URL', type: 'url', group: 'media', description: 'Direct MP3 link from the podcast host, if any.' }),
    defineField({
      name: 'chapters',
      type: 'array',
      group: 'text',
      of: [defineArrayMember({ type: 'object', fields: [defineField({ name: 'time', type: 'string', validation: timecode }), defineField({ name: 'title', type: 'string' })], preview: { select: { title: 'title', subtitle: 'time' } } })],
    }),
    defineField({
      name: 'transcript',
      type: 'array',
      group: 'text',
      description: 'Leave speaker empty for the host.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'time', type: 'string', validation: timecode }),
            defineField({ name: 'speaker', type: 'reference', to: [{ type: 'person' }] }),
            defineField({ name: 'text', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'text', subtitle: 'time' } },
        }),
      ],
    }),
  ],
  orderings: [{ title: 'Newest', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'date' } },
});
