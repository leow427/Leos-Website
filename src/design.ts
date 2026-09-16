import type { CSSProperties } from 'react';

// Coordinates come from Figma’s 1254 × 1254 approved snapshot (33:4).
export const ARTBOARD_SIZE = 1254;
export const unit = (value: number) => `calc(100cqw * ${value} / ${ARTBOARD_SIZE})`;
export const place = (x: number, y: number, width: number, height: number): CSSProperties => ({
  left: unit(x),
  top: unit(y),
  width: unit(width),
  height: unit(height),
});
export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}.svg`;

export const stations = [
  { line: 'Brown', x: 540, y: 191, labelX: 580, labelY: 194 },
  { line: 'Red', x: 828, y: 214, labelX: 868, labelY: 216 },
  { line: 'Blue', x: 391.8928527832031, y: 355.8519287109375, labelX: 429, labelY: 327 },
  { line: 'Green', x: 910, y: 572, labelX: 950, labelY: 575 },
  { line: 'Orange', x: 939, y: 978, labelX: 981, labelY: 981 },
] as const;

export type PageName = 'About' | 'Projects' | 'Contact';
export const panelContent: Record<PageName, { heading: string; description: string }> = {
  About: { heading: 'A little more about Leo.', description: 'This stop is coming soon.' },
  Projects: { heading: 'Next stop: new projects.', description: 'Project details are coming soon.' },
  Contact: { heading: 'Let’s connect.', description: 'Contact details are coming soon.' },
};
