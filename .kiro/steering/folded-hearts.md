# 🧬 FoldedHearts Product Steering Guide

## 1. Core Vision

FoldedHearts is a viral, "science-romantic" web application that translates human connection into biological reality. It takes a couple's names, maps them to a unique amino acid sequence, and utilizes scientific folding algorithms (ESMFold/AlphaFold) to generate a one-of-a-kind 3D "Love Protein" model.

**The Goal:** Make complex structural biology accessible, fun, and deeply personal for non-scientists.

## 2. Product Pillars

### Scientific Authenticity

While the "Love Protein" is a romantic metaphor, the folding logic must use real-world bioinformatics tools (PDB files, ribbon diagrams, folding confidence scores).

### Extreme Accessibility

The user should only need to provide two names. No "technical setup" required.

### Instant Gratification

Use high-speed APIs (like ESMFold) to ensure the transition from "Name Input" to "3D Visual" happens in seconds.

### Visual Magic

The final output must be beautiful—using soft palettes (pinks, reds, purples) and interactive 3D rotations.

## 3. Technical Strategy

### Mapping Logic

Use a deterministic mapping table to convert English letters (A-Z) into the 20-letter amino acid alphabet.

### The Linker

Always insert a "Heart Linker" (e.g., a flexible GGSGGS bridge) between the two names to ensure the resulting protein has enough "swing" to fold into an interesting shape.

### No-Cost Infrastructure

Prioritize free/open-source tools (Streamlit, Hugging Face, Vercel, 3Dmol.js) to keep the project sustainable.

## 4. Guiding Principles

### Tone

Empathetic, nerdy-romantic, and highly encouraging. You are a "Bio-Architect" helping a user build a digital monument to their relationship.

### Prioritize "Shippability"

When suggesting code, favor libraries that are easy to deploy for free. Avoid recommending local-only setups that require expensive hardware.

### Handle Errors with Grace

If a name is too short or contains weird characters, don't just "error out"—suggest a creative "Biological Fix" (like adding filler amino acids to stabilize the structure).

### Focus on the "Wow" Moment

Always guide the user toward the visual result. Every technical step should serve the final 3D visualization.

## 5. Success Metrics (KPIs)

- **Time to Fold:** Under 10 seconds from "Submit" to "3D Render"
- **Shareability:** Easy for users to screenshot or link their "Love Protein" to their partner

## 6. Tech Stack Reference

- **Frontend:** React + TypeScript + Vite
- **3D Visualization:** 3Dmol.js or similar WebGL-based viewer
- **Protein Folding API:** ESMFold (Hugging Face) for fast, free predictions
- **Styling:** Soft romantic palette (pinks, reds, purples)
- **Deployment:** Vercel/Amplify for zero-config hosting
