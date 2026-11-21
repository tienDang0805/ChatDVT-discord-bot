import type { CSSProperties } from 'react';
import { Braces, Camera, Database, Package, ScanLine, Waypoints } from 'lucide-react';

const brandMarks = {
  'Kotlin': ['kotlin', '#a778ff'],
  'CameraX': [Camera, '#5cdcb8'],
  'TensorFlow Lite': ['tensorflow', '#ff9e32'],
  'ML Kit': [ScanLine, '#85b7ff'],
  'Gradle': ['gradle', '#48bbac'],
  'Maven': ['maven', '#f0789d'],
  'React Native': ['react', '#61dafb'],
  'TypeScript': ['typescript', '#6ba8f1'],
  'Redux': ['redux', '#ad8aef'],
  'MMKV': [Database, '#e8b875'],
  'REST API': [Braces, '#75cddd'],
  'Android': ['android', '#64de9b'],
  'Android Tablet': ['android', '#64de9b'],
  'Java': ['java', '#f6a365'],
  'Native Bridge': [Waypoints, '#a9c6ff'],
  'Vendor SDK': [Package, '#e8bb70'],
} as const;

export type WorkTechnology = keyof typeof brandMarks;

export function WorkTechTags({ items, en }: { items: readonly WorkTechnology[]; en: boolean }) {
  return <ul className="lh-tags work-case-tags" aria-label={en ? 'Technologies' : 'Công nghệ'}>
    {items.map(item => {
      const [Mark, color] = brandMarks[item];
      return <li key={item} style={{ '--tech-color': color } as CSSProperties}>
        {typeof Mark === 'string'
          ? <img src={`/images/technology/${Mark}.svg`} width={16} height={16} alt="" loading="lazy" />
          : <Mark size={16} aria-hidden="true" />}
        {item}
      </li>;
    })}
  </ul>;
}
