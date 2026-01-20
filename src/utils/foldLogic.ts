/**
 * FoldedHearts - Biological Mapping Logic
 * Converts human names into valid amino acid sequences for protein folding
 */

// The 20 standard amino acids
const VALID_AMINO_ACIDS = new Set([
  'A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I',
  'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V'
]);

// Mapping for non-amino acid letters to their nearest valid amino acid
const LETTER_TO_AMINO: Record<string, string> = {
  B: 'D', // B (Asparagine or Aspartic acid) -> D (Aspartic acid)
  J: 'I', // J -> I (Isoleucine, structurally similar)
  O: 'K', // O -> K (Lysine, similar ring structure)
  U: 'V', // U -> V (Valine, one letter apart)
  X: 'A', // X (unknown) -> A (Alanine, simplest)
  Z: 'G', // Z (Glutamine or Glutamic acid) -> G (Glycine)
};

// Flexible linker sequence - allows the two name segments to fold independently
const HEART_LINKER = 'GGSGGS';

// Minimum sequence length for stable folding
const MIN_SEQUENCE_LENGTH = 20;

/**
 * Converts a single character to its corresponding amino acid
 */
export function charToAminoAcid(char: string): string {
  const upperChar = char.toUpperCase();
  
  // If it's already a valid amino acid, return it
  if (VALID_AMINO_ACIDS.has(upperChar)) {
    return upperChar;
  }
  
  // If it has a mapping, use that
  if (LETTER_TO_AMINO[upperChar]) {
    return LETTER_TO_AMINO[upperChar];
  }
  
  // For any other character (numbers, symbols), default to Alanine
  return 'A';
}

/**
 * Converts a name string to an amino acid sequence
 */
export function nameToSequence(name: string): string {
  return name
    .split('')
    .filter(char => /[A-Za-z]/.test(char)) // Only process letters
    .map(charToAminoAcid)
    .join('');
}

/**
 * Creates a "Love Protein" sequence from two names
 * Joins them with a flexible linker and ensures minimum length
 */
export function createLoveSequence(name1: string, name2: string): string {
  const seq1 = nameToSequence(name1);
  const seq2 = nameToSequence(name2);
  
  // Join with the heart linker
  let sequence = `${seq1}${HEART_LINKER}${seq2}`;
  
  // Pad with Alanine if too short for stable folding
  while (sequence.length < MIN_SEQUENCE_LENGTH) {
    sequence += 'A';
  }
  
  return sequence;
}

/**
 * Validates that a sequence contains only valid amino acids
 */
export function isValidSequence(sequence: string): boolean {
  return sequence.split('').every(char => VALID_AMINO_ACIDS.has(char));
}
