import { FEATURE_CATALOG } from '../shared/featureCatalog';

const seenIds = new Set<string>();
const seenPaths = new Set<string>();
const errors: string[] = [];

for (const feature of FEATURE_CATALOG) {
  if (seenIds.has(feature.id)) errors.push(`Duplicate feature id: ${feature.id}`);
  if (seenPaths.has(feature.path)) errors.push(`Duplicate feature path: ${feature.path}`);
  seenIds.add(feature.id);
  seenPaths.add(feature.path);

  if (!feature.path.startsWith('/')) errors.push(`${feature.id}: path must start with /`);
  if (['archive', 'unlisted', 'private'].includes(feature.visibility) && feature.indexable) {
    errors.push(`${feature.id}: ${feature.visibility} features cannot be indexable`);
  }
  if (feature.surfaces?.includes('home') && feature.homeRank === undefined) {
    errors.push(`${feature.id}: home features need homeRank`);
  }
  if (feature.visibility === 'featured' && feature.surfaces?.includes('projects') && feature.featuredRank === undefined) {
    errors.push(`${feature.id}: featured projects need featuredRank`);
  }
}

if (errors.length > 0) {
  console.error(`Feature catalogue is invalid:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Feature catalogue OK: ${FEATURE_CATALOG.length} entries, ${FEATURE_CATALOG.filter((item) => item.indexable).length} indexable.`);
