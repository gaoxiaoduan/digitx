import type {
  CityInfo,
  DomainRecord,
  EvaluationResult,
  GeneratorOptions,
  PrimaryCategory,
  ScoreContribution
} from './types.js';
import {
  DEFAULT_MIN_SCORE,
  MAX_CANDIDATES,
  MIN_SUPPORTED_SCORE
} from './candidate-contract.js';

export const GEEK_ANCHORS = [
  '256',
  '512',
  '1024',
  '2048',
  '4096',
  '8192',
  '65536',
  '404',
  '500',
  '502',
  '127001',
  '8080',
  '3306',
  '5432',
  '6379'
] as const;

export const PUBLIC_MEMORY_ANCHORS = [
  '12306',
  '12345',
  '12315',
  '10086',
  '10010',
  '10000',
  '110',
  '119',
  '120',
  '95588',
  '95566',
  '95555',
  '95533',
  '95599',
  '95511',
  '996'
] as const;

export const LUCKY_ANCHORS = ['168', '518', '528', '666', '888', '999', '520', '521', '1314', '3344'] as const;
const LUCKY_PHRASES = ['5201314', '1314520'] as const;

export const CITY_AREA_CODES: CityInfo[] = [
  { code: '010', city: '北京' },
  { code: '021', city: '上海' },
  { code: '020', city: '广州' },
  { code: '0755', city: '深圳' },
  { code: '0571', city: '杭州' },
  { code: '028', city: '成都' },
  { code: '025', city: '南京' },
  { code: '022', city: '天津' },
  { code: '023', city: '重庆' },
  { code: '027', city: '武汉' },
  { code: '029', city: '西安' }
];

interface QualityReason {
  id: string;
  label: string;
  category: PrimaryCategory;
  family: 'structure' | 'lucky' | 'geek' | 'public-memory' | 'date' | 'city';
  baseScore: number;
  description: string;
  tags: string[];
}

interface CandidateRule {
  recognize(number: string): QualityReason | null;
  enumerate(): Iterable<string>;
}

const CATEGORY_TIE_PRIORITY: Record<PrimaryCategory, number> = {
  纪念日期号: 6,
  城市名片号: 5,
  极客神号: 4,
  大众记忆号: 3,
  吉祥寓意号: 2,
  极品结构号: 1
};

const BREVITY_POINTS: Record<number, number> = { 6: 6, 7: 3, 8: 0 };
const ASCENDING_DIGITS = '0123456789';
const DESCENDING_DIGITS = '9876543210';

function isNumericCandidate(number: string): boolean {
  return /^[0-9]{6,8}$/.test(number);
}

function isPureRepeat(value: string): boolean {
  return new Set(value).size === 1;
}

function isFullStraight(value: string): boolean {
  return ASCENDING_DIGITS.includes(value) || DESCENDING_DIGITS.includes(value);
}

function hasEdgeOutlier(value: string): boolean {
  if (value.length < 2) return false;
  return (
    isPureRepeat(value.slice(0, -1)) && value.at(-1) !== value[0]
  ) || (
    isPureRepeat(value.slice(1)) && value[0] !== value[1]
  );
}

function isLargeRepeatedBlock(value: string): boolean {
  if (value.length === 6) {
    return isPureRepeat(value.slice(0, 3)) && isPureRepeat(value.slice(3)) && value[0] !== value[3];
  }
  if (value.length === 8) {
    return isPureRepeat(value.slice(0, 4)) && isPureRepeat(value.slice(4)) && value[0] !== value[4];
  }
  return false;
}

function isShortestCycle(value: string): boolean {
  if (value.length < 4 || value.length % 2 !== 0) return false;
  const seed = value.slice(0, 2);
  return seed[0] !== seed[1] && seed.repeat(value.length / 2) === value;
}

function isPalindrome(value: string): boolean {
  return value === [...value].reverse().join('');
}

