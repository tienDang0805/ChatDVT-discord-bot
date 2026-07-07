import { compileTradeQuery } from './compileTradeQuery';
import {
  buildOfficialTradeUrl,
  createMockTradeSearch,
  createOfficialTradeSearch,
  isTradeMockMode,
} from './createTradeSearch';
import { parseTradeIntent } from './parseTradeIntent';
import { resolveTradeIntent } from './resolveTradeIntent';
import { BuildTradeLinkResult, ResolvedTradeIntent, TradeIntent } from './types';

export async function buildTradeLink(
  input: string,
  league: string,
): Promise<BuildTradeLinkResult> {
  let intent: TradeIntent | undefined;
  let resolved: ResolvedTradeIntent | undefined;
  let compiledQuery: unknown;

  try {
    const normalizedLeague = league.trim();
    if (!normalizedLeague) throw new Error('League is required.');
    if (normalizedLeague.length > 100) throw new Error('League name is too long.');

    intent = await parseTradeIntent(input);
    resolved = resolveTradeIntent(intent);
    compiledQuery = compileTradeQuery(resolved, normalizedLeague);

    if (isTradeMockMode()) {
      const mockSearch = createMockTradeSearch(compiledQuery, normalizedLeague);
      return {
        ok: true,
        url: mockSearch.url,
        searchId: mockSearch.searchId,
        intent,
        resolved,
        compiledQuery,
        rawResponse: mockSearch.rawResponse,
      };
    }

    const search = await createOfficialTradeSearch(compiledQuery, normalizedLeague);
    return {
      ok: true,
      url: buildOfficialTradeUrl(search.searchId, normalizedLeague),
      searchId: search.searchId,
      intent,
      resolved,
      compiledQuery,
      rawResponse: search.rawResponse,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not build trade link.',
      intent,
      resolved,
      compiledQuery,
    };
  }
}

