import { recalculateStats } from './checker.js';
import {
  createEmptyDomainDatabase,
  type CandidateDatabaseOptions
} from './candidate-contract.js';
import type { GeneratedCandidate } from './generator.js';
import type { DomainDatabase } from './types.js';

export function reconcileCandidateDatabase(
  checkpoint: DomainDatabase | null,
  candidates: GeneratedCandidate[],
  options: CandidateDatabaseOptions = {}
): DomainDatabase {
  const domains: DomainDatabase['domains'] = {};

  for (const candidate of candidates) {
    const previous = checkpoint?.domains[candidate.domain];
    domains[candidate.domain] = {
      ...candidate,
      status: previous?.status ?? 'unchecked',
      detail: previous?.detail ?? '',
      updatedAt: previous?.updatedAt ?? null
    };
  }

  const database = createEmptyDomainDatabase(options);
  database.domains = domains;
  recalculateStats(database);
  return database;
}
