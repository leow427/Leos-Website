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
  introduction: {
    heading: string;
    paragraphs: string[];
  };
  reflection: string;
  media: ProjectMedia[];
};

// Only published stops appear on the map and in the project index.
// Each project's line supplies the map, detail-page, and train accent color.
export const projects: Project[] = [
  { id: 'week-1', label: 'Week 1', line: 'Blue', x: 178.1428527832031, y: 169.8519287109375,
    labelX: 215.25, labelY: 141,
    introduction: {
      heading: 'This is my click fit design!',
      paragraphs: [
        'My gaming laptop somehow was dramatic one day and its LCD panel broke without even being touched while I was working!! I didnt want this awesome computer to go to waste since it is quite nice, but it certainly was not going to be a laptop anymore, so I decided I wanted to take the screen off and try to make it a wall mounted gaming console.',
        'The idea is that keyboard inserts into a recessed area, and a lid snaps into the top of the holder, and keeps the computer in place. A 120mm fan is installed in the back to intake more cool air, as this laptop gets very hot. The entire module will slot into some rails that the person either screws, or uses adhesive to stick to the wall.(I have not designed that yet).',
      ],
    },
    reflection: "I did kind of cheat, this was a design I made in a little under an hour over the summer and forgot about with all the other things I was doing, but this assignment made me realize I didn't consider what would actually hold the computer, so I made the click fit top bracket.",
    media: [
      { kind: 'image-pair', images: [
        { file: 'razer-exploded.png', alt: 'Exploded view of the Razer enclosure, front frame, and cooling fan' },
        { file: 'razer-enclosure.png', alt: 'Assembled Razer enclosure with front cooling fan' },
      ] },
      { kind: 'model', file: 'razer.glb', alt: 'Interactive 3D model of the Razer enclosure' },
    ] },
];

export type PageName = 'Projects' | 'Contact';
export type InformationPage = Exclude<PageName, 'Projects'>;
export const panelContent: Record<InformationPage, { heading: string; paragraphs: string[] }> = {
  Contact: {
    heading: 'Contact',
    paragraphs: [
      'Contact me however! Ill respond faster on instagram tho!',
      'Email: walshleo427@gmail.com',
      'Instagram: l_.walsh',
    ],
  },
};
