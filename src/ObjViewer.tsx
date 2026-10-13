import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function ObjViewer({ src, materialSrc, alt }: { src: string; materialSrc: string; alt: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => {});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let started = false;
    let visible = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let resize: ResizeObserver | undefined;
    const scene = new THREE.Scene();
    const textures = new Set<THREE.Texture>();
    const materials = new Set<THREE.Material>();
    const geometries = new Set<THREE.BufferGeometry>();
    const release = () => {
      geometries.forEach(item => item.dispose());
      materials.forEach(item => item.dispose());
      textures.forEach(item => item.dispose());
    };
    const fail = () => { if (!disposed) setStatus('error'); };
    const start = async () => {
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0xeef3f4, 1);
        const canvas = renderer.domElement;
        canvas.className = 'obj-viewer-canvas';
        canvas.setAttribute('aria-label', `${alt}. Drag or use arrow keys to rotate; scroll, pinch, or use plus and minus to zoom.`);
        canvas.setAttribute('role', 'img');
        canvas.tabIndex = 0;
        host.prepend(canvas);
        const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.enablePan = false;
        scene.add(new THREE.HemisphereLight(0xffffff, 0x8f9aab, 2.5));
        const key = new THREE.DirectionalLight(0xffffff, 2.5);
        key.position.set(3, 5, 4);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 1);
        fill.position.set(-4, 1, -3);
        scene.add(fill);
        const resizeViewer = () => {
          if (!renderer || !host.clientWidth || !host.clientHeight) return;
          const oldAspect = camera.aspect;
          camera.aspect = host.clientWidth / host.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(host.clientWidth, host.clientHeight, false);
          if (oldAspect !== camera.aspect) resetRef.current();
        };
        resize = new ResizeObserver(resizeViewer);
        resize.observe(host);
        resizeViewer();
        // Wait for both the OBJ and its material textures before revealing the scan.
        const manager = new THREE.LoadingManager();
        let textureFailed = false;
        manager.onError = () => { textureFailed = true; fail(); };
        const suffix = attempt ? `?retry=${attempt}` : '';
        const materialURL = new URL(materialSrc, window.location.href);
        const creator = await new MTLLoader(manager).setResourcePath(new URL('.', materialURL).href).loadAsync(materialURL.href + suffix);
        creator.preload();
        Object.values(creator.materials).forEach(material => {
          materials.add(material);
          Object.values(material).forEach(value => { if (value instanceof THREE.Texture) textures.add(value); });
          material.side = THREE.DoubleSide;
        });
        if (disposed) { release(); return; }
        const model = await new OBJLoader(manager).setMaterials(creator).loadAsync(src + suffix);
        model.traverse(node => { if (node instanceof THREE.Mesh) geometries.add(node.geometry); });
        if (disposed) { release(); return; }
        // Normalize the scan's original coordinates for predictable orbit and zoom controls.
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 2 / Math.max(size.x, size.y, size.z);
        model.position.copy(center).multiplyScalar(-scale);
        model.scale.setScalar(scale);
        scene.add(model);
        const fitDistance = () => {
          const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
          const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
          return 1.3 / Math.sin(Math.min(vertical, horizontal));
        };
        resetRef.current = () => {
          // Clear any remaining drag momentum before restoring the camera.
          controls!.enableDamping = false;
          controls!.update();
          controls!.enableDamping = true;
          const distance = fitDistance();
          camera.position.set(0.85, 0.45, 1).normalize().multiplyScalar(distance);
          controls!.target.set(0, 0, 0);
          controls!.minDistance = 1.3;
          controls!.maxDistance = distance * 3;
          controls!.update();
        };
        resetRef.current();
        canvas.addEventListener('keydown', event => {
          if (!controls) return;
          const offset = camera.position.clone().sub(controls.target);
          const spherical = new THREE.Spherical().setFromVector3(offset);
          switch (event.key) {
            case 'ArrowLeft': spherical.theta -= 0.12; break;
            case 'ArrowRight': spherical.theta += 0.12; break;
            case 'ArrowUp': spherical.phi -= 0.12; break;
            case 'ArrowDown': spherical.phi += 0.12; break;
            case '+': case '=': spherical.radius *= 0.9; break;
            case '-': spherical.radius *= 1.1; break;
            case 'Home': resetRef.current(); event.preventDefault(); return;
            default: return;
          }
          event.preventDefault();
          spherical.makeSafe();
          spherical.radius = THREE.MathUtils.clamp(spherical.radius, controls.minDistance, controls.maxDistance);
          camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
          controls.update();
        });
        renderer.setAnimationLoop(() => {
          if (!visible || disposed) return;
          controls!.update();
          renderer!.render(scene, camera);
        });
        if (!textureFailed) {
          // LoadingManager also tracks images requested by the MTL loader.
          const ready = () => { if (!disposed && !textureFailed) setStatus('ready'); };
          manager.onLoad = ready;
          if ([...textures].every(texture => texture.image instanceof HTMLImageElement && texture.image.complete)) ready();
        }
      } catch { fail(); }
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !started) { started = true; void start(); }
    }, { rootMargin: '300px' });
    observer.observe(host);
    return () => {
      disposed = true;
      observer.disconnect();
      resize?.disconnect();
      renderer?.setAnimationLoop(null);
      controls?.dispose();
      release();
      renderer?.dispose();
      renderer?.domElement.remove();
      resetRef.current = () => {};
    };
  }, [src, materialSrc, alt, attempt]);

  return <div ref={hostRef} className="model-viewer-shell" data-status={status} aria-busy={status === 'loading'}>
    {status === 'loading' && <div className="model-status" role="status">Loading 3D model…</div>}
    {status === 'error' && <div className="model-status" role="alert">
      <span>The 3D model couldn’t load.</span>
      <button type="button" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>Try again</button>
    </div>}
    {status === 'ready' && <>
      <span className="model-hint" aria-hidden="true">Drag to rotate · Scroll or pinch to zoom</span>
      <button type="button" className="model-reset" onClick={() => resetRef.current()} aria-label="Reset 3D view" title="Reset 3D view">↺</button>
    </>}
  </div>;
}
