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
  Purple: '#44268a', Brown: '#854f0f', Red: '#d00b29', Blue: '#047fdf', Green: '#028a4c', Orange: '#fd821a',
} as const;

export type ProjectImage = { file: string; alt: string; title?: string; width?: number; height?: number };

export type ProjectMedia =
  | { kind: 'video'; file: string; alt: string; width: number; height: number; poster?: string; autoplay?: boolean }
  | { kind: 'text'; text: string; link?: { href: string; label: string } }
  | { kind: 'obj-model'; file: string; material: string; alt: string }
  | { kind: 'collage'; images: ProjectImage[] }
  | { kind: 'image-pair'; images: [ProjectImage, ProjectImage]; drawings?: boolean }
  | { kind: 'image'; image: ProjectImage; caption?: string; captionPosition?: 'before' | 'after' }
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
    introduction: { paragraphs: ["While this is a very simple design, it was hard to get the form factor I liked the most. The idea is a little CTA tracker powered by an AMOLED display + ESP32 module I found online. I've also been wanting to learn how to use BLE for communication instead of Wi-Fi, so I am hoping this project could make great use of it."] },
    media: [
      { kind: 'image', caption: "I mocked up and drew this little CTA UI in pixelart.com, and then did some \"poor-mans physics\" to get the frosted case look that I wanted, basing the frost on what a resin printer can realistically do. So while it was super easy to design, I had to go through like 5 form factors and frosted appearances before I got the case and UI to look how I wanted it to. And like I said, I love simplicity.", image: {
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
  { id: 'week-3', label: 'Week 3', line: 'Purple', x: 572, y: 249.8519287109375,
    labelX: 622, labelY: 243,
    introduction: { paragraphs: ['I wanted to make a little magsafe phone charging stands for my iPhone. Apple has a feature where the phone acts like a clock and notification hub when magsafe is charging and the phone is horizontal. When I play video games I tend to lose track of time and miss important notifications. So now I can just set it down on the charger, and when I need it again, I can just go ahead and grab it.'] },
    media: [
      { kind: 'collage', images: [
        { file: 'week-3/finished-stand.jpeg', title: 'Finished charging stand', alt: 'Finished wooden charging stand on a desk', width: 1368, height: 1824 },
        { file: 'week-3/laser-cutting.jpeg', title: 'Laser-cut parts', alt: 'Wooden finger-jointed parts in the laser cutter', width: 1368, height: 1824 },
        { file: 'week-3/assembled-parts.jpeg', title: 'Assembled wooden parts', alt: 'Two assembled wooden wedge enclosures on a workbench', width: 1368, height: 1824 },
        { file: 'week-3/fit-gauge.jpeg', title: 'Fit gauge', alt: 'Laser-cut slot gauge held in a hand', width: 1368, height: 1824 },
        { file: 'week-3/material-fit.jpeg', title: 'Material fit test', alt: 'Testing cardboard thickness with a slot gauge', width: 1368, height: 1824 },
        { file: 'week-3/fusion-layout.png', title: 'Fusion cutting layout', alt: 'Fusion design showing the flat finger-jointed enclosure parts', width: 2374, height: 1242 },
      ] },
      { kind: 'image', caption: 'This was just a logo of yamaha that I liked, and I just added the text to the design and did a heat press of it.', captionPosition: 'before', image: { file: 'week-3/yamaha.jpeg', title: 'Yamaha design',
        alt: 'Red Yamaha logo and lettering on dark fabric', width: 1824, height: 1368 } },
    ] },
  { id: 'week-4', label: 'Week 4', line: 'Red', x: 828, y: 169.8519287109375,
    labelX: 876, labelY: 141,
    introduction: { paragraphs: ['My PCB worked! It was tough and I have some issues with one short, but my light blinked at the end.'] },
    media: [
      { kind: 'video', file: 'week-4/pcb-blinking.mp4', alt: 'Week 4 PCB blinking light demonstration', width: 720, height: 1280 },
      { kind: 'collage', images: [
        { file: 'week-4/assembled-pcb.jpeg', title: 'Assembled PCB', alt: 'Arduino Nano mounted on the finished circuit board', width: 1368, height: 1824 },
        { file: 'week-4/soldered-pcb.jpeg', title: 'Soldered PCB', alt: 'Copper side of the PCB with soldered components and curved smile detail', width: 1368, height: 1824 },
        { file: 'week-4/pcb-and-nano.jpeg', title: 'PCB and Arduino Nano', alt: 'Milled circuit board beside an Arduino Nano on the workbench', width: 1368, height: 1824 },
        { file: 'week-4/milling-pcb.jpeg', title: 'Milling the PCB', alt: 'CNC mill cutting the copper circuit board', width: 1368, height: 1824 },
        { file: 'week-4/milled-pcb.jpeg', title: 'Freshly milled PCB', alt: 'Finished circuit traces and board outline on the milling bed', width: 1368, height: 1824 },
        { file: 'week-4/pcb-design.png', title: 'PCB design', alt: 'PCB editor showing the Arduino Nano footprint, LED, resistor, and copper traces', width: 1982, height: 1248 },
      ] },
      { kind: 'image', image: {
        file: 'week-4/pcb-schematic.png', title: 'PCB circuit schematic',
        alt: 'Circuit schematic connecting Arduino Nano pin D4 through a resistor and LED to ground', width: 1420, height: 1036,
      } },
    ] },
  { id: 'week-5', label: 'Week 5', line: 'Orange', x: 935, y: 544,
    labelX: 1036, labelY: 548,
    introduction: { paragraphs: ["This week was 3d printing and 3d scanning week. I decided to make my stepmom a 3d printed lamp for her birthday, that is based off an instagram reel that I saw. I was on my explore page and saw this really cool way to hide layer lines in a lamp using a woven texture, and thought it would be a good challenge to try and make it myself. I followed a bunch of youtube tutorials, which sadly took forever. The fabric texture is just a height map that you can place using the texture extrude tool. You just upload a grayscale height map of what you want and extrude accordingly. I wanted the lamp to feel organic so I made it warped, which is made by adding a square sketch and then making a construct sketch plane higher up and making another square, then using the loft feature, which is super useful and one of my favorite features."] },
    media: [
      { kind: 'image-pair', images: [
        { file: 'week-5/fusion-base.jpeg', title: 'Fusion lamp base', alt: 'Fusion render of the woven lamp base with its threaded opening', width: 1800, height: 1157 },
        { file: 'week-5/fusion-shade.jpeg', title: 'Fusion lampshade', alt: 'Fusion design of the warped lampshade with woven texture', width: 1800, height: 1036 },
      ] },
      { kind: 'text', text: "I also didnt want to constantly make changes to this one lamp since prototyping meant I had to make a million different copies, and I want others to reap the benefits of my findings. So I 75% vibe coded an app that is deployed on vercel(the goat as usual) where you can make your own lamp! I originally uploaded my 3d model and asked it to make a standard version, my twisted one, and a stacked one that you can easily modify each of the values with sliders, making prototyping so much easier. Here is da linkkkkk(there are still going to be updates for a bit and there are some small glitches):", link: { href: 'https://woven-lamp-studio.vercel.app', label: 'https://woven-lamp-studio.vercel.app' } },
      { kind: 'image', caption: "I have to get better at documentation, since this was one of the only photos i took of the many prototypes. This lamp base was number 3", captionPosition: 'before', image: {
        file: 'week-5/prototype-three.jpeg', title: 'Lamp prototype number 3', alt: 'White woven lampshade on the blue third prototype base', width: 1350, height: 1800,
      } },
      { kind: 'text', text: "This is where I am at right now, and I wanted to also experiment with a 3d printed PCB technique that I saw on youtube. It went shockingly well, even with soldering. Any issues that I had, were entirely mistakes on my part. The PCB clicks in and so does the usb-c module, though I plan to buy the PCB. The COB strip that I bought wraps around a core I designed and teh cables funnel through the bottom to connect to the PCB. The top is printing as you read this probably lol. It does take forever" },
      { kind: 'collage', images: [
        { file: 'week-5/copper-traces.jpeg', title: 'Printed PCB copper traces', alt: 'Copper traces on the printed PCB above the green lamp base', width: 1350, height: 1800 },
        { file: 'week-5/installed-pcb.jpeg', title: 'PCB clipped into the base', alt: 'PCB and USB-C module clipped into the green lamp base', width: 1350, height: 1800 },
        { file: 'week-5/lamp-core-parts.jpeg', title: 'Lamp core and base', alt: 'White spiral lamp core beside the green woven base', width: 1350, height: 1800 },
        { file: 'week-5/assembled-core.jpeg', title: 'Assembled lamp core', alt: 'White spiral lamp core fitted into the green base', width: 1350, height: 1800 },
      ] },
      { kind: 'text', text: "Heres a look at my light controller too. I made a hand drawn animated remote using a waveshare display. This took me way too long to get working." },
      { kind: 'image', image: { file: 'week-5/light-controller.jpeg', title: 'PCB and light test', alt: 'Handmade circuit board powering a bright LED strip on a soldering mat', width: 1350, height: 1800 } },
      { kind: 'video', file: 'week-5/light-controller.mp4', poster: 'week-5/controller-poster.jpeg', autoplay: false, alt: 'Animated Waveshare light controller and LED demonstration', width: 720, height: 1280 },
      { kind: 'text', text: 'And heres a 3D model of my motorcycle helmet' },
      { kind: 'obj-model', file: 'week-5/helmet/10_12_2026.obj', material: 'week-5/helmet/10_12_2026.mtl', alt: 'Interactive 3D scan of my motorcycle helmet' },
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
