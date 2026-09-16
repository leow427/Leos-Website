import type { CSSProperties } from 'react';

// Coordinates come from Figma’s 1254 × 1254 approved snapshot (33:4).
export const ARTBOARD_SIZE = 1254;
export const unit = (value: number) => `calc(100cqw * ${value} / ${ARTBOARD_SIZE})`;
export const place = (x: number, y: number, width: number, height: number): CSSProperties => ({
  left: unit(x), top: unit(y), width: unit(width), height: unit(height),
});
export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}.svg`;
export const mediaAsset = (name: string) => `${import.meta.env.BASE_URL}media/${name}`;

export const routeColors = {
  Brown: '#854f0f', Red: '#d00b29', Blue: '#047fdf', Green: '#028a4c', Orange: '#fd821a',
} as const;

export type ProjectImage = { file: string; alt: string };

export type ProjectMedia =
  | { kind: 'image-pair'; images: [ProjectImage, ProjectImage] }
  | { kind: 'model'; file: string; alt: string };

export type Project = {
  id: string;
  label: string;
  line: keyof typeof routeColors;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  media: ProjectMedia[];
};

// Only published stops appear on the map and in the project index.
// Each project's line supplies the map, detail-page, and train accent color.
export const projects: Project[] = [
  { id: 'week-1', label: 'Week 1', line: 'Blue', x: 246.8928527832031, y: 229.8519287109375,
    labelX: 284, labelY: 201, media: [
      { kind: 'image-pair', images: [
        { file: 'razer-exploded.png', alt: 'Exploded view of the Razer enclosure, front frame, and cooling fan' },
        { file: 'razer-enclosure.png', alt: 'Assembled Razer enclosure with front cooling fan' },
      ] },
      { kind: 'model', file: 'razer.glb', alt: 'Interactive 3D model of the Razer enclosure' },
    ] },
];

export type PageName = 'About' | 'Projects' | 'Contact';
export type InformationPage = Exclude<PageName, 'Projects'>;
export const panelContent: Record<InformationPage, { heading: string; description: string }> = {
  About: { heading: 'A little more about Leo.', description: 'This stop is coming soon.' },
  Contact: { heading: 'Let’s connect.', description: 'Contact details are coming soon.' },
};
