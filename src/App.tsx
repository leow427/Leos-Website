import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { asset, panelContent, place, stations, unit } from './design';
import type { PageName } from './design';

function Artwork({ name, x = 0, y = 0, width = 1254, height = 1254, className = '' }: {
  name: string; x?: number; y?: number; width?: number; height?: number; className?: string;
}) {
  return <img className={`artwork ${className}`} src={asset(name)} alt="" draggable="false" style={place(x, y, width, height)} />;
}

function StreetGrid() {
  return (
    <div className="map-layer" aria-hidden="true">
      {Array.from({ length: 26 }, (_, index) => {
        const color = `rgba(142, 157, 164, ${index % 4 === 0 ? 0.12 : 0.06})`;
        return ['vertical', 'horizontal'].map((direction) => (
          <span key={`${direction}-${index}`} className="grid-line" style={{
            ...place(direction === 'vertical' ? 28 + index * 48 : 0,
              direction === 'horizontal' ? 28 + index * 48 : 0,
              direction === 'vertical' ? 0.7 : 1254,
              direction === 'horizontal' ? 0.7 : 1254),
            backgroundColor: color,
          }} />
        ));
      })}
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

function Navigation({ active, onNavigate }: { active: PageName | null; onNavigate: (page: PageName | null) => void }) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Partial<Record<NavigationName, HTMLButtonElement | null>>>({});
  const [hovered, setHovered] = useState<NavigationName | null>(null);
  const [focused, setFocused] = useState<NavigationName | null>(null);
  const [pressed, setPressed] = useState(false);
  const [bubble, setBubble] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const highlighted = active ?? hovered ?? focused ?? 'Home';

  // Measure the actual buttons so the same pill also follows the mobile flex layout.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const item = itemRefs.current[highlighted];
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
        visibility: bubble.width ? 'visible' : 'hidden',
      }} />
      {navigation.map(({ name, x, width, textX, textWidth }) => (
        <button type="button" key={name}
          ref={(element) => { itemRefs.current[name] = element; }}
          className={`nav-item ${(active ?? 'Home') === name ? 'is-active' : ''} ${highlighted === name ? 'is-highlighted' : ''}`}
          style={{ left: unit(x - 1), width: unit(width) }}
          aria-current={(active ?? 'Home') === name ? 'page' : undefined}
          aria-haspopup={name === 'Home' ? undefined : 'dialog'}
          aria-controls={name === 'Home' ? undefined : 'information-panel'}
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

function TransitMap({ onProject }: { onProject: () => void }) {
  return (
    <section className="map-canvas" aria-labelledby="portfolio-title">
      <Artwork name="paper" />
      <StreetGrid />
      <Artwork name="lake-michigan" x={1014} width={240} height={1136} />
      <Artwork name="coastline" y={-0.16492} width={1284.38} height={1254.16492} />
      <Artwork name="transit-lines" x={53} y={104} width={975} height={1056} />
      <h1 id="portfolio-title">
        <span className="hero-name" style={place(51, 413, 274, 132)}>Leo’s</span>{' '}
        <span className="hero-portfolio" style={place(52, 529, 447, 128)}>Portfolio</span>
      </h1>
      <Artwork name="station-halos" />
      {stations.map(({ line, color, x, y, labelX, labelY }) => (
        <button key={line} type="button" className="station"
          aria-label={`${line} Line project — coming soon`}
          aria-haspopup="dialog" aria-controls="information-panel"
          style={{ left: unit(x + 16), top: unit(y + 16), '--route-color': color } as CSSProperties}
          onClick={onProject}>
          <img src={asset('station')} alt="" draggable="false" />
          <span className="station-label" aria-hidden="true" style={{
            '--label-x': unit(labelX - x - 16), '--label-y': unit(labelY - y - 16),
          } as CSSProperties}>TBD</span>
        </button>
      ))}
      <div className="lake-label" aria-label="Lake Michigan">
        <span style={place(1141.5, 364, 43, 23)} aria-hidden="true">Lake</span>
        <span style={place(1122, 393, 82, 23)} aria-hidden="true">Michigan</span>
      </div>
      <Artwork className="lake-wave lake-wave-wide" name="lake-wave-wide" x={1110.3753} y={461} width={81.2494} height={10} />
      <Artwork className="lake-wave lake-wave-small" name="lake-wave-small" x={1140.3753} y={485} width={61.2494} height={10} />
      <Artwork name="chicago-stars" x={52} y={392} width={94} height={17} />
      <MiniTrains />
    </section>
  );
}

function ComingSoonPanel({ page, onClose }: { page: PageName | null; onClose: () => void }) {
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

export default function App() {
  const [activePage, setActivePage] = useState<PageName | null>(null);
  return (
    <main className="portfolio">
      <Navigation active={activePage} onNavigate={setActivePage} />
      <TransitMap onProject={() => setActivePage('Projects')} />
      <ComingSoonPanel page={activePage} onClose={() => setActivePage(null)} />
    </main>
  );
}
