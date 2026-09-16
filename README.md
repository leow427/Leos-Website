# Leo’s Portfolio

A React + TypeScript implementation of the **APPROVED SNAPSHOT — Polished v1** page in [Leo CTA Portfolio](https://www.figma.com/design/lZzu3s65EB0ncM6igvjU4d/Leo-CTA-Portfolio?node-id=33-4).

## Run locally

Requires Node.js 22.12+ (or a newer supported LTS).

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

The production build is in `dist/`. All artwork and fonts are served locally, and asset paths are relative so the build can also be hosted in a subdirectory.

## Design and behavior

- The approved 1254 × 1254 desktop composition is reproduced with the original Figma SVG exports, proportional coordinates, Inter typography, street grid, station halos, and static train accents.
- Text, navigation, stations, and trains are React/HTML elements, not a flattened screenshot.
- The navigation pill follows pointer hover and keyboard focus with a soft spring and press feedback. The four lake ripples drift at staggered speeds; station hover/focus gently enlarges the marker and adds a route-colored glow. Animations respect reduced-motion preferences.
- The map scales proportionally up to its original size. At widths of 700px or less, the menu sits above the map with touch-friendly controls.
- About, Projects, and Contact open simple coming-soon dialogs. Every station opens Projects. Dialogs support keyboard focus, Escape, backdrop dismissal, and a return button.
- Approved station labels remain **TBD**. Update `src/design.ts` when content is ready.

## Browser checks

```sh
npx playwright install chromium
npm test
```

The checks cover local artwork loading, runtime errors, all navigation panels, keyboard dismissal and focus restoration, station interaction, and responsive layouts.

The bundled Inter 3.19 font matches the version used in Figma and is distributed under the SIL Open Font License in `public/fonts/LICENSE.txt`.

The source Figma exports are in `public/assets/`; keep their vector geometry intact when updating the site.
