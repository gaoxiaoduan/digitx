export type CheckStatus = 'unchecked' | 'checking' | 'available' | 'registered' | 'error';

export type PrimaryCategory =
  | '极品结构号'
  | '吉祥寓意号'
  | '极客神号'
  | '大众记忆号'
  | '纪念日期号'
  | '城市名片号';

export type DomainScore = number;

export interface ScoreContribution {
  id: string;
  label: string;
  points: number;
}

export interface DomainRecord {
  domain: string;
  number: string;
  score: DomainScore;
  category: PrimaryCategory;
  patternDesc: string;
  tags?: string[];
  scoreBreakdown?: ScoreContribution[];
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
  minScore: number;
  tld: string;
}

export interface GeneratorOptions {
  minScore?: number;
  tld?: string;
}

export interface EvaluationResult {
  eligible: boolean;
  score: DomainScore;
  category: PrimaryCategory | null;
  tags: string[];
  scoreBreakdown: ScoreContribution[];
  patternDesc: string;
}

export interface CityInfo {
  code: string;
  city: string;
}

export interface DomainDatabase {
  generatorVersion?: string;
  domains: Record<string, DomainRecord>;
  stats: DomainStats;
  config: GeneratorConfig;
}
