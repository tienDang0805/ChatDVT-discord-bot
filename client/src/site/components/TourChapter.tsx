import type { ReactNode } from 'react';
import { Mascot } from './Mascot';

export function Speech({ name, children }: { name: string; children: ReactNode }) {
  return <div className="speech"><span>{name}</span>{children}</div>;
}

export function TourChapter({ id, label, character, dialogue, children, final = false }: { id: string; label: string; character: 'tien' | 'chatdvt'; dialogue: ReactNode; children: ReactNode; final?: boolean }) {
  return <section id={id} className={`story-scene book-section${final ? ' final-chapter' : ''}`}>
    <div className="chapter-label">{label}</div><div className="chapter-spread">
      <div className="margin-story"><Speech name={character === 'tien' ? 'TIẾN' : 'CHATDVT'}>{dialogue}</Speech><Mascot character={character} size={character === 'tien' ? 160 : 140} action={final ? 'wave' : character === 'tien' ? 'coffee' : 'tablet-show'} /></div>
      <div className="chapter-copy">{children}</div>
    </div>
  </section>;
}
