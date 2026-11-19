import type { StructureResolver } from 'sanity/structure';

// Site settings is a single document; everything else is a normal list.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Dialoguers')
    .items([
      S.listItem().title('Site settings').id('siteSettings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('conversation').title('Conversations'),
      S.documentTypeListItem('person').title('People'),
      S.documentTypeListItem('theme').title('Themes'),
      S.documentTypeListItem('fieldNote').title('Field Notes'),
    ]);
