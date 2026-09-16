import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { asset, panelContent, place, projects, routeColors, unit } from './design';
import type { InformationPage, PageName, Project } from './design';

function Artwork({ name, x = 0, y = 0, width = 1254, height = 1254, className = '' }: {
  name: string; x?: number; y?: number; width?: number; height?: number; className?: string;
}) {
  return <img className={`artwork ${className}`} src={asset(name)} alt="" draggable="false" style={place(x, y, width, height)} />;
}

function Lake({ project = false }: { project?: boolean }) {
  const height = project ? 1580 : 1136;
  const stretch = height / 1136;
  return <>
    <Artwork name={project ? 'project-lake' : 'lake-michigan'} x={1014} width={240} height={height} />
    <Artwork className="shore-waves" name="coastline" y={-0.16492 * stretch}
      width={1284.38} height={1254.16492 * stretch} />
  </>;
}

function StreetGrid({ height = 1254 }: { height?: number }) {
  return (
    <div className="map-layer" aria-hidden="true">
      {(['vertical', 'horizontal'] as const).flatMap((direction) =>
        Array.from({ length: Math.ceil((direction === 'vertical' ? 1254 : height) / 48) }, (_, index) => (
          <span key={`${direction}-${index}`} className="grid-line" style={{
            ...place(direction === 'vertical' ? 28 + index * 48 : 0,
              direction === 'horizontal' ? 28 + index * 48 : 0,
              direction === 'vertical' ? 0.7 : 1254,
              direction === 'horizontal' ? 0.7 : height),
            backgroundColor: `rgba(142, 157, 164, ${index % 4 === 0 ? 0.12 : 0.06})`,
          }} />
        )),
      )}
    </div>
  );
}

function MiniTrains() {
  return (
    <div className="map-layer" aria-hidden="true">
      <span className="train" style={place(180, 766, 34, 12)} />
      {[186, 194, 204].map((x) => <span className="train-window blue-window" key={x} style={place(x, 770, 4, 4)} />)}
      <span className="train" style={place(838, 1065, 12, 34)} />
      {[1071, 1079, 1089].map((y) => <span className="train-window red-window" key={y} style={place(842, y, 4, 4)} />)}
    </div>
  );
}

const navigation = [
  { name: 'Home', x: 10, width: 91, textX: 11, textWidth: 66 },
  { name: 'About', x: 118, width: 94, textX: 14, textWidth: 66 },
  { name: 'Projects', x: 232, width: 120, textX: 15.5, textWidth: 89 },
  { name: 'Contact', x: 359, width: 116, textX: 17.5, textWidth: 87 },
] as const;

type NavigationName = typeof navigation[number]['name'];

