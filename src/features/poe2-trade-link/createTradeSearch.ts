import axios from 'axios';

export type CreateTradeSearchResult = {
  searchId: string;
  rawResponse: unknown;
};

function applyPattern(pattern: string, league: string, searchId?: string): string {
  return pattern
    .replace('{league}', encodeURIComponent(league))
    .replace('{searchId}', searchId ? encodeURIComponent(searchId) : '');
}

export function isTradeMockMode(): boolean {
  return process.env.POE2_TRADE_MOCK_MODE !== 'false';
}

export async function createOfficialTradeSearch(
  compiledQuery: unknown,
  league: string,
): Promise<CreateTradeSearchResult> {
  const endpointPattern = process.env.POE2_TRADE_SEARCH_ENDPOINT?.trim();
  if (!endpointPattern) {
    throw new Error('POE2_TRADE_SEARCH_ENDPOINT is required when mock mode is disabled.');
  }

  const endpoint = applyPattern(endpointPattern, league);
  const response = await axios.post(endpoint, compiledQuery, {
    timeout: 15000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'discord-gpt-bot-poe2-trade-link/1.0',
    },
  });
  const searchId = response.data?.id;
  if (typeof searchId !== 'string' || !searchId) {
    throw new Error('Official trade search response did not include a search id.');
  }

  return {
    searchId,
    rawResponse: response.data,
  };
}

export function buildOfficialTradeUrl(searchId: string, league: string): string {
  const pattern = process.env.POE2_TRADE_URL_PATTERN
    || 'https://www.pathofexile.com/trade2/search/poe2/{league}/{searchId}';
  return applyPattern(pattern, league, searchId);
}

export function createMockTradeSearch(
  compiledQuery: unknown,
  league: string,
): CreateTradeSearchResult & { url: string } {
  const payload = Buffer.from(JSON.stringify({ league, query: compiledQuery }))
    .toString('base64url');
  const searchId = `mock-${Date.now().toString(36)}`;
  return {
    searchId,
    rawResponse: {
      mock: true,
      message: 'Mock mode is enabled. No request was sent to the official trade API.',
    },
    url: `/poe2-trade-link/mock?intent=${encodeURIComponent(payload)}`,
  };
}

