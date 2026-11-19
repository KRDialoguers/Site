import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'tagline', type: 'string', description: 'Headline on the landing page.' }),
    defineField({ name: 'intro', type: 'text', rows: 3, description: 'Paragraph beside the headline.' }),
    defineField({ name: 'featured', title: 'Featured conversation', type: 'reference', to: [{ type: 'conversation' }] }),
    defineField({ name: 'hostName', type: 'string' }),
    defineField({ name: 'hostRole', type: 'string' }),
    defineField({ name: 'hostLocation', type: 'string' }),
    defineField({ name: 'contactEmail', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
