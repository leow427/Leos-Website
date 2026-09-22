import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { asset, mediaAsset, panelContent, place, projects, routeColors, unit } from './design';
import type { InformationPage, PageName, Project, ProjectImage, ProjectMedia } from './design';
import ModelViewer from './ModelViewer';

function Artwork({ name, x = 0, y = 0, width = 1254, height = 1254, className = '' }: {
  name: string; x?: number; y?: number; width?: number; height?: number; className?: string;
}) {
  return <img className={`artwork ${className}`} src={asset(name)} alt="" draggable="false" style={place(x, y, width, height)} />;
}

function Lake({ project = false, height = project ? 2460 : 1136 }: { project?: boolean; height?: number }) {
  const stretch = height / 1136;
  return <div className="lake-layer" aria-hidden="true" style={{ '--lake-height': unit(height) } as CSSProperties}>
    <Artwork name={project ? 'project-lake' : 'lake-michigan'} x={1014} width={240} height={height} />
    <Artwork className="shore-waves" name="coastline" y={-0.16492 * stretch}
      width={1284.38} height={1254.16492 * stretch} />
  </div>;
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
            backgroundColor: `rgba(142, 157, 164, ${index % 4 === 0 ? 0.28 : 0.14})`,
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
  { name: 'Home', x: 10, width: 145, textX: 0, textWidth: 145 },
  { name: 'Projects', x: 170, width: 148, textX: 0, textWidth: 148 },
  { name: 'Contact', x: 333, width: 145, textX: 0, textWidth: 145 },
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
          aria-haspopup={name === 'Contact' ? 'dialog' : undefined}
          aria-controls={name === 'Contact' ? 'information-panel' : undefined}
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

function ProjectRoute({ height = 2460 }: { height?: number }) {
  const routeHeight = height - 170;
  const routeRef = useRef<SVGSVGElement>(null);
  const [extension, setExtension] = useState(1254);

  useLayoutEffect(() => {
    const route = routeRef.current;
    if (!route) return;
    const updateExtension = () => {
      const width = route.getBoundingClientRect().width;
      if (width > 0) setExtension(Math.ceil(window.innerWidth * 954 / width));
    };
    updateExtension();
    const observer = new ResizeObserver(updateExtension);
    observer.observe(route);
    window.addEventListener('resize', updateExtension);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateExtension);
    };
  }, []);

  // Draw the bends and viewport extensions together to avoid subpixel seams.
  return <svg ref={routeRef} className="artwork project-route" aria-hidden="true" focusable="false"
    viewBox={`0 0 954 ${routeHeight}`} preserveAspectRatio="none" fill="none" style={place(10, 136, 954, routeHeight)}>
    <path d={`M${-extension} 8H38C70 8 86 24 86 56V${routeHeight - 56}C86 ${routeHeight - 24} 102 ${routeHeight - 8} 134 ${routeHeight - 8}H${954 + extension}`}
      stroke="var(--route-color)" strokeWidth="16" />
  </svg>;
}