function isPairedStraight(value: string): boolean {
  if (value.length !== 6 && value.length !== 8) return false;
  const digits: string[] = [];
  for (let index = 0; index < value.length; index += 2) {
    if (value[index] !== value[index + 1]) return false;
    digits.push(value[index]);
  }
  return isFullStraight(digits.join(''));
}

const strongStructureRule: CandidateRule = {
  recognize(number) {
    if (isPureRepeat(number)) {
      return {
        id: 'pure-repeat',
        label: '纯重复结构',
        category: '极品结构号',
        family: 'structure',
        baseScore: 92,
        description: `${number[0]} 的纯重复连号`,
        tags: ['纯重复', `${number.length} 位短号`]
      };
    }

    if (hasEdgeOutlier(number)) {
      return {
        id: 'edge-near-repeat',
        label: '边缘近纯重复',
        category: '极品结构号',
        family: 'structure',
        baseScore: 88,
        description: '仅首位或末位变化的近纯重复结构',
        tags: ['近纯重复', '边缘变位']
      };
    }

    if (isFullStraight(number)) {
      return {
        id: 'full-straight',
        label: '完整顺子',
        category: '极品结构号',
        family: 'structure',
        baseScore: 88,
        description: `${ASCENDING_DIGITS.includes(number) ? '递增' : '递减'}完整顺子`,
        tags: ['完整顺子']
      };
    }

    if (isLargeRepeatedBlock(number)) {
      return {
        id: 'large-blocks',
        label: '大分组重复',
        category: '极品结构号',
        family: 'structure',
        baseScore: 88,
        description: number.length === 6 ? 'AAABBB 大分组结构' : 'AAAABBBB 大分组结构',
        tags: ['大分组', number.length === 6 ? 'AAABBB' : 'AAAABBBB']
      };
    }

    if (isShortestCycle(number)) {
      return {
        id: 'shortest-cycle',
        label: '最短周期循环',
        category: '极品结构号',
        family: 'structure',
        baseScore: 85,
        description: number.length === 6 ? 'ABABAB 最短周期循环' : 'ABABABAB 最短周期循环',
        tags: ['最短周期', '双数字循环']
      };
    }

    if (number === '123321') {
      return {
        id: 'mirrored-straight',
        label: '顺子镜像',
        category: '极品结构号',
        family: 'structure',
        baseScore: 88,
        description: '递增顺子与镜像回落的组合',
        tags: ['优质回文', '顺子镜像']
      };
    }

    if (isPairedStraight(number)) {
      return {
        id: 'paired-straight',
        label: '对子顺子',
        category: '极品结构号',
        family: 'structure',
        baseScore: 86,
        description: '成对数字组成的连续顺子',
        tags: ['优质对子', '对子顺子']
      };
    }

    if (number === '123123') {
      return {
        id: 'straight-seed-cycle',
        label: '顺子种子循环',
        category: '极品结构号',
        family: 'structure',
        baseScore: 77,
        description: '123 顺子种子构成的长周期循环',
        tags: ['支撑结构', '顺子种子', 'ABCABC']
      };
    }

    return null;
  },

  *enumerate() {
    const digits = [...ASCENDING_DIGITS];
    for (const length of [6, 7, 8]) {
      for (const digit of digits) yield digit.repeat(length);

      for (const dominant of digits) {
        for (const outlier of digits) {
          if (dominant === outlier) continue;
          yield dominant.repeat(length - 1) + outlier;
          yield outlier + dominant.repeat(length - 1);
        }
      }
    }

    for (const length of [6, 8]) {
      const blockLength = length / 2;
      for (const first of digits) {
        for (const second of digits) {
          if (first === second) continue;
          yield first.repeat(blockLength) + second.repeat(blockLength);
          yield (first + second).repeat(blockLength);
        }
      }
    }

    for (const sequence of [ASCENDING_DIGITS, DESCENDING_DIGITS]) {
      for (const length of [6, 7, 8]) {
        for (let start = 0; start <= sequence.length - length; start += 1) {
          yield sequence.slice(start, start + length);
        }
      }
    }

    for (const sequence of [ASCENDING_DIGITS, DESCENDING_DIGITS]) {
      for (const length of [6, 8]) {
        const pairedDigitCount = length / 2;
        for (let start = 0; start <= sequence.length - pairedDigitCount; start += 1) {
          yield [...sequence.slice(start, start + pairedDigitCount)]
            .map((digit) => digit.repeat(2))
            .join('');
        }
      }
    }

    yield '123321';
    yield '123123';
  }
};