function Navigation({ active, onNavigate }: { active: NavigationName | null; onNavigate: (page: PageName | null) => void }) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Partial<Record<NavigationName, HTMLButtonElement | null>>>({});
  const [hovered, setHovered] = useState<NavigationName | null>(null);
  const [focused, setFocused] = useState<NavigationName | null>(null);
  const [pressed, setPressed] = useState(false);
  const [bubble, setBubble] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const highlighted = hovered ?? focused ?? active;

  // Measure the actual buttons so the same pill also follows the mobile flex layout.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const item = highlighted ? itemRefs.current[highlighted] : null;
    if (!nav || !item) return;
    const measure = () => {
      const container = nav.getBoundingClientRect();
      const target = item.getBoundingClientRect();
      setBubble({
        x: target.left - container.left - nav.clientLeft,
        y: target.top - container.top - nav.clientTop,
        width: target.width,
        height: target.height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [highlighted]);

  return (
    <nav ref={navRef} className="site-nav" aria-label="Main navigation"
      data-engaged={Boolean(hovered || focused)} data-pressed={pressed}
      onPointerLeave={() => { setHovered(null); setPressed(false); }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(null); setPressed(false); }
      }}>
      <span className="nav-bubble" aria-hidden="true" style={{
        width: bubble.width, height: bubble.height,
        transform: `translate3d(${bubble.x}px, ${bubble.y}px, 0)`,
        visibility: highlighted && bubble.width ? 'visible' : 'hidden',
      }} />
      {navigation.map(({ name, x, width, textX, textWidth }) => (
        <button type="button" key={name}
          ref={(element) => { itemRefs.current[name] = element; }}
          className={`nav-item ${active === name ? 'is-active' : ''} ${highlighted === name ? 'is-highlighted' : ''}`}
          style={{ left: unit(x - 1), width: unit(width) }}
          aria-current={active === name ? 'page' : undefined}
          aria-haspopup={name === 'About' || name === 'Contact' ? 'dialog' : undefined}
          aria-controls={name === 'About' || name === 'Contact' ? 'information-panel' : undefined}
          onPointerEnter={(event) => { if (event.pointerType === 'mouse' || event.pointerType === 'pen') { setHovered(name); setFocused(null); } }}
          onPointerDown={() => setPressed(true)}
          onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) { setFocused(name); setHovered(null); } }}
          onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') setPressed(true); }}
          onKeyUp={() => setPressed(false)}
          onClick={() => {
            setPressed(false);
            setHovered(null);
            setFocused(null);
            onNavigate(name === 'Home' ? null : name);
          }}>
          <span style={{ left: unit(textX), width: unit(textWidth) }}>{name}</span>
        </button>
      ))}
    </nav>
  );
}

function RouteArtwork({ name, x, y, width, height, className = '' }: {
  name: string; x: number; y: number; width: number; height: number; className?: string;
}) {
  return <span aria-hidden="true" className={`artwork route-artwork ${className}`} style={{
    ...place(x, y, width, height), maskImage: `url("${asset(name)}")`,
  }} />;
}

function RouteExtension({ x, y, direction, color, width = 26 }: {
  x: number; y: number; direction: 'north' | 'south' | 'west' | 'east' | 'northwest'; color?: string; width?: number;
}) {
  return <span aria-hidden="true" className={`route-extension route-extension-${direction}`} style={{
    '--route-x': unit(x), '--route-y': unit(y), '--route-width': unit(width),
    ...(color ? { '--route-color': color } : {}),
  } as CSSProperties} />;
}

function TransitMap({ onProject }: { onProject: (project: Project) => void }) {
  return (
    <section className="map-canvas" aria-labelledby="portfolio-title">
      <div className="scene-background" aria-hidden="true">
        <Artwork name="paper" />
        <StreetGrid />
        <Lake />
      </div>
      {/* Continue the exported routes at their original endpoints, beyond the centered map. */}
      <RouteExtension x={556} y={116} direction="north" color={routeColors.Brown} />
      <RouteExtension x={588} y={116} direction="north" color="#44268a" />
      <RouteExtension x={955} y={1160} direction="south" color={routeColors.Orange} />
      <RouteExtension x={330} y={389} direction="west" color={routeColors.Green} />
      <RouteExtension x={926} y={1160} direction="south" color={routeColors.Green} />
      <RouteExtension x={330} y={417} direction="west" color="#fc81ad" />
      <RouteExtension x={329} y={303} direction="northwest" color={routeColors.Blue} />
      <RouteExtension x={53} y={772} direction="west" color={routeColors.Blue} />
      <RouteExtension x={844} y={104} direction="north" color={routeColors.Red} />
      <RouteExtension x={844} y={1160} direction="south" color={routeColors.Red} />
      <Artwork name="transit-lines" x={53} y={104} width={975} height={1056} />
      <h1 id="portfolio-title">
        <span className="hero-name" style={place(51, 413, 274, 132)}>Leo’s</span>{' '}
        <span className="hero-portfolio" style={place(52, 529, 447, 128)}>Portfolio</span>
      </h1>
      {projects.map((project) => {
        const { id, label, line, x, y, labelX, labelY } = project;
        return (
          <div key={id} style={{ '--route-color': routeColors[line] } as CSSProperties}>
            <RouteArtwork name="project-station-halo" x={x - 10} y={y - 10} width={52} height={52} />
            <button id={`stop-${id}`} type="button" className="station"
              aria-label={`${label} — ${line} Line project`}
              style={{ left: unit(x + 16), top: unit(y + 16) }}
              onClick={() => onProject(project)}>
              <img src={asset('station')} alt="" draggable="false" />
              <span className="station-label" aria-hidden="true" style={{
                '--label-x': unit(labelX - x - 16), '--label-y': unit(labelY - y - 16),
              } as CSSProperties}>{label}</span>
            </button>
          </div>
        );
      })}
      <Artwork name="chicago-stars" x={52} y={348} width={94} height={17} />
      <MiniTrains />
    </section>
  );
}

