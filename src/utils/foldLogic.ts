/**
 * FoldLogic - Converts names into amino acid sequences for protein folding.
 *
 * Uses a deterministic mapping table to convert English letters (A-Z) into
 * the 20-letter amino acid alphabet, with a "Heart Linker" (GGSGGS) between
 * the two names to ensure interesting folding shapes.
 */

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
 * Heart Linker - A flexible bridge between the two names.
 * GGSGGS is a common flexible linker in protein engineering.
 */
const HEART_LINKER = 'GGSGGS'

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
 * Creates a "Love Sequence" from two names.
 * The sequence is: Name1 + Heart Linker + Name2
 *
 * @param name1 - First name (e.g., partner 1)
 * @param name2 - Second name (e.g., partner 2)
 * @returns Amino acid sequence ready for protein folding
 *
 * @example
 * ```ts
 * const sequence = createLoveSequence('Alice', 'Bob')
 * // Returns: 'ALICE' -> 'ALICE' + 'GGSGGS' + 'NQN' (BOB mapped)
 * ```
 */
export function createLoveSequence(name1: string, name2: string): string {
  const seq1 = nameToAminoSequence(name1)
  const seq2 = nameToAminoSequence(name2)

  // If either name produces an empty sequence, add filler amino acids
  const finalSeq1 = seq1.length > 0 ? seq1 : 'AAA'
  const finalSeq2 = seq2.length > 0 ? seq2 : 'AAA'

  return `${finalSeq1}${HEART_LINKER}${finalSeq2}`
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
  if (sequence.length > 400) {
    return {
      isValid: false,
      error: `Sequence too long (${sequence.length} chars, max 400)`,
    }
  }
  return { isValid: true }
}
