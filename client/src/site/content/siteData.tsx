import type { LucideIcon } from 'lucide-react';
import {
  Bot, BrainCircuit, Briefcase, CakeSlice, Cat, HelpCircle, Code2, Coffee,
  Database, Dice5, Eye, Feather, Flame, Gamepad2, GitBranch, Heart, Image,
  Link2, MessageSquare, Music2, Palette, QrCode, ScanFace, ShieldCheck,
  Smartphone, Sparkles, StickyNote, Swords, TerminalSquare, Wand2,
  Zap, BookOpen,
} from 'lucide-react';
import {
  FEATURE_CATALOG,
  type FeatureDefinition,
  type FeatureSection,
  type FeatureStatus,
  type FeatureVisibility,
} from '../../../../src/shared/featureCatalog';

export interface SiteItem {
  id: string;
  title: string;
  description: string;
  href: string;
  section: FeatureSection;
  visibility: FeatureVisibility;
  status: FeatureStatus;
  indexable: boolean;
  icon: LucideIcon;
  tags: string[];
  requirements: string[];
  featuredRank?: number;
}

const iconById: Record<string, LucideIcon> = {
  'mobile-toolkit': Smartphone,
  chatdvt: Bot,
  survivor: Swords,
  english: BookOpen,
  mermaid: GitBranch,
  chibi: Palette,
  cv: Briefcase,
  quiz: BrainCircuit,
  note: StickyNote,
  detox: ShieldCheck,
  duel: Swords,
  burnout: Zap,
  poe2: Database,
  poem: Feather,
  food: Coffee,
  'android-toolbox': TerminalSquare,
  deeplink: Link2,
  webview: Smartphone,
  qr: QrCode,
  'rn-guide': Code2,
  excuse: MessageSquare,
  handsome: ScanFace,
  numerology: HelpCircle,
  'gender-quiz': HelpCircle,
  astrology: Sparkles,
  tarot: Wand2,
  'magic-ball': Dice5,
  'face-reader': Eye,
  dream: Sparkles,
  'deep-status': MessageSquare,
  music: Music2,
  flappy: Gamepad2,
  chicken: Gamepad2,
  cost: Eye,
  'pd-guide': TerminalSquare,
  'pixel-agents': Image,
  monopoly: Dice5,
  love8d: Heart,
  tutien: Flame,
  pet: Cat,
  hbd: CakeSlice,
};

function toSiteItem(feature: FeatureDefinition): SiteItem {
  return {
    id: feature.id,
    title: feature.title,
    description: feature.description,
    href: feature.path,
    section: feature.section,
    visibility: feature.visibility,
    status: feature.status,
    indexable: feature.indexable,
    icon: iconById[feature.id] || Sparkles,
    tags: feature.tags,
    requirements: feature.requirements || [],
    featuredRank: feature.featuredRank,
  };
}

export const projectItems: SiteItem[] = FEATURE_CATALOG
  .filter((feature) => feature.surfaces?.includes('projects'))
  .map(toSiteItem);

export const archiveItems: SiteItem[] = FEATURE_CATALOG
  .filter((feature) => feature.visibility === 'archive')
  .map(toSiteItem);

export const mobileItems: SiteItem[] = FEATURE_CATALOG
  .filter((feature) => feature.surfaces?.includes('mobile'))
  .map(toSiteItem);

export interface FeaturedProject {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  visual: 'mobile' | 'discord' | 'arena';
  tags: string[];
}

const homeEyebrow: Record<string, string> = {
  'mobile-toolkit': 'Mobile Development',
  chatdvt: 'Discord Bot',
  survivor: 'Web Game',
};

const homeVisual: Record<string, FeaturedProject['visual']> = {
  'mobile-toolkit': 'mobile',
  chatdvt: 'discord',
  survivor: 'arena',
};

export const featuredProjects: FeaturedProject[] = FEATURE_CATALOG
  .filter((feature) => feature.surfaces?.includes('home'))
  .sort((a, b) => (a.homeRank || 99) - (b.homeRank || 99))
  .map((feature) => ({
    eyebrow: homeEyebrow[feature.id] || 'Project',
    title: feature.title,
    description: feature.description,
    href: feature.path,
    visual: homeVisual[feature.id] || 'mobile',
    tags: feature.tags,
  }));