type AnchorMatchKind = 'exact' | 'repeat' | 'padded';

interface AnchorMatch {
  anchor: string;
  kind: AnchorMatchKind;
  padding?: string;
}

const STRICT_PADDING_DIGITS: readonly string[] = ['0', '6', '8', '9'];

function minimumStrictPadding(anchor: string): number {
  return anchor.length >= 5 ? 1 : anchor.length === 4 ? 2 : 3;
}

function matchStrictAnchor(number: string, anchors: readonly string[]): AnchorMatch | null {
  for (const anchor of [...anchors].sort((left, right) => right.length - left.length)) {
    if (number === anchor) return { anchor, kind: 'exact' };
    if (number.length % anchor.length === 0 && anchor.repeat(number.length / anchor.length) === number) {
      return { anchor, kind: 'repeat' };
    }

    const minimumPadding = minimumStrictPadding(anchor);
    const placements = [
      [number.slice(0, anchor.length), number.slice(anchor.length)]
    ];
    if (anchor.length < 5) {
      placements.push([number.slice(-anchor.length), number.slice(0, -anchor.length)]);
    }
    for (const [candidateAnchor, padding] of placements) {
      if (
        candidateAnchor === anchor &&
        padding.length >= minimumPadding &&
        isPureRepeat(padding) &&
        STRICT_PADDING_DIGITS.includes(padding[0])
      ) {
        return { anchor, kind: 'padded', padding };
      }
    }
  }
  return null;
}

function* enumerateStrictAnchorNumbers(anchors: readonly string[]): Iterable<string> {
  for (const anchor of anchors) {
    if (anchor.length >= 6 && anchor.length <= 8) yield anchor;

    for (const length of [6, 7, 8]) {
      if (length % anchor.length === 0) {
        yield anchor.repeat(length / anchor.length);
      }

      const paddingLength = length - anchor.length;
      if (paddingLength < minimumStrictPadding(anchor)) continue;
      for (const digit of STRICT_PADDING_DIGITS) {
        const padding = digit.repeat(paddingLength);
        yield anchor + padding;
        if (anchor.length < 5) yield padding + anchor;
      }
    }
  }
}

function anchorDescription(match: AnchorMatch): string {
  if (match.kind === 'repeat') return `${match.anchor} 锚点完整重复`;
  if (match.kind === 'padded') return `${match.anchor} 锚点结合 ${match.padding} 强重复`;
  return `${match.anchor} 完整语义锚点`;
}

function createStrictAnchorRule(
  anchors: readonly string[],
  describeMatch: (match: AnchorMatch) => QualityReason
): CandidateRule {
  return {
    recognize(number) {
      const match = matchStrictAnchor(number, anchors);
      return match ? describeMatch(match) : null;
    },
    enumerate() {
      return enumerateStrictAnchorNumbers(anchors);
    }
  };
}

const geekIconRule = createStrictAnchorRule(
  GEEK_ANCHORS,
  (match) => ({
    id: `geek-${match.anchor}`,
    label: `极客锚点 ${match.anchor}`,
    category: '极客神号',
    family: 'geek',
    baseScore: match.kind === 'exact' ? 92 : match.kind === 'repeat' ? 89 : 86,
    description: anchorDescription(match),
    tags: ['极客锚点', match.anchor, match.kind === 'repeat' ? '锚点重复' : match.kind === 'padded' ? '强结构补位' : '完整锚点']
  })
);

