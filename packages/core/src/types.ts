export type CheckStatus = 'unchecked' | 'checking' | 'available' | 'registered' | 'error';

export type PatternType = string;
export type DomainScore = number;

export interface DomainRecord {
  domain: string;
  number: string;
  score: DomainScore;
  category: PatternType;
  patternDesc: string;
  status: CheckStatus;
  detail: string;
  updatedAt: string | null;
}

export interface DomainStats {
  total: number;
  checked: number;
  unchecked: number;
  available: number;
  registered: number;
  error: number;
}

export interface GeneratorConfig {
  delay: number;
  exclude4: boolean;
  minLength: number;
  maxLength: number;
  minScore: number;
  tld: string;
}

export interface GeneratorOptions {
  minLength?: number;
  maxLength?: number;
  excludeUnlucky4?: boolean;
  minScore?: number;
  tld?: string;
}

export interface EvaluationResult {
  score: DomainScore;
  category: PatternType;
  patternDesc: string;
}

export interface CityInfo {
  code: string;
  city: string;
}

export interface DomainDatabase {
  domains: Record<string, DomainRecord>;
  stats: DomainStats;
  config: GeneratorConfig;
}
