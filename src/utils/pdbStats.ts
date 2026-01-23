/**
 * Parsed statistics from a PDB file
 */
export interface ProteinStats {
  /** Total number of residues (amino acids) */
  residueCount: number
  /** Total number of atoms */
  atomCount: number
  /** Average pLDDT confidence score (0-100) */
  averagePlddt: number
  /** Confidence category based on average pLDDT */
  confidenceLevel: 'Very High' | 'High' | 'Medium' | 'Low'
  /** Approximate protein dimensions in Angstroms */
  dimensions: {
    width: number
    height: number
    depth: number
  }
  /** Estimated molecular weight in kDa */
  molecularWeight: number
  /** Number of alpha carbon atoms (backbone) */
  backboneAtoms: number
}

/**
 * Average molecular weight per amino acid residue in Daltons
 */
const AVG_RESIDUE_WEIGHT = 110

/**
 * Parse a PDB file and extract interesting statistics
 */
export function parsePdbStats(pdbData: string): ProteinStats {
  const lines = pdbData.split('\n')
  
  const atoms: Array<{ x: number; y: number; z: number; bFactor: number; atomName: string; resSeq: number }> = []
  const residueSet = new Set<number>()
  
  for (const line of lines) {
    if (line.startsWith('ATOM')) {
      // PDB format is fixed-width columns
      // Columns 31-38: x coordinate
      // Columns 39-46: y coordinate
      // Columns 47-54: z coordinate
      // Columns 61-66: B-factor (pLDDT in ESMFold)
      // Columns 13-16: atom name
      // Columns 23-26: residue sequence number
      
      const x = parseFloat(line.substring(30, 38).trim())
      const y = parseFloat(line.substring(38, 46).trim())
      const z = parseFloat(line.substring(46, 54).trim())
      const bFactor = parseFloat(line.substring(60, 66).trim())
      const atomName = line.substring(12, 16).trim()
      const resSeq = parseInt(line.substring(22, 26).trim(), 10)
      
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        atoms.push({ x, y, z, bFactor, atomName, resSeq })
        residueSet.add(resSeq)
      }
    }
  }
  
  if (atoms.length === 0) {
    return {
      residueCount: 0,
      atomCount: 0,
      averagePlddt: 0,
      confidenceLevel: 'Low',
      dimensions: { width: 0, height: 0, depth: 0 },
      molecularWeight: 0,
      backboneAtoms: 0,
    }
  }
  
  // Calculate bounding box
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity
  
  for (const atom of atoms) {
    minX = Math.min(minX, atom.x)
    maxX = Math.max(maxX, atom.x)
    minY = Math.min(minY, atom.y)
    maxY = Math.max(maxY, atom.y)
    minZ = Math.min(minZ, atom.z)
    maxZ = Math.max(maxZ, atom.z)
  }
  
  // Calculate average pLDDT from CA atoms (one per residue)
  const caAtoms = atoms.filter(a => a.atomName === 'CA')
  const averagePlddt = caAtoms.length > 0
    ? caAtoms.reduce((sum, a) => sum + a.bFactor, 0) / caAtoms.length
    : 0
  
  // Determine confidence level
  let confidenceLevel: ProteinStats['confidenceLevel']
  if (averagePlddt >= 90) {
    confidenceLevel = 'Very High'
  } else if (averagePlddt >= 70) {
    confidenceLevel = 'High'
  } else if (averagePlddt >= 50) {
    confidenceLevel = 'Medium'
  } else {
    confidenceLevel = 'Low'
  }
  
  const residueCount = residueSet.size
  
  return {
    residueCount,
    atomCount: atoms.length,
    averagePlddt: Math.round(averagePlddt * 10) / 10,
    confidenceLevel,
    dimensions: {
      width: Math.round((maxX - minX) * 10) / 10,
      height: Math.round((maxY - minY) * 10) / 10,
      depth: Math.round((maxZ - minZ) * 10) / 10,
    },
    molecularWeight: Math.round((residueCount * AVG_RESIDUE_WEIGHT) / 100) / 10, // in kDa
    backboneAtoms: caAtoms.length,
  }
}

/**
 * Get a fun description based on the protein's characteristics
 * Uses multiple stat dimensions to create high variance in outputs
 */
