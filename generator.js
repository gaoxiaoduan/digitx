/**
 * Pure-Digit High-Value Domain Generator & Scorer Engine
 * 
 * Instead of slow, memory-intensive brute-forcing of up to 100 million numbers,
 * this engine uses a synthetic pattern-generation strategy. It constructs
 * high-value sequences directly using mathematical templates, scores them, 
 * categorizes them, and filters them according to premium domain standards.
 */

// Developer / Tech terms
const TECH_CONSTANTS = ['1024', '2048', '4096', '8192', '404', '500', '502', '127001', '12306', '996', '955'];
const LUCKY_SEGMENTS = ['168', '520', '521', '1314', '666', '888', '999', '518', '528', '3344'];

/**
 * Checks if a string contains unlucky '4' and is NOT part of a developer term
 * @param {string} str 
 * @returns {boolean} True if it contains generic unlucky 4
 */
function hasUnlucky4(str) {
    if (!str.includes('4')) return false;
    
    const len = str.length;
    const isPartOfAllowed = new Array(len).fill(false);
    const allowed = ['1024', '2048', '4096', '404'];
    
    for (const term of allowed) {
        let index = str.indexOf(term);
        while (index !== -1) {
            for (let i = 0; i < term.length; i++) {
                isPartOfAllowed[index + i] = true;
            }
            index = str.indexOf(term, index + 1);
        }
    }
    
    // Check if there is any '4' that is NOT part of an allowed term
    for (let i = 0; i < len; i++) {
        if (str[i] === '4' && !isPartOfAllowed[i]) {
            return true; // Unallowed '4' found
        }
    }
    return false;
}

/**
 * Detailed scoring and classification engine for a digit string.
 * Returns { score: number, category: string, patternDesc: string }
 * @param {string} numStr 
 * @param {boolean} exclude4 
 * @returns {object}
 */