function BackToMap({ className = '' }: { className?: string }) {
  return <a href="#/" className={`back-to-map ${className}`}>
    <img src={asset('back-arrow')} alt="" width="24" height="24" />
    <span>Back to map</span>
  </a>;
}

function ImagePlaceholder({ number }: { number: number }) {
  return <div className="image-placeholder" role="img" aria-label={`Project image ${number} placeholder`}>
    <img src={asset('image-placeholder')} alt="" width="44" height="44" />
  </div>;
}

function ProjectPage({ project }: { project: Project }) {
  return (
    <section className="project-canvas" aria-labelledby="project-title" tabIndex={-1}
      style={{ '--route-color': routeColors[project.line] } as CSSProperties}>
      <BackToMap className="back-to-map-top" />
      <div className="project-scene">
        <div className="scene-background" aria-hidden="true">
          <StreetGrid height={1580} />
          <Lake project />
        </div>
        <RouteExtension x={10} y={144} direction="west" width={16} />
        <RouteExtension x={964} y={1536} direction="east" width={16} />
        <RouteArtwork className="project-route" name="project-route" x={10} y={136} width={954} height={1408} />
        <div className="project-content">
          <header className="project-introduction">
            <img src={asset('chicago-stars')} alt="" width="94" height="17" />
            <h1 id="project-title" className="visually-hidden">{project.label}</h1>
          </header>
          {Array.from({ length: project.imagePlaceholders }, (_, index) => (
            <section className="project-image-block" key={index} aria-label={`Project image ${index + 1}`}>
              <ImagePlaceholder number={index + 1} />
              {/* Reserve the Figma copy area until project descriptions are added. */}
              <div className="project-copy-space" aria-hidden="true" />
            </section>
          ))}
          <footer className="project-footer"><BackToMap /></footer>
        </div>
        <RouteArtwork name="project-station-halo" x={70} y={219} width={52} height={52} />
        <Artwork name="station" x={72.25} y={223.25} width={47.5} height={47.5} />
        <Artwork name="project-station-small" x={79.671875} y={823.046875} width={32.65625} height={32.65625} />
        <Artwork name="project-station-small" x={79.671875} y={1341.046875} width={32.65625} height={32.65625} />
        <span className="train project-train" style={place(90, 700, 12, 34)} aria-hidden="true" />
        {[706, 714, 722].map((y) => <span key={y} className="train-window project-train-window"
          style={place(94, y, 4, 4)} aria-hidden="true" />)}
      </div>
    </section>
  );
}

