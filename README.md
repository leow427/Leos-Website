# Leo’s Website

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
- Water fills the remaining space to the right edge of the browser on every page, with the original shoreline shape and animation preserved.
- **Week 1** is the only published stop. The other colored routes remain on the map, with their stops and halos removed.
- The blue stop opens its own project page, based on [the editable Figma template](https://www.figma.com/design/lZzu3s65EB0ncM6igvjU4d/Leo-CTA-Portfolio?node-id=62-3). Two 800 × 450 (16:9) enclosure renders are stacked together, followed by an interactive 3D enclosure. The route and footer extend to accommodate the project copy. View project and Source code buttons are omitted.
- The 3D viewer supports dragging, keyboard camera controls, scroll/pinch zoom, and resetting the view. Its engine loads only when a model project is opened, and a failed model download can be retried. The Projects index uses the enclosure image as its thumbnail.
- The Projects tab opens a separate index of every published project. Individual project pages leave the navigation tabs unselected. Hash URLs support direct links, reload, and browser back/forward navigation.
- Contact opens a dialog with keyboard focus, Escape, backdrop dismissal, and a return button.
- Add future projects to `projects` in `src/design.ts`; their line automatically supplies the matching map halo, project route, and train-window colors.

## Browser checks

```sh
npx playwright install chromium
npm test
```

The checks cover local artwork loading, runtime errors, navigation and browser history, keyboard dismissal and focus restoration, the Week 1 stop, route colors, desktop media placement, responsive layouts, 3D rotation/zoom/reset, and retrying a failed model download.

## Project media

The supplied renders are `public/media/razer-exploded.png` and `public/media/razer-enclosure.png`. The website model in `public/media/razer.glb` contains the colored Razer enclosure assembly selected from the supplied GLB. To regenerate it from a revised original export:

```sh
npm run prepare:model -- "/path/to/Razer.glb"
```

The preparation command preserves the source file and writes the website copy. Model preparation uses [glTF Transform](https://gltf-transform.dev/), while the interactive viewer uses [model-viewer](https://modelviewer.dev/). All media and the viewer code are served locally.

The bundled Inter 3.19 font matches the version used in Figma and is distributed under the SIL Open Font License in `public/fonts/LICENSE.txt`.

The source Figma exports are in `public/assets/`; keep their vector geometry intact when updating the site.
