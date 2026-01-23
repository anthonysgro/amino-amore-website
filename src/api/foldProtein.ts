import { createServerFn } from '@tanstack/react-start'

/**
 * Result returned from the ESMFold API server function
 */
export interface FoldProteinResult {
  pdb: string
  sequence: string
}

/**
 * Server function that calls the Meta ESMFold API to fold a protein sequence.
 * Runs on the server to bypass CORS restrictions.
 *
 * @param sequence - Amino acid sequence (max 400 characters)
 * @returns PDB data and the original sequence
 */
export const foldProteinFn = createServerFn({ method: 'POST' })
  .inputValidator((sequence: string) => {
    if (!sequence || sequence.length === 0) {
      throw new Error('Sequence is required')
    }
    if (sequence.length > 400) {
      throw new Error('Sequence too long (max 400 amino acids)')
    }
    return sequence
  })
  .handler(async ({ data: sequence }): Promise<FoldProteinResult> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      const response = await fetch(
        'https://api.esmatlas.com/foldSequence/v1/pdb/',
        {
          method: 'POST',
          body: sequence,
          headers: {
            'Content-Type': 'text/plain',
          },
          signal: controller.signal,
        },
      )

      if (!response.ok) {
        throw new Error(`ESMFold API error: ${response.status}`)
      }

      const pdb = await response.text()
      return { pdb, sequence }
    } finally {
      clearTimeout(timeout)
    }
  })
