import { useEffect, useRef, useState } from 'react';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { ModelViewerElement } from '@google/model-viewer';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
        src: string;
        alt: string;
        'camera-controls'?: boolean;
        'camera-orbit'?: string;
        'touch-action'?: string;
        'interaction-prompt'?: string;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        orientation?: string;
        exposure?: string;
        loading?: string;
      };
    }
  }
}

const initialOrbit = '120deg 65deg 105%';

export default function ModelViewer({ src, alt }: { src: string; alt: string }) {
  const viewerRef = useRef<ModelViewerElement>(null);
  const [registered, setRegistered] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  // A fresh URL avoids reusing the viewer library's cached failed model on retry.
  const modelSource = attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src;

  useEffect(() => {
    let active = true;
    // Load the 3D engine only when a project containing a model is opened.
    import('@google/model-viewer').then(() => {
      if (active) setRegistered(true);
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const onLoad = () => setStatus('ready');
    const onError = () => setStatus('error');
    viewer.addEventListener('load', onLoad);
    viewer.addEventListener('error', onError);
    if (viewer.loaded) onLoad();
    return () => {
      viewer.removeEventListener('load', onLoad);
      viewer.removeEventListener('error', onError);
    };
  }, [registered, attempt]);

  const resetView = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.cameraOrbit = initialOrbit;
    viewer.cameraTarget = 'auto auto auto';
    viewer.fieldOfView = '30deg';
    viewer.jumpCameraToGoal();
  };

  const retry = () => {
    setStatus('loading');
    setRegistered(false);
    setAttempt(Date.now());
  };

  return <div className="model-viewer-shell" data-status={status} aria-busy={status === 'loading'}>
    {registered && <model-viewer key={attempt} ref={viewerRef} src={modelSource} alt={alt}
      camera-controls camera-orbit={initialOrbit} touch-action="pan-y"
      orientation="0deg -90deg 0deg" environment-image="legacy"
      interaction-prompt="none" shadow-intensity="1" exposure="0.7" loading="eager">
      <span slot="progress-bar" hidden />
    </model-viewer>}
    {status === 'loading' && <div className="model-status" role="status">Loading 3D model…</div>}
    {status === 'error' && <div className="model-status" role="alert">
      <span>The 3D model couldn’t load.</span>
      <button type="button" onClick={retry}>Try again</button>
    </div>}
    {status === 'ready' && <>
      <span className="model-hint" aria-hidden="true">Drag to rotate · Scroll or pinch to zoom</span>
      <button type="button" className="model-reset" onClick={resetView}
        aria-label="Reset 3D view" title="Reset 3D view">↺</button>
    </>}
  </div>;
}