const publicMemoryRule = createStrictAnchorRule(
  PUBLIC_MEMORY_ANCHORS,
  (match) => ({
    id: `public-${match.anchor}`,
    label: `大众记忆锚点 ${match.anchor}`,
    category: '大众记忆号',
    family: 'public-memory',
    baseScore: match.kind === 'exact' ? 92 : match.kind === 'repeat' ? 89 : 88,
    description: anchorDescription(match),
    tags: ['大众记忆锚点', match.anchor, match.kind === 'repeat' ? '锚点重复' : match.kind === 'padded' ? '强结构补位' : '完整锚点']
  })
);

const luckyMeaningRule: CandidateRule = {
  recognize(number) {
    if (isPureRepeat(number) && ['6', '8', '9'].includes(number[0])) {
      return {
        id: `lucky-pure-${number[0]}`,
        label: `吉祥数字 ${number[0]} 连号`,
        category: '吉祥寓意号',
        family: 'lucky',
        baseScore: 94,
        description: `${number[0]} 的吉祥寓意与纯重复结构组合`,
        tags: ['吉祥数字', number[0], '纯重复']
      };
    }

    if (LUCKY_PHRASES.includes(number as typeof LUCKY_PHRASES[number])) {
      return {
        id: 'lucky-love-phrase',
        label: '经典爱情数字短语',
        category: '吉祥寓意号',
        family: 'lucky',
        baseScore: 94,
        description: '经典爱情数字短语 5201314 / 1314520',
        tags: ['爱情寓意', '完整数字短语']
      };
    }

    for (const anchor of LUCKY_ANCHORS) {
      if (number.length % anchor.length === 0 && anchor.repeat(number.length / anchor.length) === number) {
        return {
          id: `lucky-repeat-${anchor}`,
          label: `吉祥锚点 ${anchor}`,
          category: '吉祥寓意号',
          family: 'lucky',
          baseScore: 88,
          description: `${anchor} 吉祥锚点完整重复`,
          tags: ['吉祥锚点', anchor, '锚点重复']
        };
      }
    }

    for (const anchor of LUCKY_ANCHORS) {
      const mirroredAnchor = [...anchor].reverse().join('');
      if (mirroredAnchor !== anchor && number === anchor + mirroredAnchor) {
        return {
          id: `lucky-mirror-${anchor}`,
          label: `吉祥锚点 ${anchor}`,
          category: '吉祥寓意号',
          family: 'lucky',
          baseScore: 88,
          description: `${anchor} 吉祥锚点与镜像结构组合`,
          tags: ['吉祥锚点', anchor, '优质回文']
        };
      }
    }

    const match = matchStrictAnchor(number, LUCKY_ANCHORS);
    if (!match || match.kind !== 'padded') return null;
    return {
      id: `lucky-padded-${match.anchor}`,
      label: `吉祥锚点 ${match.anchor}`,
      category: '吉祥寓意号',
      family: 'lucky',
      baseScore: 88,
      description: anchorDescription(match),
      tags: ['吉祥锚点', match.anchor, '强重复组合']
    };
  },

  *enumerate() {
    for (const digit of ['6', '8', '9']) {
      for (const length of [6, 7, 8]) yield digit.repeat(length);
    }
    yield* LUCKY_PHRASES;
    yield* enumerateStrictAnchorNumbers(LUCKY_ANCHORS);

    for (const anchor of LUCKY_ANCHORS) {
      const mirroredAnchor = [...anchor].reverse().join('');
      if (mirroredAnchor !== anchor) yield anchor + mirroredAnchor;
    }
  }
};

function parseGregorianDate(number: string): { year: number; month: number; day: number } | null {
  if (number.length !== 8) return null;
  const year = Number(number.slice(0, 4));
  const month = Number(number.slice(4, 6));
  const day = Number(number.slice(6, 8));
  if (year < 1900 || year > 2099 || month < 1 || month > 12 || day < 1) return null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth ? { year, month, day } : null;
}