function ProjectsPage({ onProject }: { onProject: (project: Project) => void }) {
  return (
    <section className="projects-canvas" aria-labelledby="projects-title">
      <StreetGrid />
      <Lake />
      <div className="projects-index">
        <img className="index-stars" src={asset('chicago-stars')} alt="" width="94" height="17" />
        <h1 id="projects-title" tabIndex={-1}>Projects</h1>
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.id}>
              <button type="button" className="project-card" id={`project-card-${project.id}`}
                style={{ '--route-color': routeColors[project.line] } as CSSProperties}
                onClick={() => onProject(project)}>
                <span className="project-card-preview" aria-hidden="true">
                  <img src={asset('image-placeholder')} alt="" width="44" height="44" />
                </span>
                <span className="project-card-label">{project.label}</span>
                <span className="project-card-line">{project.line} Line</span>
              </button>
            </li>
          ))}
        </ul>
        <BackToMap />
      </div>
    </section>
  );
}

function ComingSoonPanel({ page, onClose }: { page: InformationPage | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const content = panelContent[page ?? 'About'];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (page && dialog && !dialog.open) dialog.showModal();
    if (!page && dialog?.open) dialog.close();
    if (!page) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [page]);

  return (
    <dialog ref={dialogRef} id="information-panel" className="information-panel"
      aria-labelledby="panel-title" aria-describedby="panel-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="panel-inner">
        <div className="panel-topline">
          <span className="panel-section">{page ?? 'About'}</span>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close panel">Close</button>
        </div>
        <img className="panel-stars" src={asset('chicago-stars')} alt="" width="94" height="17" />
        <h2 id="panel-title">{content.heading}</h2>
        <p id="panel-description">{content.description}</p>
        <button type="button" className="return-button" onClick={onClose}>Back to the map</button>
      </div>
    </dialog>
  );
}

type View = { kind: 'home' } | { kind: 'projects' } | { kind: 'project'; project: Project };

function readView(): View {
  if (window.location.hash === '#/projects') return { kind: 'projects' };
  const project = projects.find(({ id }) => window.location.hash === `#/projects/${id}`);
  return project ? { kind: 'project', project } : { kind: 'home' };
}

export default function App() {
  const [view, setView] = useState<View>(readView);
  const [activePanel, setActivePanel] = useState<InformationPage | null>(null);
  const lastProject = useRef<string | null>(null);
  const previousView = useRef(view.kind);

  useEffect(() => {
    const onHashChange = () => { setActivePanel(null); setView(readView()); };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = view.kind === 'project' ? `${view.project.label} — Leo’s Portfolio`
      : view.kind === 'projects' ? 'Projects — Leo’s Portfolio' : 'Leo’s Portfolio';
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (view.kind === 'project') {
      lastProject.current = view.project.id;
      // Announce the page without drawing a focus ring around its return link.
      // The next Tab still reaches that link, and keyboard focus stays visible.
      document.querySelector<HTMLElement>('.project-canvas')?.focus({ preventScroll: true });
    } else if (previousView.current === 'project' && lastProject.current) {
      const prefix = view.kind === 'home' ? 'stop' : 'project-card';
      document.getElementById(`${prefix}-${lastProject.current}`)?.focus({ preventScroll: true });
    } else if (view.kind === 'projects') {
      document.getElementById('projects-title')?.focus({ preventScroll: true });
    }
    previousView.current = view.kind;
  }, [view]);

  const openProject = (project: Project) => { window.location.hash = `/projects/${project.id}`; };
  const navigate = (page: PageName | null) => {
    if (page === 'About' || page === 'Contact') { setActivePanel(page); return; }
    setActivePanel(null);
    window.location.hash = page === 'Projects' ? '/projects' : '/';
  };
  const activeNavigation = activePanel ?? (view.kind === 'home' ? 'Home' : view.kind === 'projects' ? 'Projects' : null);

  return (
    <div className="site-frame">
      <main className="portfolio">
        <Navigation active={activeNavigation} onNavigate={navigate} />
        {view.kind === 'home' && <TransitMap onProject={openProject} />}
        {view.kind === 'project' && <ProjectPage project={view.project} />}
        {view.kind === 'projects' && <ProjectsPage onProject={openProject} />}
        <ComingSoonPanel page={activePanel} onClose={() => setActivePanel(null)} />
      </main>
    </div>
  );
}
