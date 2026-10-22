import type { ReactNode } from 'react';
import { AnimatedHeadline } from './AnimatedHeadline';
import { Reveal } from './Reveal';

/** Shared public-page typography and entrance; authored article titles stay plain. */
export function PageIntro({ id, eyebrow, lines, description, children, aside }: {
  id: string; eyebrow: string; lines: string[]; description: ReactNode; children?: ReactNode; aside?: ReactNode;
}) {
  return <header className={'page-intro' + (aside ? ' page-intro--with-art' : '')}>
    <Reveal className="page-intro-copy"><p className="page-eyebrow">{eyebrow}</p><AnimatedHeadline id={id} lines={lines} className="page-title" /><div className="page-intro-description">{description}</div>{children}</Reveal>
    {aside && <div className="page-intro-art">{aside}</div>}
  </header>;
}
