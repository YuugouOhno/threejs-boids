import "./style.css"
import * as THREE from "three";
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

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
const NUMBER = 100 //魚の数
const AREA_OF_MOVE = 100; //これより外に行かない
const type_of_bois = [];

let params1 = {
  TYPE: "red",
  SPEED: 2,
  MAX_SPEED: 5,
  WEIGHT_TO_SEPARATION: 0.8, //条件1　回避
  WEIGHT_TO_ALIGNMENT: 0.1, //条件2　整列
  PERSONAL_SPACE: 5,
  WEIGHT_TO_THIRD_CONDITION: 0.001, //条件3　集合
  WEIGHT_TO_GYRATION: 1, //回転
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
  SPEED: 2,
  MAX_SPEED: 3,
  WEIGHT_TO_SEPARATION: 0.9, //条件1　回避
  WEIGHT_TO_ALIGNMENT: 0.1, //条件2　整列
  PERSONAL_SPACE: 5,
  WEIGHT_TO_THIRD_CONDITION: 0.005, //条件3　集合
  WEIGHT_TO_GYRATION: 1, //回転
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
  SPEED: 1,
  MAX_SPEED: 4,
  WEIGHT_TO_SEPARATION: 0.9, //条件1 回避
  WEIGHT_TO_ALIGNMENT: 0.1, //条件2 整列
  PERSONAL_SPACE: 5,
  WEIGHT_TO_THIRD_CONDITION: 0.001, //条件3 集合
  WEIGHT_TO_GYRATION: 1, //回転
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
  constructor(x, y, z, vx, vy, vz, id, params) {
    //メッシュ
    this.object = new THREE.Mesh(params.GEOMETRY, params.MATERIAL);

    //初期位置
    // this.object.position.x = this.x
    // this.object.position.y = this.y
    // this.object.position.z = this.z
    scene.add(this.object);

    this.speed = params.SPEED;
    this.max_speed = params.MAX_SPEED;
    this.weight_to_separation = params.WEIGHT_TO_SEPARATION; //条件1 回避
    this.weight_to_alignment = params.WEIGHT_TO_ALIGNMENT; //条件2 整列
    this.personal_space = params.PERSONAL_SPACE; //これより近いと避ける
    this.weight_to_third_condition = params.WEIGHT_TO_THIRD_CONDITION; //条件3 集合
    this.weight_to_gyration = params.WEIGHT_TO_GYRATION;
    this.weight_to_center = params.WEIGHT_TO_CENTER;
    this.type = params.TYPE;
    this.rot = 0;//回転の調整
    this.id = id; // 個体識別番号

    // this.x = x; // 個体のx座標
    // this.y = y; // 個体のy座標
    // this.z = z; // 個体のz座標
    this.xyz = new THREE.Vector3(x,y,z);

    // this.vx = vx; // 個体のx方向の速度
    // this.vy = vy; // 個体のy方向の速度
    // this.vz = vz; // 個体のz方向の速度
    this.v = new THREE.Vector3();
    
    // this.v1 = { x: 0, y: 0, z: 0 }; // 条件1を表す速度ベクトル
    // this.v2 = { x: 0, y: 0, z: 0 }; // 条件2を表す速度ベクトル
    // this.v3 = { x: 0, y: 0, z: 0 }; // 条件3を表す速度ベクトル
    // this.v_to_center = { x: 0, y: 0, z: 0 };
    this.v_separation = new THREE.Vector3();
    this.v_alignment = new THREE.Vector3();
    this.v_cohesion = new THREE.Vector3();
    this.v_to_center = new THREE.Vector3();

    // const objLoader = new OBJLoader();
    // objLoader.load(
    //   './models/fish.obj',
    //   (fish) => {
    //     fish.scale.set(20, 20, 20);
    //     scene.add(fish);
    //   }
    // );

    this.object.position.copy(this.xyz);

    if (!type_of_bois.includes(this.type)) {
      type_of_bois.push(this.type);
    };
  }
  update() {
    // this.vx += this.weight_to_first_condition * this.v1.x + this.weight_to_second_condition * this.v2.x + this.weight_to_third_condition * this.v3.x + this.weight_to_center * this.v_to_center.x;
    // this.vy += this.weight_to_first_condition * this.v1.y + this.weight_to_second_condition * this.v2.y + this.weight_to_third_condition * this.v3.y + this.weight_to_center * this.v_to_center.y;
    // this.vz += this.weight_to_first_condition * this.v1.z + this.weight_to_second_condition * this.v2.z + this.weight_to_third_condition * this.v3.z + this.weight_to_center * this.v_to_center.z;
    
    this.v.add(this.v_separation);
    this.v.add(this.v_alignment);
    this.v.add(this.v_cohesion);
    this.v.add(this.v_to_center);

    // 最高速度を設定
    // const movement = Math.sqrt(this.vx * this.vx + this.vy * this.vy + this.vz * this.vz);
    // if (movement > this.max_speed) {
    //   this.vx = (this.vx / movement) * this.max_speed;
    //   this.vy = (this.vy / movement) * this.max_speed;
    //   this.vz = (this.vz / movement) * this.max_speed;
    // }

    // this.x += this.vx;
    // this.y += this.vy;
    // this.z += this.vz;
    this.xyz.add(this.v);

  }
  draw() {
    // this.v1 = { x: 0, y: 0, z: 0 };
    // this.v2 = { x: 0, y: 0, z: 0 };
    // this.v3 = { x: 0, y: 0, z: 0 };
    // this.v_to_center = { x: 0, y: 0, z: 0 };
    this.v_separation.setScalar(0);
    this.v_alignment.setScalar(0);
    this.v_cohesion.setScalar(0);
    this.v_to_center.setScalar(0);

    this.getSeparation(); // 分散 衝突回避
    this.getAlignment(); // 整列
    // this.getCohesion(); // 結合 向心運動

    // this.setTheArea(); //水槽の中心に向かう

    this.update();
    // this.getGyration(); // 回転運動
    // this.setFaceDirection(); //進行方向を向く

    // this.object.position.x = this.x;
    // this.object.position.y = this.y;
    // this.object.position.z = this.z;
    this.object.position.copy(this.xyz);
  }

  /**
   * 分離（Separation）
   */
  getSeparation() {
    const separation_vector = new THREE.Vector3();
    let separation_count = 0;
    boids.filter(biont => 
      biont.xyz.distanceTo(this.xyz) < this.personal_space && 
      this.type === biont.type
    ).forEach(biont => {
      // this.v1.x -= (biont.x - this.x);
      // this.v1.y -= (biont.y - this.y);
      // this.v1.z -= (biont.z - this.z);
      const closeness = 1/(Math.floor(biont.xyz.distanceTo(this.xyz))+1);
      separation_vector.add(this.xyz.clone().sub(biont.xyz).multiplyScalar(closeness));
      separation_count += 1;
    });
    separation_vector.divideScalar(separation_count);
    this.v_separation.copy(separation_vector).multiplyScalar(this.weight_to_separation);
  }
  /**
   * 整列（Alignment）
   */
  getAlignment() {
    // avgVに各個体の速度の平均を代入します
    const alignment_vector = new THREE.Vector3();
    boids.filter(biont => 
      this.id !== biont.id && 
      this.type === biont.type
    ).forEach(biont => {
      // avgV.x += biont.vx;
      // avgV.y += biont.vy;
      // avgV.z += biont.vz;
      alignment_vector.add(biont.xyz);
    });
    // avgV.x /= boids.length - 1;
    // avgV.y /= boids.length - 1;
    // avgV.z /= boids.length - 1;
    alignment_vector.divideScalar(boids.length - 1);
    // this.v2.x = avgV.x - this.vx;
    // this.v2.y = avgV.y - this.vy;
    // this.v2.z = avgV.z - this.vz;
    alignment_vector.sub(this.v)
    this.v_alignment.copy(alignment_vector).multiplyScalar(this.weight_to_alignment);
  }
  /**
   * 結合（Cohesion）
   */
  getCohesion() {
    // 他の個体の座標の平均をgetToCenterVectorに代入します
    const cohesion_vector = new THREE.Vector3();
    boids.filter(biont => 
      this.id !== biont.id && 
      this.type === biont.type
    ).forEach(biont => {
      // center.x += biont.x;
      // center.y += biont.y;
      // center.z += biont.z;

    });
    center.x /= (boids.length / type_of_bois.length - 1);
    center.y /= (boids.length / type_of_bois.length - 1);
    center.z /= (boids.length / type_of_bois.length - 1);

    this.v3.x = center.x - this.x;
    this.v3.y = center.y - this.y;
    this.v3.z = center.z - this.z;
  }
  /**
   * 行動できる範囲
   */
  setTheArea() {
    if (dist(0, 0, 0, this.x, this.y, this.z) > AREA_OF_MOVE) {
      this.v_to_center.x += -(this.x * (dist(0, 0, 0, this.x, this.y, this.z) - AREA_OF_MOVE));
      this.v_to_center.y += -(this.y * (dist(0, 0, 0, this.x, this.y, this.z) - AREA_OF_MOVE));
      this.v_to_center.z += -(this.z * (dist(0, 0, 0, this.x, this.y, this.z) - AREA_OF_MOVE));
    }
  }

  getGyration() {
    this.rot += 1 * this.speed; // 毎フレーム角度を0.5度ずつ足していく
    // ラジアンに変換する
    const radian = (this.rot * Math.PI) / 180;
    // this.v_gyration.x += Math.sin(radian);
    // this.v_gyration.z += Math.cos(radian);

    this.x += Math.sin(radian) * this.weight_to_gyration;
    this.z += Math.cos(radian) * this.weight_to_gyration;

  }
  setFaceDirection() {
    this.object.lookAt(new THREE.Vector3(this.x, this.y, this.z));
  }
}

// //(x0, y0, z0)と(x1, y1, z1)の距離を返す
// function dist(x0, y0, z0, x1, y1, z1) {
//   return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) + (z1 - z0) * (z1 - z0));
// }

function distance(vector_a, vector_b) {
  return vector_a.distanceTo(vector_b)
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

  camera.position.set(0, AREA_OF_MOVE * 1.4, AREA_OF_MOVE * 1.4);
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
  sphereGeometry = new THREE.SphereGeometry(AREA_OF_MOVE * 1.2, 32, 16);

  // //メッシュ
  aquarium = new THREE.Mesh(sphereGeometry, normalMaterial);
  scene.add(aquarium);

  //カメラの方向
  camera.lookAt(aquarium.position);

  //ライト
  const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
  directionalLight.position.set(0.5, 1, 0);
  scene.add(directionalLight);

  //biontを作成
  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 2, 2, 2, i, params1)
    );
  }

  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 2, 2, 2, i, params2)
    );
  }

  for (let i = 0; i < NUMBER; i++) {
    boids.push(
      new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 2, 2, 2, i, params3)
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