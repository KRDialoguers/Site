import { defineField, defineType } from 'sanity';

export const REGIONS = ['North America', 'Latin America', 'Europe', 'Africa', 'Middle East', 'Asia', 'Oceania'];

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'role', type: 'string', description: 'One line, e.g. "Urban planner and sustainability advocate".' }),
    defineField({ name: 'field', type: 'string', description: 'Used for the People filters, e.g. "Cities & Design".' }),
    defineField({ name: 'photo', type: 'image', options: { hotspot: true }, description: 'Only upload with a signed release.' }),
    defineField({ name: 'city', type: 'string' }),
    defineField({ name: 'region', type: 'string', options: { list: REGIONS } }),
    defineField({ name: 'location', type: 'geopoint', description: 'Pin position on the Geography map.' }),
    defineField({
      name: 'themes',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'theme' }] }],
      description: 'The first theme decides which topic cloud they sit in on the map.',
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'connections',
      title: 'Manual connections',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'person' }] }],
      description: 'Hand-picked links to other guests, drawn on the map in addition to shared themes.',
    }),
    defineField({ name: 'bio', type: 'text', rows: 3 }),
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});
