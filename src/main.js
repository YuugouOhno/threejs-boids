import "../style.css"
import * as THREE from "three";
import { params1, params2, params3 } from "./params";
import Biont from "./Biont";
import { boids } from "./boids";

// キャンバスの指定
const canvas = document.querySelector(".webgl");

let scene, camera, renderer, sphereGeometry, aquarium, cameraTargetGeometry, cameraTarget;
//サイズ
let sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
let camera_rot = 0;
let rot = 0;
let cameraInTheAquarium = true;

window.addEventListener("load", init);

const NUMBER = 100 //魚の数
const SIZE_OF_AQUARIUM = 100; //これより外に行かない

//アニメーション
function animate() {
  // Call tick again on the next frame
  window.requestAnimationFrame(animate);

  boids.forEach(biont => {
    biont.draw();
  });

  rot += camera_rot; // 毎フレーム角度を0.5度ずつ足していく

  // // ラジアンに変換する
  const radian = (rot * Math.PI) / 180;
  // // 角度に応じてカメラの位置を設定
  if (cameraInTheAquarium) {
    cameraTarget.position.x = 150 * Math.sin(radian);
  cameraTarget.position.z = 150 * Math.cos(radian);
  camera.lookAt(cameraTarget.position);
  } else {
    camera.position.x = 150 * Math.sin(radian);
    camera.position.z = 150 * Math.cos(radian);
    camera.lookAt(aquarium.position);
  }

  // Render
  renderer.render(scene, camera);
}

function init() {
  //シーン
  scene = new THREE.Scene();

  //カメラ
  camera = new THREE.PerspectiveCamera(
    90,
    sizes.width / sizes.height,
    0.1,
    1000
  );

  if (cameraInTheAquarium) {
    camera.position.set(0, 0, 0);
  } else {
    camera.position.set(0, SIZE_OF_AQUARIUM * 1.2, SIZE_OF_AQUARIUM * 1.2);
  }
  
  scene.add(camera);

  //レンダラー
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,

  });

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);

  const normalMaterial = new THREE.MeshNormalMaterial({
    wireframe: true,
  });

  //ジオメトリ
  sphereGeometry = new THREE.SphereGeometry(SIZE_OF_AQUARIUM, 32, 16);
  cameraTargetGeometry = new THREE.SphereGeometry(0.0001, 32, 16);

  // //メッシュ
  aquarium = new THREE.Mesh(sphereGeometry, normalMaterial);
  cameraTarget = new THREE.Mesh(cameraTargetGeometry, normalMaterial);
  scene.add(aquarium, cameraTarget);

  cameraTarget.position.set(0, 0, SIZE_OF_AQUARIUM * 1.2);

  //カメラの方向
  if (cameraInTheAquarium) {
    camera.lookAt(cameraTarget.position);
  } else {
    camera.lookAt(aquarium.position);
  }

  //ライト
  const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
  directionalLight.position.set(0.5, 1, 0);
  scene.add(directionalLight);

  // biontを作成
  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, i, params1, scene)
    );
  }

  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, i, params2, scene)
    );
  }

  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, i, params3, scene)
    );
  }

  window.addEventListener("resize", onWindowResize)

  animate();
}

//リサイズ
function onWindowResize() {
  // サイズをアップデート
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // カメラをアップデート
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // レンダラーをアップデート
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
};

document.addEventListener('keydown', keydown_ivent);
document.addEventListener('keyup', keyup_ivent);

function keydown_ivent(e) {
	switch (e.key) {
		case 'ArrowLeft':
			camera_rot += 1;
      console.log("left")
			break;
		case 'ArrowRight':
			camera_rot -= 1;
			break;
    case 'Enter':
      cameraInTheAquarium = !cameraInTheAquarium
      if (cameraInTheAquarium) {
        camera.position.set(0, 0, 0);
        camera.lookAt(cameraTarget.position);
      } else {
        camera.position.set(0, SIZE_OF_AQUARIUM * 1.2, SIZE_OF_AQUARIUM * 1.2);
        camera.lookAt(aquarium.position);
      }
      break;
	}
	
	return false;
}

function keyup_ivent(e) {
	camera_rot = 0;
	return false; 
}