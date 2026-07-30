# DIGITX Context

A high-performance numeric domain finder and validator, targeting premium numeric domain patterns and validating availability via multi-stage DNS and WHOIS scanning.

## Language

**Numeric Domain**:
A domain name consisting exclusively or primarily of numeric digits (e.g. `8888.xyz`, `1024.xyz`).
_Avoid_: Number domain, digital domain

**Quality Score**:
A relative measure of a Numeric Domain's desirability based on its strongest characteristic, distinct supporting characteristics, and brevity. Overlapping descriptions of the same characteristic contribute only once; six-, seven-, and eight-digit numbers receive respective brevity contributions of six, three, and zero points, while an exceptional longer domain may still outrank an ordinary shorter one.
_Avoid_: Rarity score, price estimate

**Collection Tier**:
A Numeric Domain with a Quality Score from 95 through 100, representing an exceptionally scarce structure or iconic meaning.

**Premium Tier**:
A Numeric Domain with a Quality Score from 90 through 94 whose strongest characteristic is independently compelling.

**Preferred Tier**:
A Numeric Domain with a Quality Score from 85 through 89 and a clear structure or strong combination of desirable characteristics. This is the default minimum tier for a Premium Candidate.

**Expansion Tier**:
A Numeric Domain with a Quality Score from 80 through 84 that is considered only when broader discovery is explicitly requested.

**Primary Category**:
The single, mutually exclusive family that expresses the main reason a Numeric Domain is desirable and supports stable browsing and filtering. When several strong meanings apply, the category with the most complete and specific explanation wins; unresolved ties prefer Memorable Date, City Signature, Geek Icon, Public Memory, Lucky Meaning, then Premium Structure.
_Avoid_: Pattern, tag

**Pattern Tag**:
A non-exclusive characteristic that explains a Numeric Domain's recognizable structure or meaning; a domain may carry several Pattern Tags.
_Avoid_: Category, type

**Score Contribution**:
A named, independently explainable positive or negative component of a Quality Score. Contributions from overlapping descriptions of the same characteristic are consolidated before scoring.
_Avoid_: Debug message, pattern description

**Semantic Anchor**:
A recognized numeric sequence that gives a Numeric Domain a specific cultural, technical, civic, calendar, or geographic meaning. A strong Semantic Anchor determines the Primary Category ahead of generic structural characteristics.
_Avoid_: Keyword, pattern

**Premium Candidate**:
A generated Numeric Domain supported by a strong structure, a strong Semantic Anchor, or a meaningful combination of desirable characteristics. Merely satisfying a broad formal pattern is not sufficient.
_Avoid_: All pattern matches, exhaustive candidate

**Leading Zero**:
A zero at the beginning of a Numeric Domain. It is evaluated as part of the complete number and neither disqualifies the domain nor incurs a positional penalty by itself.
_Avoid_: Invalid padding

**Digit Four**:
The digit `4` is evaluated like any other digit and is neither filtered nor penalized by itself. Sequences containing `4` qualify or fail on the quality of their complete structure and meaning.
_Avoid_: Unlucky digit, forbidden digit

**Auspicious Motif**:
A digit or sequence with broadly recognized positive cultural meaning, such as `6`, `8`, or `9`. It may provide a limited semantic contribution but cannot make an otherwise weak number a Premium Candidate by itself.
_Avoid_: Good digit, mandatory digit

**Strong Structure**:
A scarce and immediately recognizable arrangement, such as a pure repeat, near-pure repeat, full straight, large repeated block, or shortest-period cycle, that can independently qualify a number as a Premium Candidate.

**Supporting Structure**:
A broad arrangement, such as a generic palindrome, paired sequence, or longer-period cycle, that qualifies only when its seed is independently desirable or it combines with another distinct valuable characteristic.
_Avoid_: Premium pattern

### Primary Categories

**极品结构号 (Premium Structure)**:
A Numeric Domain whose main appeal is a scarce, immediately recognizable arrangement such as repetition, a straight, a cycle, a mirror, or paired digits.

**吉祥寓意号 (Lucky Meaning)**:
A Numeric Domain whose main appeal is a culturally auspicious numeric phrase or motif. Curated Semantic Anchors cover prosperity and good fortune (`168`, `518`, `528`, `666`, `888`), longevity (`999`), and affection (`520`, `521`, `1314`, `3344`); concatenating two recognized anchors does not qualify unless the complete number forms a recognized phrase or strong combination.

**极客神号 (Geek Icon)**:
A Numeric Domain whose main appeal is a recognized computing or software reference. Curated Semantic Anchors cover binary-capacity numbers (`256`, `512`, `1024`, `2048`, `4096`, `8192`, `65536`), iconic Web statuses (`404`, `500`, `502`), loopback (`127001`), and common ports (`8080`, `3306`, `5432`, `6379`).
_Avoid_: 程序员优选

**大众记忆号 (Public Memory)**:
A Numeric Domain whose main appeal is a broadly recognized public-service number or social numeric symbol that is not specifically a computing reference. Curated Semantic Anchors cover public services (`12306`, `12345`, `12315`), communications (`10086`, `10010`, `10000`), emergency numbers (`110`, `119`, `120`), specific high-recognition financial services (`95588`, `95566`, `95555`, `95533`, `95599`, `95511`), and the social numeric symbol `996`.
_Avoid_: Bare `955`, 程序员优选

**纪念日期号 (Memorable Date)**:
A Numeric Domain representing a real Gregorian calendar date from 1900 through 2099 whose main appeal includes an exceptional independent memory feature, such as a full palindrome, meaningful repetition, or another Strong Structure. Being a valid date alone is insufficient.
_Avoid_: Ordinary birthday, calendar-shaped number

**城市名片号 (City Signature)**:
A Numeric Domain whose main appeal is one of the curated high-recognition city area codes (`010`, `021`, `020`, `0755`, `0571`, `028`, `025`, `022`, `023`, `027`, `029`) combined with a Strong Structure in the suffix. An area code followed by ordinary digits does not qualify.

**Blind Scan**:
Stage 1 validation using rapid concurrent DNS lookups to quickly filter out active domains.
_Avoid_: DNS check, quick check

**WHOIS Verification**:
Stage 2 throttled validation contacting WHOIS servers to confirm exact domain registration status.
_Avoid_: Slow scan, WHOIS check

**Scan Engine**:
The background scanning logic (running in Node.js via GitHub Actions) executing Stage 1 and Stage 2 validation.
_Avoid_: Worker, checker background
