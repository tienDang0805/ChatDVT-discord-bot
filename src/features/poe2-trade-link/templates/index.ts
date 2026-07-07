import { TradeQueryTemplate } from './types';

// Replace these sample bodies with request payloads captured from the official
// trade site's Network tab before using real mode.
export const TRADE_QUERY_TEMPLATES: TradeQueryTemplate[] = [
  {
    id: 'ring_flat_damage_any_res',
    name: 'Ring: weighted flat damage plus resistance count',
    matchIntent: {
      itemCategory: 'ring',
      requiredTags: ['flat_damage_to_attacks', 'any_resistance'],
    },
    rawQueryTemplate: {
      query: {
        status: { option: '{{status}}' },
        stats: [
          {
            type: 'weight',
            value: { min: '{{weightMin}}' },
            filters: '{{weightFilters}}',
          },
          {
            type: 'count',
            value: { min: '{{countMin}}' },
            filters: '{{countFilters}}',
          },
        ],
        filters: '{{queryFilters}}',
      },
      sort: { price: 'asc' },
    },
    variables: {
      status: '{{status}}',
      weightMin: '{{weightMin}}',
      weightFilters: '{{weightFilters}}',
      countMin: '{{countMin}}',
      countFilters: '{{countFilters}}',
      queryFilters: '{{queryFilters}}',
    },
  },
  {
    id: 'abyss_tablet_profit',
    name: 'Abyss Tablet profit modifiers',
    matchIntent: {
      itemCategory: 'tablet',
      requiredTags: [
        'abyss_desecrated_currency',
        'rare_monsters',
        'additional_random_modifiers',
      ],
    },
    rawQueryTemplate: {
      query: {
        status: { option: '{{status}}' },
        type: '{{baseType}}',
        stats: '{{compiledStats}}',
        filters: '{{queryFilters}}',
      },
      sort: { price: 'asc' },
    },
    variables: {
      status: '{{status}}',
      baseType: '{{baseType}}',
      compiledStats: '{{compiledStats}}',
      queryFilters: '{{queryFilters}}',
    },
  },
  {
    id: 'rarity_count',
    name: 'Tablet rarity count',
    matchIntent: {
      itemCategory: 'tablet',
      requiredTags: ['rarity'],
    },
    rawQueryTemplate: {
      query: {
        status: { option: '{{status}}' },
        stats: '{{compiledStats}}',
        filters: '{{queryFilters}}',
      },
      sort: { price: 'asc' },
    },
    variables: {
      status: '{{status}}',
      compiledStats: '{{compiledStats}}',
      queryFilters: '{{queryFilters}}',
    },
  },
];

export type { TradeQueryTemplate } from './types';