const memorableDateRule: CandidateRule = {
  recognize(number) {
    const date = parseGregorianDate(number);
    if (!date) return null;
    const month = number.slice(4, 6);
    const day = number.slice(6, 8);
    const memorable = isPalindrome(number) || (number.slice(2, 4) === month && month === day);
    if (!memorable) return null;

    return {
      id: 'memorable-date',
      label: '强记忆真实日期',
      category: '纪念日期号',
      family: 'date',
      baseScore: 94,
      description: `${date.year}-${month}-${day} 真实日期与独立强记忆结构`,
      tags: ['真实日期', isPalindrome(number) ? '完整回文' : '年月日重复']
    };
  },

  *enumerate() {
    for (let year = 1900; year <= 2099; year += 1) {
      const yearString = String(year);
      yield yearString + [...yearString].reverse().join('');

      const suffix = yearString.slice(2);
      const suffixNumber = Number(suffix);
      if (suffixNumber >= 1 && suffixNumber <= 12) {
        yield yearString + suffix + suffix;
      }
    }
  }
};

function hasStrongSuffix(suffix: string): boolean {
  return (
    (suffix.length >= 2 && isPureRepeat(suffix)) ||
    (suffix.length >= 3 && isFullStraight(suffix)) ||
    (suffix.length >= 4 && isShortestCycle(suffix))
  );
}

const citySignatureRule: CandidateRule = {
  recognize(number) {
    for (const city of CITY_AREA_CODES) {
      if (!number.startsWith(city.code)) continue;
      const suffix = number.slice(city.code.length);
      if (!hasStrongSuffix(suffix)) continue;
      return {
        id: `city-${city.code}`,
        label: `${city.city}城市名片`,
        category: '城市名片号',
        family: 'city',
        baseScore: 90,
        description: `${city.city}区号 ${city.code} 结合强记忆后缀 ${suffix}`,
        tags: [
          '城市区号',
          city.city,
          isPureRepeat(suffix)
            ? '重复后缀'
            : isFullStraight(suffix)
              ? '顺子后缀'
              : '最短周期后缀'
        ]
      };
    }
    return null;
  },

  *enumerate() {
    for (const city of CITY_AREA_CODES) {
      for (const length of [6, 7, 8]) {
        const suffixLength = length - city.code.length;
        if (suffixLength < 2) continue;

        for (const digit of ASCENDING_DIGITS) {
          yield city.code + digit.repeat(suffixLength);
        }

        if (suffixLength < 3) continue;
        for (const sequence of [ASCENDING_DIGITS, DESCENDING_DIGITS]) {
          for (let start = 0; start <= sequence.length - suffixLength; start += 1) {
            yield city.code + sequence.slice(start, start + suffixLength);
          }
        }

        if (suffixLength % 2 !== 0) continue;
        for (const first of ASCENDING_DIGITS) {
          for (const second of ASCENDING_DIGITS) {
            if (first === second) continue;
            yield city.code + (first + second).repeat(suffixLength / 2);
          }
        }
      }
    }
  }
};

const candidateRules: readonly CandidateRule[] = [
  memorableDateRule,
  citySignatureRule,
  geekIconRule,
  publicMemoryRule,
  luckyMeaningRule,
  strongStructureRule
];

function hasAuspiciousMotif(number: string): boolean {
  return /66|88|99/.test(number);
}

function selectStrongestReason(reasons: QualityReason[]): QualityReason | null {
  const semanticReasons = reasons.filter((reason) => reason.family !== 'structure');
  return [...(semanticReasons.length > 0 ? semanticReasons : reasons)].sort(
    (left, right) =>
      right.baseScore - left.baseScore ||
      CATEGORY_TIE_PRIORITY[right.category] - CATEGORY_TIE_PRIORITY[left.category] ||
      left.id.localeCompare(right.id)
  )[0] ?? null;
}

