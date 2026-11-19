import { defineField, defineType } from 'sanity';

const hex = (title: string, description: string) =>
  defineField({
    name: title.toLowerCase().split(' ')[0],
    title,
    type: 'string',
    description,
    validation: (r) => r.required().regex(/^#[0-9a-fA-F]{6}$/, { name: 'hex colour like #6F8FB0' }),
  });

export const theme = defineType({
  name: 'theme',
  title: 'Theme',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'shortName', title: 'Short name', type: 'string', description: 'Used on chips where space is tight, e.g. "Sport".' }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({ name: 'blurb', type: 'text', rows: 3 }),
    hex('Color', 'Main colour for this theme (hex).'),
    hex('Soft', 'Pale tint used behind the theme (hex).'),
    hex('Deep', 'Dark shade used for text on the tint (hex).'),
    defineField({ name: 'subtopics', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'quote',
      type: 'object',
      description: 'Pull quote shown on the Themes page.',
      fields: [
        defineField({ name: 'text', type: 'text', rows: 2 }),
        defineField({ name: 'by', type: 'reference', to: [{ type: 'person' }] }),
      ],
    }),
    defineField({ name: 'order', type: 'number', description: 'Position on the map ring (0–5).' }),
  ],
  orderings: [{ title: 'Map order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});