function TransitMap({ onProject }: { onProject: (project: Project) => void }) {
  return (
    <section className="map-canvas" aria-labelledby="portfolio-title">
      <div className="scene-background" aria-hidden="true">
        <Artwork name="paper" />
        <StreetGrid />
      </div>
      <Lake />
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
        <span className="hero-name" style={place(51, 470, 274, 132)}>Leo’s</span>{' '}
        <span className="hero-portfolio" style={place(52, 580, 447, 128)}>Projects</span>
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

function ProjectPhoto({ image, drawing = false }: { image: ProjectImage; drawing?: boolean }) {
  const photo = <img className="project-photo" src={mediaAsset(image.file)} alt={image.alt}
    width={image.width ?? 3024} height={image.height ?? 1701} />;
  return <figure className={`project-figure ${drawing ? 'project-drawing' : ''}`}>
    {image.title
      ? <a className="project-media media-enlarge" href={mediaAsset(image.file)} target="_blank" rel="noreferrer"
        aria-label={`View ${image.title} at full size`}>{photo}</a>
      : <div className="project-media">{photo}</div>}
  </figure>;
}

function MediaContent({ media, reflection }: { media: ProjectMedia; reflection?: string }) {
  if (media.kind === 'image') return <>
    <ProjectPhoto image={media.image} />
    {media.caption && <p className="project-reflection">{media.caption}</p>}
  </>;
  if (media.kind === 'image-pair') return <>
    <div className={`project-image-pair ${media.drawings ? 'project-drawings' : ''}`}>
      {media.images.map(image => <ProjectPhoto key={image.file} image={image} drawing={media.drawings} />)}
    </div>
    {reflection && <p className="project-reflection">{reflection}</p>}
  </>;
  return <div className="project-media project-media-model">
    <ModelViewer key={media.file} src={mediaAsset(media.file)} alt={media.alt}
      orientation={media.orientation} cameraOrbit={media.cameraOrbit} />
  </div>;
}

function ProjectPage({ project }: { project: Project }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [sceneHeight, setSceneHeight] = useState(2460);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const scene = content?.closest('.project-scene');
    if (!content || !scene) return;
    // Continue the same route and lake artwork to the end of longer projects.
    const measure = () => {
      const width = scene.getBoundingClientRect().width;
      if (width) setSceneHeight(Math.max(project.introduction?.heading ? 2460 : 0, Math.ceil(168 + content.getBoundingClientRect().height * 1254 / width + 200)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    observer.observe(scene);
    return () => observer.disconnect();
  }, [project.id, project.introduction]);

  return (
    <section className="project-canvas" aria-labelledby="project-title" tabIndex={-1}
      style={{ '--route-color': routeColors[project.line], '--scene-height': unit(sceneHeight) } as CSSProperties}>
      <BackToMap className="back-to-map-top" />
      <div className="project-scene">
        <div className="scene-background" aria-hidden="true">
          <StreetGrid height={sceneHeight} />
        </div>
        <Lake project height={sceneHeight} />
        <ProjectRoute height={sceneHeight} />
        <div className="project-content" ref={contentRef}>
          <header className={`project-introduction ${project.introduction?.heading ? '' : 'project-introduction-compact'}`}>
            <img src={asset('chicago-stars')} alt="" width="94" height="17" />
            <h1 id="project-title" className="visually-hidden">{project.label}</h1>
            {project.introduction && <>
              {project.introduction.heading && <h2 className="project-headline">{project.introduction.heading}</h2>}
              {project.introduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </>}
          </header>
          {project.media.map((media, index) => (
            <section className="project-image-block" key={`${project.id}-${index}`} aria-label={`Project media ${index + 1}`}>
              <MediaContent media={media} reflection={project.reflection} />
            </section>
          ))}
          <footer className="project-footer"><BackToMap /></footer>
        </div>
        <RouteArtwork name="project-station-halo" x={70} y={219} width={52} height={52} />
        <Artwork name="station" x={72.25} y={223.25} width={47.5} height={47.5} />
        <Artwork name="project-station-small" x={79.671875} y={project.introduction?.heading ? 1581.046875 : sceneHeight * 0.56} width={32.65625} height={32.65625} />
        <Artwork name="project-station-small" x={79.671875} y={sceneHeight - 206.953125} width={32.65625} height={32.65625} />
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
      <div className="scene-background" aria-hidden="true">
        <StreetGrid />
      </div>
      <Lake />
      <div className="projects-index">
        <img className="index-stars" src={asset('chicago-stars')} alt="" width="94" height="17" />
        <h1 id="projects-title" tabIndex={-1}>Projects</h1>
        <ul className="project-list">
          {projects.map((project) => {
            const imageMedia = project.media.find(media => media.kind === 'image' || media.kind === 'image-pair');
            const preview = imageMedia?.kind === 'image' ? imageMedia.image
              : imageMedia?.kind === 'image-pair' ? imageMedia.images[1] : undefined;
            return <li key={project.id}>
              <button type="button" className="project-card" id={`project-card-${project.id}`}
                style={{ '--route-color': routeColors[project.line] } as CSSProperties}
                onClick={() => onProject(project)}>
                <span className="project-card-preview" aria-hidden="true">
                  {preview && <img src={mediaAsset(preview.file)} alt="" width="3024" height="1701" />}
                </span>
                <span className="project-card-label">{project.label}</span>
                <span className="project-card-line">{project.line} Line</span>
              </button>
            </li>;
          })}
        </ul>
        <BackToMap />
      </div>
    </section>
  );
}

function ComingSoonPanel({ page, onClose }: { page: InformationPage | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const content = panelContent[page ?? 'Contact'];

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
          <span className="panel-section">{page ?? 'Contact'}</span>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close panel">Close</button>
        </div>
        <img className="panel-stars" src={asset('chicago-stars')} alt="" width="94" height="17" />
        <h2 id="panel-title">{content.heading}</h2>
        <div id="panel-description" className="panel-description">
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
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
    document.title = view.kind === 'project' ? `${view.project.label} — Leo’s Website`
      : view.kind === 'projects' ? 'Projects — Leo’s Website' : 'Leo’s Website';
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
    if (page === 'Contact') { setActivePanel(page); return; }
    setActivePanel(null);
    window.location.hash = page === 'Projects' ? '/projects' : '/';
  };
  const activeNavigation = activePanel ?? (view.kind === 'home' ? 'Home' : view.kind === 'projects' ? 'Projects' : null);

  return (
    <div className="site-frame">
      <main className="portfolio">
        <Navigation active={activeNavigation} onNavigate={navigate} />
        {view.kind === 'home' && <TransitMap onProject={openProject} />}
        {view.kind === 'project' && <ProjectPage key={view.project.id} project={view.project} />}
        {view.kind === 'projects' && <ProjectsPage onProject={openProject} />}
        <ComingSoonPanel page={activePanel} onClose={() => setActivePanel(null)} />
      </main>
    </div>
  );
}
