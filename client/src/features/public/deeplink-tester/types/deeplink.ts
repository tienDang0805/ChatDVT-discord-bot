export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export type LinkClassification = 'custom_scheme' | 'universal_link' | 'android_intent' | 'system' | 'unknown';

export interface ParsedDeeplink {
  raw: string;
  scheme: string;
  host: string;
  path: string;
  hash: string;
  params: QueryParam[];
  type: LinkClassification;
  isValid: boolean;
  errorMessage?: string;
  androidPackage?: string;
}

export interface DeeplinkPreset {
  id: string;
  name: string;
  category: 'vietnam' | 'social' | 'system' | 'standard' | 'custom';
  url: string;
  description: string;
  packageName?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title?: string;
  timestamp: number;
  isFavorite?: boolean;
}

export interface InspectionDetails {
  url: string;
  status: number | null;
  hasRedirect: boolean;
  contentType: string | null;
  isValidJson: boolean;
  errors: string[];
  warnings: string[];
  data: any;
}

export interface AssociationAuditResponse {
  domain: string;
  timestamp: number;
  ios: InspectionDetails;
  android: InspectionDetails;
}
