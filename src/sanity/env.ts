// Sanity connection settings come from environment variables (see .env.example).
// When NEXT_PUBLIC_SANITY_PROJECT_ID is not set, the site falls back to the sample content in src/content/seed.json.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-11-01';
export const sanityEnabled = Boolean(projectId);
