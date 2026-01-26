/**
 * FoldLogic - Converts names into amino acid sequences for protein folding.
 *
 * Uses a deterministic mapping table to convert English letters (A-Z) into
 * the 20-letter amino acid alphabet, with a "Heart Linker" between
 * the two names to ensure interesting folding shapes.
 *
 * Supports three linker strategies:
 * - Flexible Bond (GGSGGS): Smooth, flowing structures
 * - Structural Anchor (WPHWP): Angular, unique shapes
 * - True Love Bond (Cysteine bridges): Loop/circular structures
 */

/**
 * Linker strategy type for connecting two name sequences.
 */
export type LinkerStrategy = 'flexible' | 'anchor' | 'cysteine'

/**
 * Configuration for a linker strategy.
 */
export interface LinkerConfig {
  strategy: LinkerStrategy
  motif: string
  displayName: string
  description: string
}

/**
 * Configuration constants for each linker strategy.
 */
export const LINKER_CONFIGS: Record<LinkerStrategy, LinkerConfig> = {
  flexible: {
    strategy: 'flexible',
    motif: 'GGSGGS',
    displayName: 'Flexible Bond',
    description: 'A smooth, flowing connection between your names',
  },
  anchor: {
    strategy: 'anchor',
    motif: 'WPHWP',
    displayName: 'Structural Anchor',
    description: 'A bulky hinge that creates angular, unique shapes',
  },
  cysteine: {
    strategy: 'cysteine',
    motif: 'GGSGGS',
    displayName: 'True Love Bond',
    description: 'Creates a molecular loop - the strongest bond in nature',
  },
}

/**
 * Mapping table from English letters to amino acids.
 * The 20 standard amino acids are: A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y
 */
const LETTER_TO_AMINO: Record<string, string> = {
  A: 'A', // Alanine
  B: 'N', // -> Asparagine (B is ambiguous, often N or D)
  C: 'C', // Cysteine
  D: 'D', // Aspartic acid
  E: 'E', // Glutamic acid
  F: 'F', // Phenylalanine
  G: 'G', // Glycine
  H: 'H', // Histidine
  I: 'I', // Isoleucine
  J: 'L', // -> Leucine (J not standard)
  K: 'K', // Lysine
  L: 'L', // Leucine
  M: 'M', // Methionine
  N: 'N', // Asparagine
  O: 'Q', // -> Glutamine (O is pyrrolysine, rare)
  P: 'P', // Proline
  Q: 'Q', // Glutamine
  R: 'R', // Arginine
  S: 'S', // Serine
  T: 'T', // Threonine
  U: 'C', // -> Cysteine (U is selenocysteine, rare)
  V: 'V', // Valine
  W: 'W', // Tryptophan
  X: 'A', // -> Alanine (X is unknown)
  Y: 'Y', // Tyrosine
  Z: 'E', // -> Glutamic acid (Z is ambiguous, often E or Q)
}

/**
 * Default filler sequence for empty names.
 */
const DEFAULT_FILLER = 'AAA'

/**
 * Maximum sequence length for ESMFold.
 */
const MAX_SEQUENCE_LENGTH = 400

/**
 * Cyrillic to Latin transliteration map.
 * Covers Russian, Ukrainian, Bulgarian, etc.
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'E', Ж: 'ZH',
  З: 'Z', И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O',
  П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'KH', Ц: 'TS',
  Ч: 'CH', Ш: 'SH', Щ: 'SHCH', Ъ: '', Ы: 'Y', Ь: '', Э: 'E', Ю: 'YU',
  Я: 'YA',
  // Ukrainian specific
  І: 'I', Ї: 'YI', Є: 'YE', Ґ: 'G',
  // Lowercase
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
  і: 'i', ї: 'yi', є: 'ye', ґ: 'g',
}

/**
 * Greek to Latin transliteration map.
 */
const GREEK_TO_LATIN: Record<string, string> = {
  Α: 'A', Β: 'B', Γ: 'G', Δ: 'D', Ε: 'E', Ζ: 'Z', Η: 'I', Θ: 'TH',
  Ι: 'I', Κ: 'K', Λ: 'L', Μ: 'M', Ν: 'N', Ξ: 'X', Ο: 'O', Π: 'P',
  Ρ: 'R', Σ: 'S', Τ: 'T', Υ: 'Y', Φ: 'F', Χ: 'CH', Ψ: 'PS', Ω: 'O',
  α: 'a', β: 'b', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th',
  ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p',
  ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o',
}

/**
 * Transliterates non-Latin scripts to Latin characters.
 * Supports Cyrillic and Greek.
 */
function transliterate(str: string): string {
  return str
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? GREEK_TO_LATIN[char] ?? char)
    .join('')
}

