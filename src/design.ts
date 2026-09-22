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

export type ProjectImage = { file: string; alt: string; title?: string; width?: number; height?: number };

export type ProjectMedia =
  | { kind: 'image-pair'; images: [ProjectImage, ProjectImage]; drawings?: boolean }
  | { kind: 'image'; image: ProjectImage; caption?: string }
  | { kind: 'model'; file: string; alt: string; orientation?: string; cameraOrbit?: string };

export type Project = {
  id: string;
  label: string;
  line: keyof typeof routeColors;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  introduction?: {
    heading?: string;
    paragraphs: string[];
  };
  reflection?: string;
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
        'My gaming laptop was dramatic one day and its LCD panel somehow broke without even being touched while I was working!! I didn’t want this nice gaming laptop to go to waste, but it certainly was not going to be a laptop anymore, so I decided I wanted to take the screen off and try to make it a wall mounted gaming console.',
        'The idea is that keyboard inserts into a recessed area, and a lid snaps into the top of the holder, and keeps the computer in place. A 120mm fan is installed in the back to intake more cool air, as this laptop gets very hot. The entire module will slot into some rails that the person either screws, or uses adhesive to stick to the wall.(I have not designed that yet).',
      ],
    },
    reflection: "I did kind of cheat though. I made the design for the back panel and the main compartment in a little under an hour over the summer and forgot about it, since I had to focus on more important things. But this assignment made me realize I didn't consider what would actually hold the computer securely in place, so I made the click fit top bracket.",
    media: [
      { kind: 'image-pair', images: [
        { file: 'razer-exploded.png', alt: 'Exploded view of the Razer enclosure, front frame, and cooling fan' },
        { file: 'razer-enclosure.png', alt: 'Assembled Razer enclosure with front cooling fan' },
      ] },
      { kind: 'model', file: 'razer.glb', alt: 'Interactive 3D model of the Razer enclosure' },
    ] },
  { id: 'week-2', label: 'Week 2', line: 'Brown', x: 540, y: 169.8519287109375,
    labelX: 451, labelY: 141,
    introduction: { paragraphs: ["While this is a very simple design, it was hard to get the form factor I liked the most right. The idea is a little CTA tracker powered by an AMOLED display + ESP32 module I found online. I've also been wanting to learn how to use BLE for communication instead of Wi-Fi, so I am hoping this project could make great use of it."] },
    media: [
      { kind: 'image', caption: "I mocked up and drew this little CTA UI in pixelart.com, and then did some \"poor man's physics\" to try to get the look I wanted, basing the frost on what a resin printer can realistically do. So while it was super easy to design, I had to go through like 5 form factors and frosted appearances before I got the case and UI to look how I wanted it to. And like I said, I love simplicity.", image: {
        file: 'week-2/tracker-render.png', title: 'Transit tracker',
        alt: 'Rendered transit tracker with a rounded enclosure, carrying loop, and Chicago bus and train arrivals on its screen',
        width: 1600, height: 900,
      } },
      { kind: 'image-pair', drawings: true, images: [
        { file: 'week-2/lid-drawing.png', title: 'Lid drawing',
          alt: 'Technical drawing of the tracker lid and loop with its parts list', width: 2012, height: 1424 },
        { file: 'week-2/assembly-drawing.png', title: 'Assembly drawing',
          alt: 'Technical drawing of the tracker back, four screws, and assembly parts list', width: 1898, height: 1378 },
      ] },
      { kind: 'model', file: 'week-2/tracker.glb', alt: 'Interactive 3D model of the Chicago transit tracker enclosure',
        orientation: '0deg 0deg 0deg', cameraOrbit: '25deg 70deg 105%' },
    ] },
];

export type PageName = 'Projects' | 'Contact';
export type InformationPage = Exclude<PageName, 'Projects'>;
export const panelContent: Record<InformationPage, { heading: string; paragraphs: string[] }> = {
  Contact: {
    heading: 'Contact',
    paragraphs: [
      'Contact me however! Ill respond faster on instagram though',
      'Email: walshleo427@gmail.com',
      'Instagram: l_.walsh',
    ],
  },
};
