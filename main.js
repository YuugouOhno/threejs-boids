import "./style.css"
import * as THREE from "three";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// キャンバスの指定
const canvas = document.querySelector(".webgl");


let scene, camera, renderer, sphereGeometry, aquarium;
//サイズ
let sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener("load", init);

const boids = [];
const type_of_bois = [];
const NUMBER = 50 //魚の数
const SIZE_OF_AQUARIUM = 100; //これより外に行かない

let params1 = {
  TYPE: "red",
  SPEED: 0.6,
  MAX_SPEED: 2,
  CENTER_OF_BOIDS: new THREE.Vector3(0, 0, 0), //群れの中心
  ACTION_RANGE_OF_BOIDS: 100, //群れの行動範囲
  WEIGHT_TO_SEPARATION: 1, //条件1 分離
  WEIGHT_TO_ALIGNMENT: 0.001, //条件2 整列
  WEIGHT_TO_COHESION: 0.001, //条件3 凝集
  SEPARATION_RANGE: 20, // 分離する範囲
  COHESION_RANGE: 40, // 凝集する範囲
  WEIGHT_TO_CENTER: 1,
  MATERIAL: new THREE.MeshPhysicalMaterial({
    color: "#ff0000",
    metalness: 0.865,
    roughness: 0.373,
    flatShading: true,
  }),
  GEOMETRY: new THREE.BoxGeometry(5, 5, 10),
}
let params2 = {
  TYPE: "blue",
  SPEED: 0.9,
  MAX_SPEED: 3,
  CENTER_OF_BOIDS: new THREE.Vector3(0, 0, 0), //群れの中心
  ACTION_RANGE_OF_BOIDS: 100, //群れの行動範囲
  WEIGHT_TO_SEPARATION: 0.9, //条件1 分離
  WEIGHT_TO_ALIGNMENT: 0.001, //条件2 整列
  WEIGHT_TO_COHESION: 0.0001, //条件3 凝集
  SEPARATION_RANGE: 10, // 分離する範囲
  COHESION_RANGE: 40, // 凝集する範囲
  WEIGHT_TO_CENTER: 0.001,
  MATERIAL: new THREE.MeshPhysicalMaterial({
    color: "#0000ff",
    metalness: 0.865,
    roughness: 0.373,
    flatShading: true,
  }),
  GEOMETRY: new THREE.BoxGeometry(3, 3, 5),
}
let params3 = {
  TYPE: "purple",
  SPEED: 0.9,
  MAX_SPEED: 2,
  CENTER_OF_BOIDS: new THREE.Vector3(0, 0, 0), //群れの中心
  ACTION_RANGE_OF_BOIDS: 100, //群れの行動範囲
  WEIGHT_TO_SEPARATION: 2, //条件1 分離
  WEIGHT_TO_ALIGNMENT: 0.001, //条件2 整列
  WEIGHT_TO_COHESION: 0.001, //条件3 凝集
  SEPARATION_RANGE: 10, // 分離する範囲
  COHESION_RANGE: 30, // 凝集する範囲
  WEIGHT_TO_CENTER: 0.001,
  MATERIAL: new THREE.MeshPhysicalMaterial({
    color: "#4b0082",
    metalness: 0.865,
    roughness: 0.373,
    flatShading: true,
  }),
  GEOMETRY: new THREE.BoxGeometry(5, 10, 15),
}

class Biont {
  constructor(x, y, z, id, params) {
    //オブジェクトの描画
    this.object = new THREE.Mesh(params.GEOMETRY, params.MATERIAL);
    scene.add(this.object);

    this.speed = params.SPEED; //速度
    this.max_speed = params.MAX_SPEED;
    this.weight_to_separation = params.WEIGHT_TO_SEPARATION; //条件1 分離
    this.weight_to_alignment = params.WEIGHT_TO_ALIGNMENT; //条件2 整列
    this.weight_to_cohesion = params.WEIGHT_TO_COHESION; //条件3 凝集
    this.separation_range = params.SEPARATION_RANGE; // 分離する範囲
    this.cohesion_range = params.COHESION_RANGE; // 凝集する範囲    
    this.weight_to_center = params.WEIGHT_TO_CENTER;

    this.center_of_boids = params.CENTER_OF_BOIDS; //群れの中心地点
    this.action_range_of_boids = params.ACTION_RANGE_OF_BOIDS //群れの行動範囲(半径)
    this.type = params.TYPE;
    this.id = id; // 個体識別番号

    this.xyz = new THREE.Vector3(x, y, z); //位置ベクトルの設定
    this.v = new THREE.Vector3(); //速度ベクトルの設定

    this.v_separation = new THREE.Vector3(); //分離のベクトル
    this.v_alignment = new THREE.Vector3(); //整列のベクトル
    this.v_cohesion = new THREE.Vector3(); //凝集のベクトル

    // 初期位置の反映
    this.object.position.copy(this.xyz);

    // 群れの種類の追加
    if (!type_of_bois.includes(this.type)) {
      type_of_bois.push(this.type);
    };
  }
  update() {
    //各条件の合算
    this.v.add(this.v_separation);
    this.v.add(this.v_alignment);
    this.v.add(this.v_cohesion);

    // 最高速度を設定
    if (this.v.length() > this.max_speed) {
      this.v.multiplyScalar(this.max_speed / this.v.length());
    } else if (this.v.length() < 0.1) {
      const random_move = Math.floor(Math.random() * 3) - 1
      this.v.addScalar(random_move)
    }


    //群れの速度の調整
    this.v.multiplyScalar(this.speed);

    //位置ベクトルに反映
    this.xyz.add(this.v);
  }
  draw() {
    //各条件の初期化
    this.v_separation.setScalar(0);
    this.v_alignment.setScalar(0);
    this.v_cohesion.setScalar(0);
    this.getSeparation(); // 分離
    this.getAlignment(); // 整列
    this.getCohesion(); // 集合
    this.setActionRange(); // 行動範囲外に出た際の処理
    // this.getRepellentForce(); // 自分の周りを追い出す
    this.update(); // 位置ベクトルに反映する
    this.setFaceDirection(); //進行方向を向く
    this.object.position.copy(this.xyz); // 描画
  }