/**
 * Normalizes a string by removing diacritics/accents and converting to ASCII.
 * Examples: é→e, ñ→n, ü→u, ø→o, ç→c
 */
function normalizeToAscii(str: string): string {
  return str
    .normalize('NFD') // Decompose accented characters (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
}

/**
 * Converts a single name to an amino acid sequence.
 * Handles accented characters and non-Latin scripts (Cyrillic, Greek).
 * Non-alphabetic characters are ignored.
 */
function nameToAminoSequence(name: string): string {
  return normalizeToAscii(transliterate(name))
    .toUpperCase()
    .split('')
    .filter((char) => /[A-Z]/.test(char))
    .map((char) => LETTER_TO_AMINO[char] || 'A')
    .join('')
}

/**
 * Options for creating a love sequence.
 */
export interface CreateLoveSequenceOptions {
  strategy?: LinkerStrategy
}

/**
 * Result of creating a love sequence.
 */
export interface CreateLoveSequenceResult {
  sequence: string
  strategy: LinkerStrategy
  name1Sequence: string
  name2Sequence: string
  linkerMotif: string
}

/**
 * Error result when sequence creation fails.
 */
export interface CreateLoveSequenceError {
  error: string
}

/**
 * Creates a "Love Sequence" from two names.
 *
 * Supports three linker strategies:
 * - "flexible": Name1 + GGSGGS + Name2 (smooth, flowing)
 * - "anchor": Name1 + WPHWP + Name2 (angular, unique shapes) - DEFAULT
 * - "cysteine": C + Name1 + GGSGGS + Name2 + C (loop/circular structures)
 *
 * @param name1 - First name (e.g., partner 1)
 * @param name2 - Second name (e.g., partner 2)
 * @param options - Optional configuration including linker strategy
 * @returns Structured result with sequence and metadata, or error
 *
 * @example
 * ```ts
 * const result = createLoveSequence('Alice', 'Bob')
 * // Uses default 'anchor' strategy: ALICE + WPHWP + NQN
 *
 * const result = createLoveSequence('Alice', 'Bob', { strategy: 'cysteine' })
 * // Uses cysteine strategy: C + ALICE + GGSGGS + NQN + C
 * ```
 */
export function createLoveSequence(
  name1: string,
  name2: string,
  options?: CreateLoveSequenceOptions,
): CreateLoveSequenceResult | CreateLoveSequenceError {
  // Default to 'anchor' strategy if not specified
  const strategy: LinkerStrategy = options?.strategy ?? 'anchor'
  const config = LINKER_CONFIGS[strategy]

  // Convert names to amino acid sequences
  const seq1 = nameToAminoSequence(name1)
  const seq2 = nameToAminoSequence(name2)

  // If either name produces an empty sequence, add filler amino acids
  const name1Sequence = seq1.length > 0 ? seq1 : DEFAULT_FILLER
  const name2Sequence = seq2.length > 0 ? seq2 : DEFAULT_FILLER

  const linkerMotif = config.motif

  // Build the sequence based on strategy
  let sequence: string
  if (strategy === 'cysteine') {
    // Cysteine strategy: C + Name1 + Linker + Name2 + C
    sequence = `C${name1Sequence}${linkerMotif}${name2Sequence}C`
  } else {
    // Flexible and anchor strategies: Name1 + Linker + Name2
    sequence = `${name1Sequence}${linkerMotif}${name2Sequence}`
  }

  // Validate sequence length
  if (sequence.length > MAX_SEQUENCE_LENGTH) {
    return {
      error: `Sequence too long (${sequence.length} chars, max ${MAX_SEQUENCE_LENGTH}). Try shorter names.`,
    }
  }

  return {
    sequence,
    strategy,
    name1Sequence,
    name2Sequence,
    linkerMotif,
  }
}

/**
 * Type guard to check if a result is an error.
 */
export function isCreateLoveSequenceError(
  result: CreateLoveSequenceResult | CreateLoveSequenceError,
): result is CreateLoveSequenceError {
  return 'error' in result
}

/**
 * Validates that a sequence is suitable for ESMFold.
 * ESMFold has a maximum sequence length of 400 amino acids.
 */
export function validateSequenceLength(sequence: string): {
  isValid: boolean
  error?: string
} {
  if (sequence.length === 0) {
    return { isValid: false, error: 'Sequence is empty' }
  }
  if (sequence.length > MAX_SEQUENCE_LENGTH) {
    return {
      isValid: false,
      error: `Sequence too long (${sequence.length} chars, max ${MAX_SEQUENCE_LENGTH})`,
    }
  }
  return { isValid: true }
}
