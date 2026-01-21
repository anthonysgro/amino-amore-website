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
 * Converts a single name to an amino acid sequence.
 * Only alphabetic characters are converted; others are ignored.
 */
function nameToAminoSequence(name: string): string {
  return name
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
  options?: CreateLoveSequenceOptions
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
  result: CreateLoveSequenceResult | CreateLoveSequenceError
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
