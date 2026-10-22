import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function initChilledWaterViewer() {
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
    scene.add(new THREE.HemisphereLight(0xe1efff, 0x53614b, 2));
    const key = new THREE.DirectionalLight(0xffffff, 2);
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
    const gltf = await new GLTFLoader().loadAsync(new URL('./models/chilled-water-fabrication.glb', import.meta.url).href);
    const model = gltf.scene;
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(largest) || largest === 0) throw new Error('Model has no viewable geometry');
    const scale = 10 / largest;
    model.position.copy(center).multiplyScalar(-scale);
    model.scale.setScalar(scale);
    const components = [];
    const originalMaterials = new Map();
    model.traverse(object => {
      if (object.isMesh) {
        object.material = object.material.clone();
        components.push(object);
        originalMaterials.set(object, object.material.clone());
      }
    });
    scene.add(model);
    // Frame a bounding sphere so the initial view fits portrait and landscape screens.
    const reset = () => {
      resize();
      const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
      const direction = new THREE.Vector3(1, 0.65, 1).normalize();
      const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
      const up = new THREE.Vector3().crossVectors(direction, right).normalize();
      const half = size.clone().multiplyScalar(scale / 2);
      let distance = 0;
      for (const x of [-half.x, half.x]) for (const y of [-half.y, half.y]) for (const z of [-half.z, half.z]) {
        const corner = new THREE.Vector3(x, y, z);
        distance = Math.max(distance, corner.dot(direction) + Math.max(Math.abs(corner.dot(right)) / Math.tan(horizontal), Math.abs(corner.dot(up)) / Math.tan(vertical)));
      }
      camera.position.copy(direction.multiplyScalar(distance * 1.15));
      controls.target.set(0, 0, 0);
      controls.update();
      render();
    };
    reset();
    const componentSelect = document.querySelector('#chw-component');
    const modeSelect = document.querySelector('#chw-color-mode');
    let selected = null;
    const fields = document.querySelector('.component-details');
    const colors = { CHWS: 0x58b7f0, CHWR: 0xeea263, CRAH: 0x979fa5 };
    const paint = () => {
      components.forEach(mesh => {
        mesh.material.copy(originalMaterials.get(mesh));
        if (modeSelect.value === 'systems') {
          mesh.material.color.setHex(colors[mesh.userData.system] ?? colors.CRAH);
          mesh.material.metalness = 0.1;
          mesh.material.roughness = 0.6;
        }
        if (mesh === selected) {
          mesh.material.emissive.setHex(0x446522);
          mesh.material.emissiveIntensity = 0.65;
        }
      });
      render();
    };
    const selectComponent = mesh => {
      selected = mesh;
      componentSelect.value = mesh ? mesh.uuid : '';
      fields.hidden = !mesh;
      document.querySelector('.component-hint').hidden = Boolean(mesh);
      if (mesh) {
        for (const key of ['component','system','assembly','elementId','ifcClass','materialFinish']) {
          fields.querySelector(`[data-field="${key}"]`).textContent = mesh.userData[key] || 'Not provided';
        }
      }
      paint();
    };
    components.forEach(mesh => {
      const option = document.createElement('option');
      option.value = mesh.uuid;
      option.textContent = `${mesh.userData.system} · ${mesh.userData.component} · ${mesh.userData.elementId}`;
      componentSelect.append(option);
    });
    componentSelect.disabled = false;
    modeSelect.disabled = false;
    componentSelect.addEventListener('change', () => selectComponent(components.find(mesh => mesh.uuid === componentSelect.value) || null));
    modeSelect.addEventListener('change', paint);
    const filters = document.querySelectorAll('.chw-filters input');
    filters.forEach(input => {
      input.disabled = false;
      input.addEventListener('change', () => {
        const enabled = new Set([...filters].filter(input => input.checked).map(input => input.value));
        components.forEach(mesh => { mesh.visible = enabled.has(mesh.userData.system); });
        [...componentSelect.options].forEach(option => {
          const mesh = components.find(mesh => mesh.uuid === option.value);
          if (mesh) option.disabled = !mesh.visible;
        });
        if (selected && !selected.visible) selectComponent(null);
        render();
      });
    });
    const raycaster = new THREE.Raycaster();
    let pointerDown = null;
    canvas.addEventListener('pointerdown', event => { pointerDown = [event.clientX, event.clientY]; });
    canvas.addEventListener('pointerup', event => {
      if (!pointerDown || Math.hypot(event.clientX-pointerDown[0], event.clientY-pointerDown[1]) > 5) return;
      const bounds = canvas.getBoundingClientRect();
      const pointer = new THREE.Vector2((event.clientX-bounds.left)/bounds.width*2-1, -(event.clientY-bounds.top)/bounds.height*2+1);
      raycaster.setFromCamera(pointer,camera);
      const hit = raycaster.intersectObjects(components.filter(mesh => mesh.visible),false)[0];
      selectComponent(hit?.object || null);
    });
    paint();
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
