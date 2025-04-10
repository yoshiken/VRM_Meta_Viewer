import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import type { GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader.js';

// シーン、カメラ、レンダラーの初期化
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// VRMローダーの設定
const loader = new GLTFLoader();
loader.register((parser: GLTFParser) => new VRMLoaderPlugin(parser));

// ドラッグ&ドロップイベントの設定
document.addEventListener('dragover', (event) => {
  event.preventDefault();
});

document.addEventListener('drop', async (event) => {
  event.preventDefault();

  const file = event.dataTransfer?.files[0];
  if (!file || !file.name.endsWith('.vrm')) return;

  const arrayBuffer = await file.arrayBuffer();
  const vrm = await loadVRM(arrayBuffer);

  if (vrm) {
    displayVRMMeta(vrm);
  }
});

// VRMをロードする関数
async function loadVRM(arrayBuffer: ArrayBuffer) {
  try {
    const gltf = await loader.parseAsync(arrayBuffer, '');
    const vrm = gltf.userData.vrm;
    VRMUtils.rotateVRM0(vrm);
    scene.add(vrm.scene);
    return vrm;
  } catch (error) {
    console.error('VRMの読み込みに失敗しました:', error);
    return null;
  }
}

// VRMメタ情報を表示する関数
function displayVRMMeta(vrm: any) {
  const meta = vrm.meta;
  const metaInfo = document.getElementById('meta-info');

  if (metaInfo) {
    metaInfo.innerHTML = `
      <h2>${meta.title || '無題'}</h2>
      <p>作者: ${meta.author || '不明'}</p>
      <p>バージョン: ${meta.version || '不明'}</p>
      <p>連絡先: ${meta.contactInformation || '不明'}</p>
      <p>利用規約: ${meta.usageRights || '不明'}</p>
      <p>ライセンス: ${meta.licenseUrl || '不明'}</p>
      <p>サムネイル: ${meta.thumbnailImage ? 'あり' : 'なし'}</p>
    `;
  }
}

// ドラッグ開始時のUI更新
document.addEventListener('dragenter', (event) => {
  const dropArea = document.getElementById('drop-area');
  if (dropArea) {
    dropArea.style.backgroundColor = 'rgba(0, 100, 200, 0.7)';
  }
});

// ドラッグ終了時のUIリセット
document.addEventListener('dragleave', (event) => {
  const dropArea = document.getElementById('drop-area');
  if (dropArea) {
    dropArea.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  }
});

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
