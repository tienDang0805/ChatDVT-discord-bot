export type TradeStatCatalogItem = {
  id: string;
  label: string;
  tags: string[];
  itemScopes?: string[];
};

// These IDs are placeholders. Replace them with verified official PoE2 stat IDs
// before enabling real search mode.
export const MOCK_TRADE_STATS: TradeStatCatalogItem[] = [
  {
    id: 'explicit.stat_flat_phys_attack',
    label: 'Adds # to # Physical Damage to Attacks',
    tags: ['flat_damage_to_attacks', 'physical_damage'],
  },
  {
    id: 'explicit.stat_flat_fire_attack',
    label: 'Adds # to # Fire Damage to Attacks',
    tags: ['flat_damage_to_attacks', 'fire_damage'],
  },
  {
    id: 'explicit.stat_flat_cold_attack',
    label: 'Adds # to # Cold Damage to Attacks',
    tags: ['flat_damage_to_attacks', 'cold_damage'],
  },
  {
    id: 'explicit.stat_flat_lightning_attack',
    label: 'Adds # to # Lightning Damage to Attacks',
    tags: ['flat_damage_to_attacks', 'lightning_damage'],
  },
  {
    id: 'explicit.stat_fire_resistance',
    label: '+#% to Fire Resistance',
    tags: ['any_resistance', 'elemental_resistance', 'fire_resistance'],
  },
  {
    id: 'explicit.stat_cold_resistance',
    label: '+#% to Cold Resistance',
    tags: ['any_resistance', 'elemental_resistance', 'cold_resistance'],
  },
  {
    id: 'explicit.stat_lightning_resistance',
    label: '+#% to Lightning Resistance',
    tags: ['any_resistance', 'elemental_resistance', 'lightning_resistance'],
  },
  {
    id: 'explicit.stat_chaos_resistance',
    label: '+#% to Chaos Resistance',
    tags: ['any_resistance', 'chaos_resistance'],
  },
  {
    id: 'explicit.stat_life',
    label: '+# to maximum Life',
    tags: ['life'],
  },
  {
    id: 'explicit.stat_spirit',
    label: '+# to Spirit',
    tags: ['spirit'],
  },
  {
    id: 'explicit.stat_desecrated_currency',
    label: '#% increased Chance for Desecrated Currency from Abysses in Map',
    tags: ['abyss_desecrated_currency', 'abyss_tablet_profit'],
    itemScopes: ['tablet'],
  },
  {
    id: 'explicit.stat_rare_monsters',
    label: 'Map has #% increased number of Rare Monsters',
    tags: ['rare_monsters', 'abyss_tablet_profit'],
    itemScopes: ['tablet'],
  },
  {
    id: 'explicit.stat_additional_random_modifiers',
    label: 'Map has # additional random Modifiers',
    tags: ['additional_random_modifiers', 'abyss_tablet_profit'],
    itemScopes: ['tablet'],
  },
  {
    id: 'explicit.stat_monster_rarity',
    label: 'Map has #% increased Monster Rarity',
    tags: ['monster_rarity', 'rarity'],
    itemScopes: ['tablet'],
  },
];

