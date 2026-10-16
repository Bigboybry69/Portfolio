import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function initModelViewer() {
  const stage = document.querySelector('.model-stage');
  const status = document.querySelector('.model-status');
  const toolbar = document.querySelector('.model-toolbar');
  const canvas = stage.querySelector('canvas');
  let renderer;
  let controls;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 300);
    scene.add(new THREE.HemisphereLight(0xc8e6ff, 0x334558, 3));
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(5, 10, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x79c5ff, 2);
    rim.position.set(-8, 3, -6);
    scene.add(rim);
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.minDistance = 0.7;
    controls.maxDistance = 65;
    controls.screenSpacePanning = true;
    const render = () => renderer.render(scene, camera);
    controls.addEventListener('change', render);
    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };
    new ResizeObserver(resize).observe(stage);
    const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/chiller-water.glb`);
    const model = gltf.scene;
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(largest) || largest === 0) throw new Error('Model has no viewable geometry');
    const scale = 10 / largest;
    model.position.copy(center).multiplyScalar(-scale);
    model.scale.setScalar(scale);
    const material = new THREE.MeshStandardMaterial({ color: 0xaac7d7, metalness: 0.15, roughness: 0.5, side: THREE.DoubleSide });
    model.traverse(object => { if (object.isMesh) object.material = material; });
    scene.add(model);
    // Frame a bounding sphere so the initial view fits portrait and landscape screens.
    const radius = size.length() * scale / 2;
    const reset = () => {
      resize();
      const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
      const distance = radius / Math.sin(Math.min(vertical, horizontal)) * 1.15;
      camera.position.copy(new THREE.Vector3(1, 0.65, 1).normalize().multiplyScalar(distance));
      controls.target.set(0, 0, 0);
      controls.update();
      render();
    };
    reset();
    stage.dataset.loaded = 'true';
    status.textContent = 'Model ready';
    status.classList.add('model-status-ready');
    toolbar.querySelectorAll('button').forEach(button => { button.disabled = false; });
    toolbar.addEventListener('click', async event => {
      const button = event.target.closest('button');
      if (!button) return;
      switch (button.dataset.action) {
        case 'reset': reset(); break;
        case 'zoom-in':
        case 'zoom-out': {
          const offset = camera.position.clone().sub(controls.target);
          const distance = THREE.MathUtils.clamp(offset.length() * (button.dataset.action === 'zoom-in' ? 0.8 : 1.25), controls.minDistance, controls.maxDistance);
          camera.position.copy(controls.target).add(offset.setLength(distance));
          controls.update(); render(); break;
        }
        case 'fullscreen':
          try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await document.querySelector('.model-viewer').requestFullscreen();
          } catch { document.querySelector('.model-help').textContent = 'Fullscreen is unavailable in this browser. You can still rotate and zoom here.'; }
          break;
      }
    });
    const fullscreenButton = toolbar.querySelector('[data-action="fullscreen"]');
    if (!document.fullscreenEnabled) fullscreenButton.hidden = true;
    document.addEventListener('fullscreenchange', () => {
      fullscreenButton.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
    });
    canvas.addEventListener('keydown', event => {
      const step = Math.max(camera.position.distanceTo(controls.target) * 0.04, 0.1);
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const axis = ['ArrowLeft', 'ArrowRight'].includes(event.key) ? 'x' : 'y';
        const change = ['ArrowRight', 'ArrowUp'].includes(event.key) ? step : -step;
        camera.position[axis] += change;
        controls.target[axis] += change;
        controls.update(); render();
      }
    });
  } catch (error) {
    console.error('3D viewer could not load:', error);
    controls?.dispose();
    renderer?.dispose();
    stage.dataset.loaded = 'error';
    status.textContent = 'The 3D model couldn’t load. Please refresh or try a browser with WebGL enabled.';
  }
}