  isInTheFieldOfVision(this_xyz, this_v, target_xyz) {
    return this_v.dot(target_xyz.sub(this_xyz)) > 0;
  }

  /**
   * 分離（Separation）
   */
  getSeparation() {
    const separation_vector = new THREE.Vector3();
    let separation_count = 0;
    boids.filter(biont =>
      biont.xyz.distanceTo(this.xyz) < this.separation_range &&
      this.type === biont.type
    ).forEach(biont => {
      const closeness = 1 / (Math.floor(biont.xyz.distanceTo(this.xyz)) + 1);
      separation_vector.add(this.xyz.clone().sub(biont.xyz).multiplyScalar(closeness));
      separation_count += 1;
    });
    if (separation_count) {
      separation_vector.divideScalar(separation_count);
    }
    this.v_separation.copy(separation_vector).multiplyScalar(this.weight_to_separation);

  }
  /**
   * 整列（Alignment）
   */
  getAlignment() {
    const alignment_vector = new THREE.Vector3();
    boids.filter(biont =>
      this.isInTheFieldOfVision(this.xyz.clone(), this.v.clone(), biont.xyz.clone()) &&
      this.id !== biont.id &&
      this.type === biont.type
    ).forEach(biont => {
      alignment_vector.add(biont.xyz);
    });
    alignment_vector.divideScalar(boids.length - 1);
    alignment_vector.sub(this.v)
    this.v_alignment.copy(alignment_vector).multiplyScalar(this.weight_to_alignment);
  }
  /**
   * 凝集（Cohesion）
   */
  getCohesion() {
    const cohesion_vector = new THREE.Vector3();
    let cohesion_count = 0;
    boids.filter(biont =>
      this.isInTheFieldOfVision(this.xyz.clone(), this.v.clone(), biont.xyz.clone()) &&
      this.id !== biont.id &&
      this.type === biont.type &&
      biont.xyz.distanceTo(this.xyz) < this.cohesion_range
    ).forEach(biont => {
      const closeness = biont.xyz.distanceTo(this.xyz);
      cohesion_vector.add(biont.xyz.clone().sub(this.xyz).multiplyScalar(closeness));
      cohesion_count += 1;
    });
    if (cohesion_count) {
      cohesion_vector.divideScalar(cohesion_count);
    }
    this.v_cohesion.copy(cohesion_vector).multiplyScalar(this.weight_to_cohesion);
  }
  /**
   * 行動できる範囲
   */
  setActionRange() {
    if (this.center_of_boids.distanceTo(this.xyz) > this.action_range_of_boids) {
      const x = this.center_of_boids.distanceTo(this.xyz) - this.action_range_of_boids;
      this.v.sub(this.xyz.clone().multiplyScalar(x * this.weight_to_center));
    }
  }
  getRepellentForce() {

  }
  setFaceDirection() {
    this.object.lookAt(this.xyz);
  }
}

//アニメーション
function animate() {
  // Call tick again on the next frame
  window.requestAnimationFrame(animate);

  boids.forEach(biont => {
    biont.draw();
  });

  // rot += 0.05; // 毎フレーム角度を0.5度ずつ足していく
  // // ラジアンに変換する
  // const radian = (rot * Math.PI) / 180;
  // // 角度に応じてカメラの位置を設定
  // camera.position.x = 150 * Math.sin(radian);
  // camera.position.z = 150 * Math.cos(radian);

  //カメラの向きを指定
  camera.lookAt(aquarium.position);

  // Render
  renderer.render(scene, camera);
}

function init() {
  //シーン
  scene = new THREE.Scene();

  //カメラ
  camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000
  );

  camera.position.set(0, SIZE_OF_AQUARIUM * 1.2, SIZE_OF_AQUARIUM * 1.2);
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

  // //メッシュ
  aquarium = new THREE.Mesh(sphereGeometry, normalMaterial);
  scene.add(aquarium);

  //カメラの方向
  camera.lookAt(aquarium.position);

  //ライト
  const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
  directionalLight.position.set(0.5, 1, 0);
  scene.add(directionalLight);

  // biontを作成
  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, i, params1)
    );
  }

  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, i, params2)
    );
  }

  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, i, params3)
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