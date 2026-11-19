import { defineArrayMember, defineField, defineType } from 'sanity';

const pair = (a: string, b: string) =>
  defineArrayMember({ type: 'object', fields: [defineField({ name: a, type: 'string' }), defineField({ name: b, type: 'text', rows: 2 })], preview: { select: { title: a, subtitle: b } } });

export const fieldNote = defineType({
  name: 'fieldNote',
  title: 'Field Note',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'subtitle', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'kicker', type: 'string', initialValue: 'Essay', description: 'Small label above the title, e.g. "Essay · World".' }),
    defineField({ name: 'dek', type: 'text', rows: 2 }),
    defineField({ name: 'date', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'minutes', title: 'Reading time (minutes)', type: 'number' }),
    defineField({ name: 'theme', type: 'reference', to: [{ type: 'theme' }] }),
    defineField({ name: 'glance', title: 'At a glance', type: 'array', of: [pair('label', 'text')], validation: (r) => r.max(3) }),
    defineField({
      name: 'nutrition',
      title: 'Nutrition guide',
      type: 'object',
      fields: [
        defineField({ name: 'topic', type: 'string' }),
        defineField({ name: 'ingredients', type: 'string' }),
        defineField({ name: 'complexity', type: 'number', validation: (r) => r.min(1).max(5) }),
        defineField({ name: 'time', type: 'string' }),
        defineField({ name: 'goodFor', type: 'string' }),
      ],
    }),
    defineField({ name: 'bigPicture', title: 'The big picture', type: 'text', rows: 3 }),
    defineField({ name: 'insights', title: 'Key insights', type: 'array', of: [pair('lead', 'text')], validation: (r) => r.max(3) }),
    defineField({ name: 'takeaway', type: 'text', rows: 2 }),
    defineField({ name: 'watchLabel', title: 'Closing section label', type: 'string', initialValue: 'What to watch' }),
    defineField({ name: 'watch', title: 'Closing section items', type: 'array', of: [pair('label', 'text')], validation: (r) => r.max(3) }),
    defineField({ name: 'related', title: 'Related conversations', type: 'array', of: [{ type: 'reference', to: [{ type: 'conversation' }] }] }),
  ],
  preview: { select: { title: 'title', subtitle: 'date' } },
});
