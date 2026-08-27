---
name: StokMate Web
description: An operational product-catalogue workspace for central-office retail teams.
colors:
  background: "oklch(0.985 0.002 247.8)"
  foreground: "oklch(0.23 0.03 260)"
  surface: "oklch(1 0 0)"
  primary: "oklch(0.52 0.19 260)"
  secondary: "oklch(0.94 0.02 260)"
  muted: "oklch(0.95 0.01 260)"
  border: "oklch(0.9 0.015 260)"
  destructive: "oklch(0.58 0.22 25)"
typography:
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  control: "0.375rem"
  surface: "0.5rem"
spacing:
  compact: "0.75rem"
  standard: "1rem"
  spacious: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "2.5rem"
  surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
    padding: "{spacing.standard}"
---

# Design System: StokMate Web

## Overview

**Creative North Star: "The Operations Ledger"**

StokMate is a calm, credible work surface rather than a generic SaaS dashboard. Its visual language prioritizes scanning, comparison, and correction: data sits on quiet neutral surfaces, the indigo primary color is reserved for focus and action, and each control earns its space.

**Key Characteristics:**

- Dense, structured product information with a clear primary workspace.
- Restrained semantic color and textual context for every critical state.
- Shadcn/ui primitives and Tailwind semantic tokens remain the implementation foundation.

## Colors

The palette is a cool indigo-neutral system: tonal layering carries most structure and semantic colors only signal meaningful status.

### Primary

- **Operational Indigo:** used for focused actions, links, and keyboard focus.

### Neutral

- **Ledger Ground:** used for the page background and low-emphasis regions.
- **Paper Surface:** used for editable controls and primary work surfaces.
- **Quiet Rule:** used for boundaries that organize data without visual noise.

**The Reserved Accent Rule.** Primary color clarifies action and focus; it never becomes decoration.

## Typography

**Display Font:** Inter (with system sans-serif fallback)

**Body Font:** Inter (with system sans-serif fallback)

**Character:** Compact, legible, and neutral. Weight and spacing establish hierarchy before color does.

### Hierarchy

- **Title:** medium-weight 1.875rem heading for page-level identity.
- **Body:** standard sans-serif text for table data and supporting content.
- **Label:** 0.875rem medium-weight text for fields and controls.

## Layout

The product list is the primary workspace: a concise heading, a compact stock summary, then search, filters, and the data table in one continuous work area. Desktop and tablet layouts begin at 768px; narrow layouts retain controls and horizontal table access without discarding information.

## Elevation & Depth

Depth comes primarily from tonal separation and hairline borders. Shadows are low and structural, used only to distinguish a primary work surface from the page ground.

## Shapes

Controls use restrained, gently rounded corners. Large radii and nested card stacks are avoided; a line, spacing change, or background tone should do the work first.

## Components

### Buttons

- **Shape:** restrained corner treatment.
- **Primary:** indigo action for a single clear task in a region.
- **Hover / Focus:** subtle tonal change with a visible focus ring.

### Badges

- **Style:** compact supporting labels only.
- **State:** never the sole carrier of stock or status meaning.

### Cards / Containers

- **Corner Style:** restrained surface rounding.
- **Background:** semantic surface token.
- **Border:** quiet divider token.

### Inputs / Fields

- **Style:** clear outline, neutral surface, readable labels.
- **Focus:** semantic focus ring.

### Navigation

- **Style:** compact, task-oriented header controls with no decorative chrome.

## Do's and Don'ts

### Do:

- **Do** keep dense information aligned to a stable grid.
- **Do** pair stock and status color with readable labels or values.
- **Do** preserve Turkish/English and light/dark/system themes.

### Don't:

- **Don't** use generic SaaS gradients, glass, oversized KPI tiles, or decorative iconography.
- **Don't** create nested cards where one work surface and dividers communicate hierarchy.
- **Don't** turn every status into a prominent chip.
