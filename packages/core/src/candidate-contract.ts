import type { DomainDatabase, GeneratorConfig } from './types.js';

export const GENERATOR_VERSION = '3.0.0';
export const DEFAULT_MIN_SCORE = 85;
export const MIN_SUPPORTED_SCORE = 80;
export const MAX_CANDIDATES = 5000;

export interface CandidateDatabaseOptions {
  generatorVersion?: string;
  delay?: number;
  minScore?: number;
  tld?: string;
}

export function candidateDatabaseConfig(options: CandidateDatabaseOptions = {}): GeneratorConfig {
  const requestedTld = options.tld?.trim() || '.xyz';
  return {
    delay: options.delay ?? 2000,
    minScore: options.minScore ?? DEFAULT_MIN_SCORE,
    tld: requestedTld.startsWith('.') ? requestedTld : `.${requestedTld}`
  };
}

export function createEmptyDomainDatabase(options: CandidateDatabaseOptions = {}): DomainDatabase {
  return {
    generatorVersion: options.generatorVersion ?? GENERATOR_VERSION,
    domains: {},
    stats: { total: 0, checked: 0, unchecked: 0, available: 0, registered: 0, error: 0 },
    config: candidateDatabaseConfig(options)
  };
}