function evaluateNumber(numStr, exclude4 = true) {
    if (exclude4 && hasUnlucky4(numStr)) {
        return { score: 0, category: '避讳数字4', patternDesc: '含有常规数字4（非极客组合）' };
    }

    const len = numStr.length;
    let score = 0;
    let category = '普通推荐';
    let patternDesc = '普通优质数字域名';

    // 1. PERFECT REPEAT (AAAAAA+)
    const isPureRepeat = new Set(numStr).size === 1;
    if (isPureRepeat) {
        const digit = numStr[0];
        const baseScore = (digit === '8' || digit === '9' || digit === '6') ? 100 : 95;
        return {
            score: baseScore,
            category: '至尊连号豹子',
            patternDesc: `纯全相同连号 ${digit} (AAAAAA+)`
        };
    }

    // 2. CONSECUTIVE STRAIGHTS
    const numArr = Array.from(numStr).map(Number);
    let isAscending = true;
    let isDescending = true;
    for (let i = 1; i < len; i++) {
        if (numArr[i] !== numArr[i-1] + 1) isAscending = false;
        if (numArr[i] !== numArr[i-1] - 1) isDescending = false;
    }
    if (isAscending || isDescending) {
        return {
            score: len >= 7 ? 98 : 95,
            category: '经典顺子',
            patternDesc: `${isAscending ? '递增' : '递减'}经典连号顺子 (${numStr})`
        };
    }

    // 3. CODER / DEVELOPER ELITE COMBINATIONS
    // e.g. 102404, 10241024, 123062, 127001
    const contains1024 = numStr.includes('1024');
    const contains404 = numStr.includes('404');
    const contains12306 = numStr.includes('12306');
    const contains127001 = numStr.includes('127001');

    if (contains1024 && contains404) {
        return {
            score: 96,
            category: '极客神号',
            patternDesc: '程序员双击: 1024 (程序员节) + 404 (找不到页面)'
        };
    }
    if (contains127001) {
        return {
            score: 95,
            category: '极客神号',
            patternDesc: '本地环回主机 IP (127.0.0.1)'
        };
    }
    if (contains1024 && len === 6) {
        // e.g., 102488, 102466, 881024, 102416
        const remaining = numStr.replace('1024', '');
        const isLucky = ['88', '66', '99', '16', '68'].includes(remaining);
        return {
            score: isLucky ? 94 : 90,
            category: '程序员优选',
            patternDesc: `极客 1024 携带精选尾数 (${remaining})`
        };
    }
    if (contains12306) {
        const remaining = numStr.replace('12306', '');
        const isLucky = ['2', '8', '6', '9', '1'].includes(remaining);
        return {
            score: isLucky ? 93 : 89,
            category: '程序员优选',
            patternDesc: `中国铁路客服 12306 经典组合 (${numStr})`
        };
    }

    // 4. CHINESE LUCKY PUNS COMBINATIONS
    // e.g. 5201314, 1314520, 168888
    if ((numStr.includes('520') || numStr.includes('521')) && numStr.includes('1314')) {
        return {
            score: 95,
            category: '国人吉祥号',
            patternDesc: '浪漫爱情誓言: 一生一世我爱你 (5201314 / 1314520)'
        };
    }
    if (numStr.startsWith('168') && (numStr.endsWith('888') || numStr.endsWith('8888') || numStr.endsWith('88888'))) {
        return {
            score: 94,
            category: '国人吉祥号',
            patternDesc: '一路发发发: 168 (一路发) + 连号 8s (发财)'
        };
    }
    if (numStr.startsWith('518') && (numStr.endsWith('888') || numStr.endsWith('168'))) {
        return {
            score: 91,
            category: '国人吉祥号',
            patternDesc: '我要发发发: 518 (我要发) + 财富组合'
        };
    }

    // 5. NEAR-PERFECT REPEATS (AAAAAB, ABBBBB)
    const uniqueDigits = new Set(numStr);
    if (uniqueDigits.size === 2) {
        // Find counts
        const counts = {};
        for (const char of numStr) {
            counts[char] = (counts[char] || 0) + 1;
        }
        const freq = Object.values(counts).sort((a, b) => b - a);
        // AAAAAB or ABBBBB (e.g. 888886 or 188888)
        if (freq[0] === len - 1) {
            const dominantDigit = Object.keys(counts).find(k => counts[k] === freq[0]);
            const isPremiumDominant = ['8', '6', '9'].includes(dominantDigit);
            return {
                score: isPremiumDominant ? 93 : 88,
                category: '极品豹子',
                patternDesc: `多重重复连号 ${dominantDigit} (多合一极品)`
            };
        }
        
        // AAAABBBB or AABBAABB
        if (len === 8) {
            if (freq[0] === 4 && freq[1] === 4) {
                // Check for AAAABBBB
                if (numStr.slice(0, 4) === numStr[0].repeat(4) && numStr.slice(4) === numStr[4].repeat(4)) {
                    return {
                        score: 91,
                        category: '双重连号',
                        patternDesc: `半对半分立双连号 (AAAABBBB)`
                    };
                }
                // Check for AABBAABB
                if (numStr.slice(0, 2) === numStr.slice(4, 6) && numStr.slice(2, 4) === numStr.slice(6, 8)) {
                    return {
                        score: 88,
                        category: '双重连号',
                        patternDesc: `节奏双重对子重复 (AABBAABB)`
                    };
                }
            }
        }

        // AAABBB
        if (len === 6 && freq[0] === 3 && freq[1] === 3) {
            if (numStr.slice(0, 3) === numStr[0].repeat(3) && numStr.slice(3) === numStr[3].repeat(3)) {
                return {
                    score: 90,
                    category: '双重连号',
                    patternDesc: `三叠双连号豹子 (AAABBB)`
                };
            }
        }
    }

    // 6. TRIPLE REPEAT PAIRS (AABBCC / AABBCCDD)
    if (len === 6) {
        if (numStr[0] === numStr[1] && numStr[2] === numStr[3] && numStr[4] === numStr[5]) {
            return {
                score: 87,
                category: '对子连号',
                patternDesc: `三对子叠号步步高 (AABBCC)`
            };
        }
    }
    if (len === 8) {
        if (numStr[0] === numStr[1] && numStr[2] === numStr[3] && numStr[4] === numStr[5] && numStr[6] === numStr[7]) {
            return {
                score: 88,
                category: '对子连号',
                patternDesc: `四对子华丽叠号 (AABBCCDD)`
            };
        }
    }

    // 7. PERIODIC / ALTERNATING (ABABAB / ABCABC)
    if (len === 6) {
        const abab = numStr.slice(0, 2);
        if (numStr === abab.repeat(3)) {
            return {
                score: 89,
                category: '交替循环号',
                patternDesc: `双数字节奏交替循环 (ABABAB)`
            };
        }
        const abc = numStr.slice(0, 3);
        if (numStr === abc.repeat(2)) {
            const scoreVal = abc === '168' ? 93 : 88;
            return {
                score: scoreVal,
                category: '交替循环号',
                patternDesc: `三数字周期叠字循环 (${abc}${abc})`
            };
        }
    }
    if (len === 8) {
        const abab = numStr.slice(0, 2);
        if (numStr === abab.repeat(4)) {
            return {
                score: 89,
                category: '交替循环号',
                patternDesc: `双数字长字节交替循环 (ABABABAB)`
            };
        }
        const abcd = numStr.slice(0, 4);
        if (numStr === abcd.repeat(2)) {
            return {
                score: 87,
                category: '交替循环号',
                patternDesc: `四数字大型交替循环 (ABCDABCD)`
            };
        }
    }

    // 8. MIRROR PALINDROMES
    let isPalindrome = true;
    for (let i = 0; i < len / 2; i++) {
        if (numStr[i] !== numStr[len - 1 - i]) {
            isPalindrome = false;
            break;
        }
    }
    if (isPalindrome) {
        return {
            score: len >= 7 ? 88 : 85,
            category: '对称镜像号',
            patternDesc: `左右完全对称回文镜像号 (${numStr})`
        };
    }

    // 9. GENERAL LUCKY SCORE (Contains 888, 666, 168, 520)
    let luckyCount = 0;
    if (numStr.includes('888')) luckyCount += 3;
    else if (numStr.includes('88')) luckyCount += 1.5;
    
    if (numStr.includes('666')) luckyCount += 2.5;
    else if (numStr.includes('66')) luckyCount += 1;
    
    if (numStr.includes('168')) luckyCount += 3;
    if (numStr.includes('520') || numStr.includes('521')) luckyCount += 2;
    if (numStr.includes('1314')) luckyCount += 2.5;

    if (luckyCount >= 5) {
        return {
            score: Math.min(85, 60 + luckyCount * 4),
            category: '国人吉祥号',
            patternDesc: `高浓度传统大吉数字搭配`
        };
    }

    return { score, category, patternDesc };
}

