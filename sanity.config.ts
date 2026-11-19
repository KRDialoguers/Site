'use client';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { apiVersion, dataset, projectId } from './src/sanity/env';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

export default defineConfig({
  basePath: '/studio',
  title: 'Dialoguers',
  projectId: projectId || 'not-configured',
  dataset,
  schema: {
    types: schemaTypes,
    templates: (t) => t.filter(({ schemaType }) => schemaType !== 'siteSettings'),
  },
  document: {
    actions: (prev, ctx) => (ctx.schemaType === 'siteSettings' ? prev.filter(({ action }) => action !== 'duplicate' && action !== 'delete') : prev),
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
