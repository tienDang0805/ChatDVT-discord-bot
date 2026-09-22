import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

interface CheckResult {
  url: string;
  status: number | null;
  hasRedirect: boolean;
  contentType: string | null;
  isValidJson: boolean;
  errors: string[];
  warnings: string[];
  data: any;
}

const sanitizeDomain = (input: string): string => {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split(':')[0];
  return cleaned;
};

const fetchUrlInfo = async (targetUrl: string, maxRedirects: number = 0): Promise<{
  status: number | null;
  hasRedirect: boolean;
  contentType: string | null;
  rawData: any;
  error?: string;
}> => {
  try {
    const response = await axios.get(targetUrl, {
      timeout: 8000,
      maxRedirects: maxRedirects,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const isRedirect = response.status >= 300 && response.status < 400;
    return {
      status: response.status,
      hasRedirect: isRedirect,
      contentType: response.headers['content-type'] || null,
      rawData: response.data
    };
  } catch (err: any) {
    if (err.response) {
      const isRedirect = err.response.status >= 300 && err.response.status < 400;
      return {
        status: err.response.status,
        hasRedirect: isRedirect,
        contentType: err.response.headers?.['content-type'] || null,
        rawData: err.response.data
      };
    }
    return {
      status: null,
      hasRedirect: false,
      contentType: null,
      rawData: null,
      error: err.message || 'Connection failed'
    };
  }
};

router.get('/deeplink/check-association', async (req: Request, res: Response) => {
  const rawDomain = req.query.domain as string;
  if (!rawDomain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const domain = sanitizeDomain(rawDomain);
  if (!domain || !domain.includes('.')) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  const aasaUrl = `https://${domain}/.well-known/apple-app-site-association`;
  const aasaFallbackUrl = `https://${domain}/apple-app-site-association`;
  const assetlinksUrl = `https://${domain}/.well-known/assetlinks.json`;

  const iosResult: CheckResult = {
    url: aasaUrl,
    status: null,
    hasRedirect: false,
    contentType: null,
    isValidJson: false,
    errors: [],
    warnings: [],
    data: null
  };

  const aasaFetch = await fetchUrlInfo(aasaUrl, 0);
  let activeAasaFetch = aasaFetch;

  if (aasaFetch.status !== 200) {
    const fallbackFetch = await fetchUrlInfo(aasaFallbackUrl, 0);
    if (fallbackFetch.status === 200) {
      activeAasaFetch = fallbackFetch;
      iosResult.url = aasaFallbackUrl;
      iosResult.warnings.push('AASA found at root path instead of recommended /.well-known/');
    }
  }

  iosResult.status = activeAasaFetch.status;
  iosResult.hasRedirect = activeAasaFetch.hasRedirect;
  iosResult.contentType = activeAasaFetch.contentType;

  if (activeAasaFetch.error) {
    iosResult.errors.push(`Network error: ${activeAasaFetch.error}`);
  }

  if (activeAasaFetch.hasRedirect) {
    iosResult.errors.push('Apple forbids HTTP redirects (301/302) for Universal Links association file');
  }

  if (activeAasaFetch.status === 200) {
    let parsedJson: any = null;
    if (typeof activeAasaFetch.rawData === 'object' && activeAasaFetch.rawData !== null) {
      parsedJson = activeAasaFetch.rawData;
      iosResult.isValidJson = true;
    } else if (typeof activeAasaFetch.rawData === 'string') {
      try {
        parsedJson = JSON.parse(activeAasaFetch.rawData);
        iosResult.isValidJson = true;
      } catch {
        iosResult.isValidJson = false;
        iosResult.errors.push('Response body is not valid JSON');
      }
    }

    if (parsedJson) {
      iosResult.data = parsedJson;
      if (!parsedJson.applinks) {
        iosResult.warnings.push('Missing "applinks" section in AASA file');
      } else {
        const details = parsedJson.applinks.details;
        if (!details || (Array.isArray(details) && details.length === 0)) {
          iosResult.warnings.push('"applinks.details" is empty');
        }
      }
    }
  } else if (activeAasaFetch.status) {
    iosResult.errors.push(`HTTP Status ${activeAasaFetch.status}: Failed to retrieve AASA file`);
  }

  const androidResult: CheckResult = {
    url: assetlinksUrl,
    status: null,
    hasRedirect: false,
    contentType: null,
    isValidJson: false,
    errors: [],
    warnings: [],
    data: null
  };

  const assetFetch = await fetchUrlInfo(assetlinksUrl, 5);
  androidResult.status = assetFetch.status;
  androidResult.hasRedirect = assetFetch.hasRedirect;
  androidResult.contentType = assetFetch.contentType;

  if (assetFetch.error) {
    androidResult.errors.push(`Network error: ${assetFetch.error}`);
  }

  if (assetFetch.status === 200) {
    let parsedJson: any = null;
    if (Array.isArray(assetFetch.rawData)) {
      parsedJson = assetFetch.rawData;
      androidResult.isValidJson = true;
    } else if (typeof assetFetch.rawData === 'string') {
      try {
        parsedJson = JSON.parse(assetFetch.rawData);
        androidResult.isValidJson = Array.isArray(parsedJson);
        if (!Array.isArray(parsedJson)) {
          androidResult.warnings.push('assetlinks.json root should be an Array of statements');
        }
      } catch {
        androidResult.isValidJson = false;
        androidResult.errors.push('Response body is not valid JSON');
      }
    }

    if (parsedJson && Array.isArray(parsedJson)) {
      androidResult.data = parsedJson;
      const hasHandleAll = parsedJson.some((stmt: any) =>
        Array.isArray(stmt.relation) && stmt.relation.includes('delegate_permission/common.handle_all_urls')
      );
      if (!hasHandleAll) {
        androidResult.warnings.push('Missing "delegate_permission/common.handle_all_urls" permission relation');
      }
    }
  } else if (assetFetch.status) {
    androidResult.errors.push(`HTTP Status ${assetFetch.status}: Failed to retrieve assetlinks.json`);
  }

  return res.json({
    domain,
    timestamp: Date.now(),
    ios: iosResult,
    android: androidResult
  });
});

export default router;
