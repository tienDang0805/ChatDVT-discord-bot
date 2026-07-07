import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_LOGIC_CONFIG } from '../../config/constants';
import { TradeIntent, tradeIntentSchema } from './types';

const PARSER_PROMPT = `You are a Path of Exile 2 trade intent parser.

Convert the user's natural language request into strict JSON.
Do not return official trade stat IDs.
Do not invent exact modifier IDs.
Only return high-level item category, trade options, and semantic tags.

Allowed group types:
- and
- count
- weight

Common tags:
- any_resistance
- elemental_resistance
- fire_resistance
- cold_resistance
- lightning_resistance
- chaos_resistance
- flat_damage_to_attacks
- flat_damage_to_spells
- life
- spirit
- rarity
- monster_rarity
- rare_monsters
- additional_random_modifiers
- abyss_desecrated_currency
- abyss_tablet_profit

Return JSON only.`;

function readNumberAfter(input: string, pattern: RegExp): number | undefined {
  const match = input.match(pattern);
  if (!match?.[1]) return undefined;
  const value = Number(match[1].replace(',', '.'));
  return Number.isFinite(value) ? value : undefined;
}

function parseLocalIntent(input: string): TradeIntent {
  const text = input.toLocaleLowerCase('vi-VN');
  const groups: TradeIntent['groups'] = [];
  const item: NonNullable<TradeIntent['item']> = {};

  if (/\bring\b|\bnh[aẫ]n\b/.test(text)) {
    item.category = 'ring';
  } else if (/\btablet\b/.test(text)) {
    item.category = 'tablet';
    if (/\babyss\b/.test(text)) item.baseType = 'Abyss Tablet';
  }

  const weightedFlatDamage = readNumberAfter(
    text,
    /(?:weighted?\s+)?flat\s+damage(?:\s+to\s+attacks?)?\s*(?:>=|>|tr[eê]n|t[oố]i thi[eể]u)?\s*(\d+(?:[.,]\d+)?)/i,
  );
  if (weightedFlatDamage !== undefined) {
    groups.push({
      type: 'weight',
      tag: 'flat_damage_to_attacks',
      min: weightedFlatDamage,
    });
  }

  const resistanceMatch = text.match(
    /count\s*(\d+)[^\d]*(?:res(?:istance)?|kh[aá]ng)[^\d]*(?:>=|>|tr[eê]n|t[oố]i thi[eể]u)?\s*(\d+(?:[.,]\d+)?)/i,
  );
  if (resistanceMatch?.[1] && resistanceMatch[2]) {
    groups.push({
      type: 'count',
      tag: 'any_resistance',
      minCount: Number(resistanceMatch[1]),
      statMin: Number(resistanceMatch[2].replace(',', '.')),
    });
  }

  const isBasicRingExample = item.category === 'ring'
    && /\bflat\b/.test(text)
    && /\bdamage\b/.test(text)
    && /\bres(?:istance)?\b/.test(text);
  if (isBasicRingExample && !groups.some((group) => group.type === 'weight')) {
    groups.push({ type: 'weight', tag: 'flat_damage_to_attacks', min: 50 });
  }
  if (isBasicRingExample && !groups.some((group) => group.tag === 'any_resistance')) {
    groups.push({
      type: 'count',
      tag: 'any_resistance',
      minCount: 1,
      statMin: 40,
    });
  }

  const rarityMatch = text.match(
    /count\s*(\d+)[^\d]*(?:rarity|đ[oộ]\s+hi[eế]m)[^\d]*(?:>=|>|tr[eê]n|t[oố]i thi[eể]u)?\s*(\d+(?:[.,]\d+)?)/i,
  );
  if (rarityMatch?.[1] && rarityMatch[2]) {
    groups.push({
      type: 'count',
      tag: 'rarity',
      minCount: Number(rarityMatch[1]),
      statMin: Number(rarityMatch[2].replace(',', '.')),
    });
  }

  const abyssStats: Array<[RegExp, string]> = [
    [/(?:desecrated\s+currency|currency)[^\d]*(\d+(?:[.,]\d+)?)/i, 'abyss_desecrated_currency'],
    [/(?:rare\s+monsters?)[^\d]*(\d+(?:[.,]\d+)?)/i, 'rare_monsters'],
    [/(?:additional(?:\s+random)?\s+modifiers?)[^\d]*(\d+(?:[.,]\d+)?)/i, 'additional_random_modifiers'],
  ];

  for (const [pattern, tag] of abyssStats) {
    const min = readNumberAfter(text, pattern);
    if (min !== undefined) groups.push({ type: 'and', tag, min });
  }

  if (
    item.baseType === 'Abyss Tablet'
    && /\bcurrency\b/.test(text)
    && !groups.some((group) => group.tag.startsWith('abyss_'))
  ) {
    groups.push({ type: 'and', tag: 'abyss_tablet_profit' });
  }

  const maxPriceMatch = text.match(
    /(?:max|maximum|t[oố]i đa|<=?)\s*(\d+(?:[.,]\d+)?)\s*([a-z]+)/i,
  );

  const trade: NonNullable<TradeIntent['trade']> = {
    status: /\bany\s+status\b|\boffline\b/.test(text) ? 'any' : 'online',
    saleType: /\bany\s+sale\b|\bunpriced\b/.test(text) ? 'any' : 'instant_buyout',
  };

  if (maxPriceMatch?.[1] && maxPriceMatch[2]) {
    trade.maxPrice = {
      amount: Number(maxPriceMatch[1].replace(',', '.')),
      currency: maxPriceMatch[2].toLowerCase(),
    };
  } else if (isBasicRingExample) {
    trade.maxPrice = { amount: 1, currency: 'divine' };
  }

  if (groups.length === 0) {
    throw new Error('Could not identify a supported trade modifier from the input.');
  }

  return tradeIntentSchema.parse({
    item: Object.keys(item).length > 0 ? item : undefined,
    trade,
    groups,
  });
}

async function parseWithGemini(input: string, apiKey: string): Promise<TradeIntent> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.POE2_TRADE_GEMINI_MODEL || GEMINI_LOGIC_CONFIG.modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });
  const result = await model.generateContent(`${PARSER_PROMPT}\n\nUser request:\n${input}`);
  const json = result.response.text()
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '');
  const parsed = JSON.parse(json);
  return tradeIntentSchema.parse(parsed);
}

export async function parseTradeIntent(input: string): Promise<TradeIntent> {
  const trimmedInput = input.trim();
  if (!trimmedInput) throw new Error('Trade request is required.');
  if (trimmedInput.length > 2000) throw new Error('Trade request is too long.');

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  try {
    return apiKey
      ? await parseWithGemini(trimmedInput, apiKey)
      : parseLocalIntent(trimmedInput);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Could not parse trade intent: ${error.message}`);
    }
    throw new Error('Could not parse trade intent.');
  }
}
