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
  Purple: '#44268a', Brown: '#854f0f', Red: '#d00b29', Blue: '#047fdf', Green: '#028a4c', Orange: '#fd821a', Pink: '#fc81ad',
} as const;

export type ProjectImage = { file: string; alt: string; title?: string; width?: number; height?: number };

export type ProjectMedia =
  | { kind: 'embed'; file: string; title: string }
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
  update?: { text: string; media: ProjectMedia[] };
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
    update: {
      text: "i finished the lamp for my stepmom! I have to make some improvements on the design, but once that is done, everything will be posted for you all to make your own!",
      media: [
        { kind: 'video', file: 'week-5/finished-lamp.mp4', poster: 'week-5/finished-lamp-poster.jpeg', autoplay: false, alt: 'Finished woven lamp demonstration', width: 720, height: 1280 },
        { kind: 'collage', images: [
          { file: 'week-5/lamp-led-test.jpeg', title: 'Lamp LED test', alt: 'Colorful LEDs wrapped around the lamp core on the workbench', width: 1350, height: 1800 },
          { file: 'week-5/lamp-and-shade.jpeg', title: 'Lamp core and finished shade', alt: 'Illuminated lamp core beside its woven shade and round controller', width: 1350, height: 1800 },
          { file: 'week-5/lamp-pcb-layout.jpeg', title: 'Final lamp PCB layout', alt: 'Final lamp circuit board layout in the PCB editor', width: 1350, height: 1800 },
          { file: 'week-5/lamp-electronics.jpeg', title: 'Finished lamp electronics', alt: 'Completed circuit board and USB-C power connection mounted inside the green lamp base', width: 1350, height: 1800 },
        ] },
      ],
    },
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
  { id: 'week-6', label: 'Week 6', line: 'Pink', x: 354, y: 414,
    labelX: 334, labelY: 452,
    introduction: { paragraphs: ["I have succumbed to the forge gods:(. Sadly at the very end of my third cut, some solder or something must've bridged ground and 5v, and fried my chip. This only happened after everything was plugged in since im triple checked continuity on every step."] },
    media: [
      { kind: 'collage', images: [
        { file: 'week-6/milled-board.jpeg', title: 'Milled circuit board', alt: 'Freshly milled copper circuit board before soldering', width: 3024, height: 4032 },
        { file: 'week-6/soldered-chip.jpeg', title: 'Soldered ATtiny', alt: 'ATtiny chip soldered onto the copper circuit board', width: 3024, height: 4032 },
        { file: 'week-6/connected-board.jpeg', title: 'Connected circuit board', alt: 'Assembled circuit board with potentiometer connected to a USB UPDI programmer', width: 3024, height: 4032 },
        { file: 'week-6/pcb-layout.png', title: 'PCB layout', alt: 'PCB layout showing the ATtiny, potentiometer, IR emitter connections, and power traces', width: 1528, height: 1268 },
      ] },
      { kind: 'text', text: "The idea was to get the attiny to control an IR emitter module, but since we ran out of buttons i was just going to use a potentiometer." },
      { kind: 'text', text: "This is an update and re-attempt. I made 3 boards, swapped out 4 attiny's checked connections every time, used updi friend, and arduino, and spent countless hours. I was getting correct power, my continuity tests were good, but the attiny did not want to flash. I honestly have no idea went wrong." },
      { kind: 'collage', images: [
        { file: 'week-6/reattempt-updi.jpeg', title: 'UPDI Friend re-attempt', alt: 'Handmade ATtiny circuit board connected to a powered UPDI Friend programmer', width: 1350, height: 1800 },
        { file: 'week-6/reattempt-workbench.jpeg', title: 'Programming re-attempt at the workbench', alt: 'ATtiny board and potentiometer connected beside a laptop, with a thumbs-down gesture', width: 1350, height: 1800 },
        { file: 'week-6/reattempt-board.jpeg', title: 'Another ATtiny programming attempt', alt: 'ATtiny circuit board resting on a soldering fixture and connected to a UPDI Friend, with a thumbs-down gesture', width: 1350, height: 1800 },
      ] },
    ] },
  { id: 'week-7', label: 'Week 7', line: 'Blue', x: 364, y: 756,
    labelX: 339, labelY: 812,
    introduction: { paragraphs: [
      'This week I wanted to try to better understand, and improve upon my implementation of a IR light protocol I made over the summer to be lower latency, easier to run, and used for a more general application.',
      'My input this week was a TSOP IR sensor. I am receiver color codes out of an adafruit IR emitter, and the IR sensor then forwards those commands to an esp32, which then decodes them and presents the color to an rgb led.',
      'I am taking the album cover art, taking the most vibrant 3 colors, and mapping them to high, low, and mid frequencies to display their colors based on their volume. The colors mix if you get a lot of volume from 2 or all 3 of the frequencies.',
      'I also made a pcb for it, but it failed and I did not have time to cut a new one since i was also finishing my lamp and working on other projects!',
    ] },
    media: [
      { kind: 'video', file: 'week-7/ir-demo.mp4', alt: 'IR receiver and RGB LED responding to music', width: 720, height: 1280 },
      { kind: 'image', image: { file: 'week-7/ir-setup.jpeg', title: 'IR light setup', alt: 'IR emitter, ESP32, and RGB LED connected on breadboards beside a laptop playing music', width: 1800, height: 1350 } },
      { kind: 'image-pair', images: [
        { file: 'week-7/pcb-components.jpeg', title: 'IR receiver PCB components', alt: 'Component side of the IR receiver PCB with LEDs, sensor, capacitor, and microcontroller socket', width: 1350, height: 1800 },
        { file: 'week-7/pcb-traces.jpeg', title: 'IR receiver PCB traces', alt: 'Copper traces and soldered connections on the IR RX v2 board', width: 1350, height: 1800 },
      ] },
      { kind: 'image', image: { file: 'week-7/pcb-layout.png', title: 'IR receiver PCB layout', alt: 'IR Receiver v2 PCB layout showing the XIAO ESP32C3, TSOP38438 sensor, and RGB LED connections', width: 1468, height: 946 } },
    ] },
  { id: 'week-8', label: 'Week 8', line: 'Purple', x: 704, y: 852,
    labelX: 690, labelY: 920,
    introduction: { paragraphs: [
      "This week we were tasked to make something with more advanced C code, while (I think) also reading some sort of input. Last week I already made something complex, but I wanted to try matching that.",
      "I found a matrix LED display in the box that seemed super cool. I knew almost immediately i wanted to make an animated face, and have been wanting to implement some sort of facial recognition system.",
      "Here is a video of it working:",
    ] },
    media: [
      { kind: 'video', file: 'week-8/face-demo-1.mp4', poster: 'week-8/face-demo-1.jpg', autoplay: false, alt: 'Animated LED face demonstration, first video', width: 720, height: 1280 },
      { kind: 'video', file: 'week-8/face-demo-3.mp4', poster: 'week-8/face-demo-3.jpg', autoplay: false, alt: 'Animated LED face demonstration, second video', width: 720, height: 1280 },
      { kind: 'video', file: 'week-8/face-demo-2.mp4', poster: 'week-8/face-demo-2.jpg', autoplay: false, alt: 'Animated LED face demonstration, third video', width: 720, height: 1280 },
      { kind: 'text', text: "When it sees me, he's happy, no matter who else is there. If I leave, he sleeps. And if he see's James... well lets just say he throws a little gesture to show his displeasure." },
      { kind: 'image', image: { file: 'week-8/enclosure.jpg', alt: 'Fusion design of the LED display enclosure, lid, and PCB', width: 1800, height: 1135 }, caption: 'This is a quick little 3d printed enclosure to hold the pcb and make it look cleaner.', captionPosition: 'after' },
    ] },
  { id: 'week-9', label: 'Week 9', line: 'Red', x: 828, y: 970,
    labelX: 876, labelY: 960,
    introduction: { paragraphs: [
      'This week was about controlling an output and identifying how much power it uses. I wanted to go deeper so I could estimate battery runtime, see where I could improve it, and find out how long I could make my wearable train tracker last. It also gave me a chance to get ahead on my final project and give it more time to develop. I’ve now named it Trackie!',
      'I focused on the firmware and the display UI. Once the main interface was working, I built a stress test and worked through three rounds of testing and improvements. Each run logged CPU utilization, RAM usage, screen brightness, and Wi-Fi activity. Together, those logs helped me estimate current draw and compare the effect of each change on battery life.',
      'The first version worked, but it felt clunky and slow. After each round, I reviewed the logs and made targeted fixes to improve responsiveness and efficiency. I also wanted to get better at coding, so I worked alongside Claude, letting it handle the heavy lifting while I followed the changes and learned from the process.',
    ] },
    media: [
      { kind: 'image-pair', images: [
        { file: 'week-9/tracky-firmware.jpg', alt: 'Trackie displaying train arrivals beside the firmware code', width: 1350, height: 1800 },
        { file: 'week-9/tracky-ui.jpg', alt: 'Trackie showing its pixel-art interface and bus arrival information', width: 1350, height: 1800 },
      ] },
      { kind: 'video', file: 'week-9/tracky-demo.mp4', alt: 'Trackie interface demonstration (silent)', width: 1080, height: 1920, autoplay: false },
      { kind: 'text', text: 'This is the process log I put together documenting the findings and firmware improvements Claude and I made this week. It follows each round of testing, including the changes that helped and the experiments I decided not to keep. The current draw and battery runtime figures are estimates based on the logged activity.' },
      { kind: 'embed', file: 'week-9/power-analysis.html', title: 'Trackie power analysis and process log' },
      { kind: 'text', text: 'This is the prototype enclosure I made for Trackie. It holds the wearable and a 2,000 mAh battery, but there are still a few details I want to work out. I’m planning to remake the faceplate, possibly in aluminum, and make the loop a little bigger so it can fit larger clips.' },
      { kind: 'image', image: { file: 'week-9/trackie-enclosure-design.png', alt: 'Fusion render of the Trackie enclosure with its faceplate and attachment loop', width: 3012, height: 1748 } },
      { kind: 'video', file: 'week-9/trackie-enclosure.mp4', alt: 'Trackie prototype enclosure demonstration', width: 1080, height: 1920, autoplay: false },
      { kind: 'text', text: 'I also designed this PCB this week and ordered my first PCB assembly through JLCPCB, which I’m really excited about! This board is for the dock portion of Trackie. The plan is to use LEDs to display three dedicated bus lines, with another LCD screen beside them.' },
      { kind: 'image', image: { file: 'week-9/dock-pcb-3d.png', alt: '3D view of the Trackie dock PCB with three rows of LEDs', width: 2968, height: 1578 } },
      { kind: 'image', image: { file: 'week-9/dock-pcb-layout.png', alt: 'Trackie dock PCB layout showing the LED rows and routed connections', width: 2736, height: 1698 } },
      { kind: 'text', text: 'I’m also working on a few other parts of the project, especially the iPhone companion app for Trackie. More on that soon!' },
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