function buildEvaluation(number: string, reasons: QualityReason[]): EvaluationResult {
  const strongest = selectStrongestReason(reasons);
  if (!strongest) {
    return {
      eligible: false,
      score: 0,
      category: null,
      tags: [],
      scoreBreakdown: [],
      patternDesc: '未发现足以入选的独立结构或语义'
    };
  }

  const scoreBreakdown: ScoreContribution[] = [
    { id: strongest.id, label: strongest.label, points: strongest.baseScore }
  ];
  let featureScore = strongest.baseScore;
  const supportingReasons = reasons
    .filter((reason) => reason.id !== strongest.id && reason.family !== strongest.family)
    .sort(
      (left, right) =>
        right.baseScore - left.baseScore ||
        CATEGORY_TIE_PRIORITY[right.category] - CATEGORY_TIE_PRIORITY[left.category] ||
        left.id.localeCompare(right.id)
    );
  const supportingFamilies = new Set<QualityReason['family']>();
  for (const reason of supportingReasons) {
    if (supportingFamilies.has(reason.family)) continue;
    supportingFamilies.add(reason.family);
    const supportingPoints = Math.min(2, Math.max(0, 94 - featureScore));
    if (supportingPoints === 0) continue;
    featureScore += supportingPoints;
    scoreBreakdown.push({
      id: `support-${reason.id}`,
      label: `支撑：${reason.label}`,
      points: supportingPoints
    });
  }

  const hasLuckyReason = reasons.some((reason) => reason.family === 'lucky');
  if (!hasLuckyReason && hasAuspiciousMotif(number)) {
    const motifPoints = Math.min(2, Math.max(0, 94 - featureScore));
    featureScore += motifPoints;
    if (motifPoints > 0) {
      scoreBreakdown.push({ id: 'auspicious-motif', label: '公认寓意数字', points: motifPoints });
    }
  }

  const brevity = BREVITY_POINTS[number.length] ?? 0;
  if (brevity > 0) {
    scoreBreakdown.push({ id: 'brevity', label: `${number.length} 位长度加成`, points: brevity });
  }
  const score = Math.min(100, featureScore + brevity);
  const tags = new Set(reasons.flatMap((reason) => reason.tags));
  if (!hasLuckyReason && hasAuspiciousMotif(number)) tags.add('公认寓意数字');

  return {
    eligible: score >= MIN_SUPPORTED_SCORE,
    score,
    category: strongest.category,
    tags: [...tags],
    scoreBreakdown,
    patternDesc: strongest.description
  };
}

export function evaluateNumber(number: string): EvaluationResult {
  if (!isNumericCandidate(number)) {
    return {
      eligible: false,
      score: 0,
      category: null,
      tags: [],
      scoreBreakdown: [],
      patternDesc: '仅支持 6、7、8 位纯数字'
    };
  }

  const reasons = candidateRules
    .map((rule) => rule.recognize(number))
    .filter((reason): reason is QualityReason => reason !== null);
  return buildEvaluation(number, reasons);
}

export type GeneratedCandidate = Omit<DomainRecord, 'status' | 'detail' | 'updatedAt'> & {
  tags: string[];
  scoreBreakdown: ScoreContribution[];
};

export function generateCandidates(options: GeneratorOptions = {}): GeneratedCandidate[] {
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  if (!Number.isFinite(minScore) || minScore < MIN_SUPPORTED_SCORE || minScore > 100) {
    throw new RangeError(`minScore must be between ${MIN_SUPPORTED_SCORE} and 100.`);
  }

  const normalizedTld = options.tld?.trim() || '.xyz';
  const tld = normalizedTld.startsWith('.') ? normalizedTld : `.${normalizedTld}`;
  const seeds = new Set<string>();
  for (const rule of candidateRules) {
    for (const number of rule.enumerate()) seeds.add(number);
  }

  return [...seeds]
    .map((number) => ({ number, evaluation: evaluateNumber(number) }))
    .filter(({ evaluation }) => evaluation.eligible && evaluation.category !== null && evaluation.score >= minScore)
    .map(({ number, evaluation }) => ({
      domain: `${number}${tld}`,
      number,
      score: evaluation.score,
      category: evaluation.category!,
      patternDesc: evaluation.patternDesc,
      tags: evaluation.tags,
      scoreBreakdown: evaluation.scoreBreakdown
    }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.number.length - right.number.length ||
        left.number.localeCompare(right.number)
    )
    .slice(0, MAX_CANDIDATES);
}
