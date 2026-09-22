import { ParsedDeeplink, QueryParam, LinkClassification } from '../types/deeplink';

export const parseDeeplink = (rawInput: string): ParsedDeeplink => {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      raw: '',
      scheme: '',
      host: '',
      path: '',
      hash: '',
      params: [],
      type: 'unknown',
      isValid: false,
    };
  }

  let classification: LinkClassification = 'unknown';
  let scheme = '';
  let host = '';
  let path = '';
  let hash = '';
  let params: QueryParam[] = [];
  let androidPackage: string | undefined = undefined;

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch) {
    scheme = schemeMatch[1].toLowerCase();
  }

  if (scheme === 'http' || scheme === 'https') {
    classification = 'universal_link';
    try {
      const parsedUrl = new URL(trimmed);
      host = parsedUrl.hostname;
      path = parsedUrl.pathname;
      hash = parsedUrl.hash;
      parsedUrl.searchParams.forEach((value, key) => {
        params.push({
          id: `${key}_${Math.random().toString(36).substring(2, 9)}`,
          key,
          value,
          enabled: true,
        });
      });
      return {
        raw: trimmed,
        scheme,
        host,
        path,
        hash,
        params,
        type: classification,
        isValid: true,
      };
    } catch {
      return {
        raw: trimmed,
        scheme,
        host: '',
        path: '',
        hash: '',
        params: [],
        type: classification,
        isValid: false,
        errorMessage: 'Invalid HTTP/HTTPS URL format',
      };
    }
  }

  if (scheme === 'intent') {
    classification = 'android_intent';
    const intentPkgMatch = trimmed.match(/package=([^;]+)/);
    if (intentPkgMatch) {
      androidPackage = intentPkgMatch[1];
    }
  } else if (['tel', 'mailto', 'sms', 'geo'].includes(scheme)) {
    classification = 'system';
  } else if (scheme) {
    classification = 'custom_scheme';
  }

  const hashIndex = trimmed.indexOf('#');
  let urlWithoutHash = trimmed;
  if (hashIndex !== -1) {
    hash = trimmed.slice(hashIndex);
    urlWithoutHash = trimmed.slice(0, hashIndex);
  }

  const queryIndex = urlWithoutHash.indexOf('?');
  let urlBeforeQuery = urlWithoutHash;
  let queryString = '';
  if (queryIndex !== -1) {
    urlBeforeQuery = urlWithoutHash.slice(0, queryIndex);
    queryString = urlWithoutHash.slice(queryIndex + 1);
  }

  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params.push({
        id: `${key}_${Math.random().toString(36).substring(2, 9)}`,
        key,
        value,
        enabled: true,
      });
    });
  }

  const withoutScheme = urlBeforeQuery.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/?\/?/, '');
  const slashIndex = withoutScheme.indexOf('/');

  if (slashIndex !== -1) {
    host = withoutScheme.slice(0, slashIndex);
    path = withoutScheme.slice(slashIndex);
  } else {
    host = withoutScheme;
    path = '';
  }

  return {
    raw: trimmed,
    scheme,
    host,
    path,
    hash,
    params,
    type: classification,
    isValid: !!scheme,
    androidPackage,
  };
};

export const rebuildUrl = (
  scheme: string,
  host: string,
  path: string,
  params: QueryParam[],
  hash: string
): string => {
  let base = '';
  if (scheme) {
    if (scheme === 'tel' || scheme === 'mailto' || scheme === 'sms') {
      base = `${scheme}:${host}${path}`;
    } else {
      base = `${scheme}://${host}${path.startsWith('/') ? path : (path ? `/${path}` : '')}`;
    }
  } else {
    base = `${host}${path}`;
  }

  const activeParams = params.filter(p => p.enabled && p.key.trim() !== '');
  if (activeParams.length > 0) {
    const sp = new URLSearchParams();
    activeParams.forEach(p => {
      sp.append(p.key, p.value);
    });
    const qs = sp.toString();
    if (qs) {
      base += `?${qs}`;
    }
  }

  if (hash) {
    base += hash.startsWith('#') ? hash : `#${hash}`;
  }

  return base;
};

export const generateAdbCommand = (url: string, packageName?: string): string => {
  const escapedUrl = url.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  const pkgArg = packageName && packageName.trim() ? ` ${packageName.trim()}` : '';
  return `adb shell am start -a android.intent.action.VIEW -d "${escapedUrl}"${pkgArg}`;
};

export const generateSimctlCommand = (url: string): string => {
  const escapedUrl = url.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  return `xcrun simctl openurl booted "${escapedUrl}"`;
};