/**
 * Synthetically constructs premium digit domains without brute force
 * @param {object} options 
 * @returns {Array} List of scored candidate domain objects
 */
function generateCandidates(options = {}) {
    const {
        minLength = 6,
        maxLength = 8,
        excludeUnlucky4 = true,
        minScore = 60,
        tld = '.xyz'
    } = options;

    const formattedTld = tld.startsWith('.') ? tld : `.${tld}`;
    const candidates = new Set();

    // Helper to register a valid candidate
    const addCandidate = (numStr) => {
        const s = String(numStr);
        if (s.length >= minLength && s.length <= maxLength) {
            const evaluation = evaluateNumber(s, excludeUnlucky4);
            if (evaluation.score >= minScore) {
                candidates.add(JSON.stringify({
                    domain: `${s}${formattedTld}`,
                    number: s,
                    score: evaluation.score,
                    category: evaluation.category,
                    patternDesc: evaluation.patternDesc
                }));
            }
        }
    };

    // GENERATOR WORKFLOW 1: DEVELOPER/TECH COMBINATIONS
    for (const tech of TECH_CONSTANTS) {
        addCandidate(tech);
        // padding combinations for length 6, 7, 8
        for (const len of [6, 7, 8]) {
            const padLen = len - tech.length;
            if (padLen <= 0) continue;

            // Padding with lucky repeats
            const repeats = ['8', '6', '9', '0'];
            for (const r of repeats) {
                addCandidate(tech + r.repeat(padLen));
                addCandidate(r.repeat(padLen) + tech);
            }

            // Padding with standard numbers / sequences
            if (padLen === 1) {
                for (let d = 0; d <= 9; d++) {
                    addCandidate(tech + d);
                    addCandidate(d + tech);
                }
            } else if (padLen === 2) {
                const patterns = ['16', '68', '88', '66', '04', '80', '60'];
                for (const p of patterns) {
                    addCandidate(tech + p);
                    addCandidate(p + tech);
                }
                for (let d = 0; d <= 9; d++) {
                    addCandidate(tech + d + d);
                    addCandidate(String(d) + d + tech);
                }
            } else if (padLen === 3) {
                const patterns = ['168', '520', '888', '666', '111', '999'];
                for (const p of patterns) {
                    addCandidate(tech + p);
                    addCandidate(p + tech);
                }
            } else if (padLen === 4) {
                const patterns = ['1314', '8888', '6666', '1024', '4040', '8866'];
                for (const p of patterns) {
                    addCandidate(tech + p);
                    addCandidate(p + tech);
                }
            }
        }
    }

    // Inter-developer combos
    // e.g. 1024404, 4041024, 1024996, 9961024
    for (const t1 of TECH_CONSTANTS) {
        for (const t2 of TECH_CONSTANTS) {
            if (t1 !== t2) {
                addCandidate(t1 + t2);
            }
        }
    }

    // GENERATOR WORKFLOW 2: CHINESE LUCKY SEGMENTS MIXING
    for (const l1 of LUCKY_SEGMENTS) {
        addCandidate(l1);
        for (const len of [6, 7, 8]) {
            const padLen = len - l1.length;
            if (padLen <= 0) continue;

            const repeats = ['8', '6', '9'];
            for (const r of repeats) {
                addCandidate(l1 + r.repeat(padLen));
                addCandidate(r.repeat(padLen) + l1);
            }
        }
        for (const l2 of LUCKY_SEGMENTS) {
            addCandidate(l1 + l2);
            for (const r of ['8', '6']) {
                addCandidate(l1 + r + l2);
                addCandidate(l1 + l2 + r);
            }
        }
    }

    // GENERATOR WORKFLOW 3: REPEATERS & PAIRS & PERIODIC
    const digits = ['0', '1', '2', '3', '5', '6', '7', '8', '9'];
    for (const len of [6, 7, 8]) {
        // AAAAAA+
        for (const d of digits) {
            addCandidate(d.repeat(len));
        }

        // AAAAAB / ABBBBB
        for (const d1 of digits) {
            for (const d2 of digits) {
                if (d1 !== d2) {
                    addCandidate(d1.repeat(len - 1) + d2);
                    addCandidate(d1 + d2.repeat(len - 1));
                    addCandidate(d1.repeat(len - 2) + d2.repeat(2));
                    addCandidate(d1.repeat(2) + d2.repeat(len - 2));
                }
            }
        }

        // AAABBB (6) / AAAABBBB (8)
        if (len === 6) {
            for (const d1 of digits) {
                for (const d2 of digits) {
                    if (d1 !== d2) {
                        addCandidate(d1.repeat(3) + d2.repeat(3));
                    }
                }
            }
        }
        if (len === 8) {
            for (const d1 of digits) {
                for (const d2 of digits) {
                    if (d1 !== d2) {
                        addCandidate(d1.repeat(4) + d2.repeat(4));
                        addCandidate(d1.repeat(2) + d2.repeat(2) + d1.repeat(2) + d2.repeat(2)); // AABBAABB
                    }
                }
            }
        }

        // AABBCC (6) / AABBCCDD (8)
        if (len === 6) {
            for (const d1 of digits) {
                for (const d2 of digits) {
                    for (const d3 of digits) {
                        if (d1 !== d2 && d2 !== d3 && d1 !== d3) {
                            addCandidate(d1 + d1 + d2 + d2 + d3 + d3);
                        }
                    }
                }
            }
        }
        if (len === 8) {
            for (const d1 of digits) {
                for (const d2 of digits) {
                    for (const d3 of digits) {
                        for (const d4 of digits) {
                            if (d1 !== d2 && d2 !== d3 && d3 !== d4 && d1 !== d3 && d1 !== d4 && d2 !== d4) {
                                addCandidate(d1 + d1 + d2 + d2 + d3 + d3 + d4 + d4);
                            }
                        }
                    }
                }
            }
        }

        // ABABAB (6) / ABABABAB (8)
        for (const d1 of digits) {
            for (const d2 of digits) {
                if (d1 !== d2) {
                    const pair = d1 + d2;
                    if (len === 6) {
                        addCandidate(pair.repeat(3));
                    }
                    if (len === 8) {
                        addCandidate(pair.repeat(4));
                    }
                }
            }
        }

        // ABCABC (6)
        if (len === 6) {
            for (const d1 of digits) {
                for (const d2 of digits) {
                    for (const d3 of digits) {
                        if (d1 !== d2 && d2 !== d3 && d1 !== d3) {
                            addCandidate((d1 + d2 + d3).repeat(2));
                        }
                    }
                }
            }
        }
        
        // ABCDABCD (8)
        if (len === 8) {
            for (const d1 of digits) {
                for (const d2 of digits) {
                    for (const d3 of digits) {
                        for (const d4 of digits) {
                            if (d1 !== d2 && d2 !== d3 && d3 !== d4 && d1 !== d3 && d1 !== d4 && d2 !== d4) {
                                addCandidate((d1 + d2 + d3 + d4).repeat(2));
                            }
                        }
                    }
                }
            }
        }
    }

    // GENERATOR WORKFLOW 4: MIRRORS / PALINDROMES
    // abccba (6), abcdcba (7), abcddcba (8)
    for (let a = 0; a <= 9; a++) {
        for (let b = 0; b <= 9; b++) {
            if (a === b) continue;
            for (let c = 0; c <= 9; c++) {
                if (b === c || a === c) continue;
                // Length 6: abccba
                addCandidate(`${a}${b}${c}${c}${b}${a}`);
                // Length 7: abcdcba
                for (let d = 0; d <= 9; d++) {
                    if (d !== c && d !== b && d !== a) {
                        addCandidate(`${a}${b}${c}${d}${c}${b}${a}`);
                    }
                }
                // Length 8: abcddcba
                for (let d = 0; d <= 9; d++) {
                    if (d !== c && d !== b && d !== a) {
                        addCandidate(`${a}${b}${c}${d}${d}${c}${b}${a}`);
                    }
                }
            }
        }
    }

    // GENERATOR WORKFLOW 5: STRAIGHTS / SEQUENCES
    const straights = [
        '0123456789', '9876543210'
    ];
    for (const seq of straights) {
        for (const len of [6, 7, 8]) {
            for (let i = 0; i <= seq.length - len; i++) {
                addCandidate(seq.substring(i, i + len));
            }
        }
    }

    // Convert Set back to sorted array
    const sortedList = Array.from(candidates)
        .map(JSON.parse)
        .sort((a, b) => b.score - a.score);

    return sortedList;
}

module.exports = {
    evaluateNumber,
    generateCandidates,
    hasUnlucky4,
    TECH_CONSTANTS,
    LUCKY_SEGMENTS
};