export function getProteinPersonality(stats: ProteinStats, sequence: string): string {
  // Use sequence to create a deterministic "seed" for consistent results
  const seqHash = sequence.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)
  
  const parts: Array<string> = []
  
  // Shape descriptors based on aspect ratio
  const maxDim = Math.max(stats.dimensions.width, stats.dimensions.height, stats.dimensions.depth)
  const minDim = Math.min(stats.dimensions.width, stats.dimensions.height, stats.dimensions.depth)
  const aspectRatio = maxDim / (minDim || 1)
  
  const elongatedDescriptors = [
    "elegantly elongated",
    "reaching outward like an embrace",
    "stretched like a promise",
    "extending with quiet confidence",
    "unfolding like a story",
  ]
  
  const compactDescriptors = [
    "tightly wound together",
    "nestled into itself",
    "compact like a shared secret",
    "curled up like a comfortable silence",
    "folded inward with intention",
  ]
  
  const balancedDescriptors = [
    "harmoniously proportioned",
    "balanced like a good conversation",
    "evenly distributed",
    "symmetrically arranged",
    "proportioned with care",
  ]
  
  if (aspectRatio > 2.5) {
    parts.push(elongatedDescriptors[seqHash % elongatedDescriptors.length])
  } else if (aspectRatio < 1.4) {
    parts.push(compactDescriptors[(seqHash + 7) % compactDescriptors.length])
  } else {
    parts.push(balancedDescriptors[(seqHash + 3) % balancedDescriptors.length])
  }
  
  // Size descriptors based on residue count
  const tinyDescriptors = [
    "small but mighty",
    "concentrated essence",
    "distilled to its core",
    "minimal yet meaningful",
  ]
  
  const mediumDescriptors = [
    "substantial presence",
    "room to breathe",
    "space for complexity",
    "enough to hold memories",
  ]
  
  const largeDescriptors = [
    "expansive and intricate",
    "rich with detail",
    "layered with meaning",
    "complex enough for a lifetime",
  ]
  
  if (stats.residueCount < 20) {
    parts.push(tinyDescriptors[(seqHash + 11) % tinyDescriptors.length])
  } else if (stats.residueCount < 45) {
    parts.push(mediumDescriptors[(seqHash + 13) % mediumDescriptors.length])
  } else {
    parts.push(largeDescriptors[(seqHash + 17) % largeDescriptors.length])
  }
  
  // Uniqueness descriptors based on pLDDT (inverted)
  const uniqueness = 100 - stats.averagePlddt
  
  const veryUniqueDescriptors = [
    "unlike anything nature has seen",
    "a true original",
    "defying biological convention",
    "blazing its own trail",
    "one of a kind in every way",
  ]
  
  const uniqueDescriptors = [
    "distinctly yours",
    "carrying your signature",
    "marked by individuality",
    "bearing your fingerprint",
  ]
  
  const familiarDescriptors = [
    "echoing ancient patterns",
    "with hints of the familiar",
    "nodding to what came before",
  ]
  
  if (uniqueness > 60) {
    parts.push(veryUniqueDescriptors[(seqHash + 19) % veryUniqueDescriptors.length])
  } else if (uniqueness > 40) {
    parts.push(uniqueDescriptors[(seqHash + 23) % uniqueDescriptors.length])
  } else {
    parts.push(familiarDescriptors[(seqHash + 29) % familiarDescriptors.length])
  }
  
  // Connector words for flow
  const connectors = [" — ", ". ", ", and ", " with "]
  const connector1 = connectors[(seqHash + 31) % connectors.length]
  const connector2 = connectors[(seqHash + 37) % connectors.length]
  
  // Build the sentence with some structural variety
  const structures = [
    () => `${capitalize(parts[0])}${connector1}${parts[1]}${connector2}${parts[2]}.`,
    () => `${capitalize(parts[2])}${connector1}${parts[0]}${connector2}${parts[1]}.`,
    () => `${capitalize(parts[1])}. ${capitalize(parts[0])}${connector2}${parts[2]}.`,
    () => `${capitalize(parts[0])} and ${parts[2]}${connector1}${parts[1]}.`,
  ]
  
  return structures[seqHash % structures.length]()
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
