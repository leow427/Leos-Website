# Leo’s Portfolio

A React + TypeScript implementation of the **APPROVED SNAPSHOT — Polished v1** map and **Project pages — CTA** template in [Leo CTA Portfolio](https://www.figma.com/design/lZzu3s65EB0ncM6igvjU4d/Leo-CTA-Portfolio?node-id=33-4).

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
- The navigation pill follows pointer hover and keyboard focus with a soft spring and press feedback. Station hover/focus gently enlarges the marker and adds a route-colored glow. The rolling shoreline waves and quiet ripples are present on every page; the Lake Michigan text and two dark central wave marks are removed. Animations respect reduced-motion preferences.
- Desktop scale accounts for both window width and viewing height, so the complete map fits typical laptop windows. Project pages keep that same scale and preserve the Figma spacing, including the return link. At widths of 600px or less, the menu sits above the map with touch-friendly controls. Very short windows can still scroll so the controls remain usable.
- Train route ends continue to the outer browser edges on the map and project pages. The central Figma artwork stays at the same scale; the map's stars sit above the extended green and pink lines.
- **Week 1** is the only published stop. The other colored routes remain on the map, with their stops and halos removed.
- The blue stop opens its own project page, matching [the editable Figma template](https://www.figma.com/design/lZzu3s65EB0ncM6igvjU4d/Leo-CTA-Portfolio?node-id=62-3). It includes two 800 × 400 image placeholders, blank areas reserved for copy, and both Back to map links. View project and Source code buttons are omitted.
- The Projects tab opens a separate index of every published project. Individual project pages leave the navigation tabs unselected. Hash URLs support direct links, reload, and browser back/forward navigation.
- About and Contact open coming-soon dialogs with keyboard focus, Escape, backdrop dismissal, and a return button.
- Add future projects to `projects` in `src/design.ts`; their line automatically supplies the matching map halo, project route, and train-window colors.

## Browser checks

```sh
npx playwright install chromium
npm test
```

The checks cover local artwork loading, runtime errors, navigation and browser history, keyboard dismissal and focus restoration, the Week 1 stop, route colors, exact desktop image placement, and responsive layouts.

The bundled Inter 3.19 font matches the version used in Figma and is distributed under the SIL Open Font License in `public/fonts/LICENSE.txt`.

The source Figma exports are in `public/assets/`; keep their vector geometry intact when updating the site.
