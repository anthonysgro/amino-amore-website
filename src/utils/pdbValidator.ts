/**
 * PDB Validator Utility
 *
 * Validates PDB (Protein Data Bank) format text to ensure it contains
 * the required structure data for 3D visualization.
 */

export interface PDBValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates PDB format text for required structure.
 *
 * @param pdbText - Raw PDB format text from ESMFold API
 * @returns Validation result with isValid flag and optional error message
 *
 * Requirements: 5.1, 5.2, 5.3
 */
export function validatePDB(pdbText: string | null | undefined): PDBValidationResult {
  // Check for empty/null input
  if (pdbText === null || pdbText === undefined) {
    return { isValid: false, error: 'PDB data is empty' }
  }

  if (typeof pdbText !== 'string') {
    return { isValid: false, error: 'PDB data must be a string' }
  }

  if (pdbText.trim().length === 0) {
    return { isValid: false, error: 'PDB data is empty' }
  }

  // Check for required ATOM records
  // PDB ATOM records start with "ATOM" followed by spaces and atom serial number
  const hasAtomRecords = /^ATOM\s+/m.test(pdbText)

  if (!hasAtomRecords) {
    return { isValid: false, error: 'PDB missing ATOM records' }
  }

  return { isValid: true }
}
