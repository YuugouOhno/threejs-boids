import "./style.css"
import * as THREE from "three";

// キャンバスの指定
const canvas = document.querySelector(".webgl");

//サイズ
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

/**
 * 必須の三要素
 */

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

camera.position.set(0, 150, 150);
scene.add(camera);

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,

});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//マテリアル
const physicalMaterial = new THREE.MeshPhysicalMaterial({
  color: "#3c94d7",
  metalness: 0.865,
  roughness: 0.373,
  flatShading: true,
});

const normalMaterial = new THREE.MeshNormalMaterial({
  wireframe: true,
});

//ジオメトリ
const octahedronGeometry = new THREE.OctahedronGeometry(5);
const sphereGeometry = new THREE.SphereGeometry(100, 32, 16);

// //メッシュ
const aquarium = new THREE.Mesh(sphereGeometry, normalMaterial);
scene.add(aquarium);

//カメラの方向
camera.lookAt(aquarium.position);

//ライト
const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
directionalLight.position.set(0.5, 1, 0);
scene.add(directionalLight);

//リサイズ
window.addEventListener("resize", () => {
  // サイズをアップデート
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // カメラをアップデート
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // レンダラーをアップデート
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});

const boids = [];
const radius = 5;
const area = 100;

//(x0, y0, z0)と(x1, y1, z1)の距離を返す
function dist(x0, y0, z0, x1, y1, z1) {
  return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) + (z1 - z0) * (z1 - z0));
}

class Biont {
  constructor(x, y, z, vx, vy, vz, id) {
    this.x = x; // 個体のx座標
    this.y = y; // 個体のy座標
    this.z = z; // 個体のz座標
    this.vx = vx; // 個体のx方向の速度
    this.vy = vy; // 個体のy方向の速度
    this.vz = vz; // 個体のz方向の速度
    this.id = id; // 個体識別番号

    this.v1 = { x: 0, y: 0, z: 0 }; // 条件1を表す速度ベクトル
    this.v2 = { x: 0, y: 0, z: 0 }; // 条件2を表す速度ベクトル
    this.v3 = { x: 0, y: 0, z: 0 }; // 条件3を表す速度ベクトル

    //メッシュ
    this.object = new THREE.Mesh(octahedronGeometry, physicalMaterial);
    //初期位置
    this.object.position.x = this.x
    this.object.position.y = this.y
    this.object.position.z = this.z
    scene.add(this.object);
  }
  update() {
    const MAX_SPEED = 2;
    // 各条件に対する重み付け
    /**
 *  1 他の個体と離れないこと
 *  2 他の個体と衝突しないこと
 *  3 全体の流れに沿って動くこと
 */

    const weightToOne = 0.001;
    const weightToTwo = 0.9;
    const weightToThree = 0.05;
    this.vx += weightToOne * this.v1.x + weightToTwo * this.v2.x + weightToThree * this.v3.x;
    this.vy += weightToOne * this.v1.y + weightToTwo * this.v2.y + weightToThree * this.v3.y;
    this.vz += weightToOne * this.v1.z + weightToTwo * this.v2.z + weightToThree * this.v3.z;

    // 最高速度を設定
    const movement = Math.sqrt(this.vx * this.vx + this.vy * this.vy + this.vz * this.vz);
    if (movement > MAX_SPEED) {
      this.vx = (this.vx / movement) * MAX_SPEED;
      this.vy = (this.vy / movement) * MAX_SPEED;
      this.vz = (this.vz / movement) * MAX_SPEED;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
  }
  draw() {
    this.v1 = { x: 0, y: 0, z: 0 };
    this.v2 = { x: 0, y: 0, z: 0 };
    this.v3 = { x: 0, y: 0, z: 0 };

    this.getToCenterVector();
    this.getAvoidanceVector();
    this.getAverageVelocityVector();
    this.isInTheArea();
    this.update();

    this.object.position.x = this.x
    this.object.position.y = this.y
    this.object.position.z = this.z

    // context.beginPath();
    // context.strokeStyle = "#ffffff";
    // context.lineWidth = 2
    // context.arc(this.x, this.y, radius / 2, 0, 2 * Math.PI);
    // context.moveTo(this.x, this.y);
    // context.lineTo(this.x + this.vx * 3, this.y + this.vy * 3);
    // context.stroke();
  }
  /**
   * 集団の中心に向かって移動します
   */
  getToCenterVector() {
    // 他の個体の座標の平均をgetToCenterVectorに代入します
    const center = { x: 0, y: 0, z: 0 };
    boids.filter(biont => this.id !== biont.id).forEach(biont => {
      center.x += biont.x;
      center.y += biont.y;
      center.z += biont.z;
    });
    center.x /= boids.length - 1;
    center.y /= boids.length - 1;
    center.z /= boids.length - 1;

    this.v1.x = center.x - this.x;
    this.v1.y = center.y - this.y;
    this.v1.z = center.z - this.z;
  }
  /**
   * DIST_THRESHOLD内に仲間がいると避けます
   */
  getAvoidanceVector() {
    const DIST_THRESHOLD = radius;
    boids.filter(
      biont => dist(this.x, this.y, this.z, biont.x, biont.y, biont.z) < DIST_THRESHOLD
    ).forEach(biont => {
      this.v2.x -= biont.x - this.x;
      this.v2.y -= biont.y - this.y;
      this.v2.z -= biont.z - this.z;
    });
  }
  /**
   * 集団の速度の平均に近づけます
   */
  getAverageVelocityVector() {
    // avgVに各個体の速度の平均を代入します
    const avgV = { x: 0, y: 0, z: 0 };
    boids.filter(biont => this.id !== biont.id).forEach(biont => {
      avgV.x += biont.vx;
      avgV.y += biont.vy;
      avgV.z += biont.vz;
    });
    avgV.x /= boids.length - 1;
    avgV.y /= boids.length - 1;
    avgV.z /= boids.length - 1;
    this.v3.x = avgV.x - this.vx;
    this.v3.y = avgV.y - this.vy;
    this.v3.z = avgV.z - this.vz;
  }
  /**
   * 行動できる範囲
   */
  isInTheArea() {
    if (dist(0, 0, 0, this.x, this.y, this.z) >= area) {
      this.vx *= (-0.7);
      this.vy *= (-0.7);
      this.vz *= (-0.7);
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz;
    }
  }
}

for (let i = 0; i < 300; i++) {
  boids.push(
    new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 2, 2, 2, i)
  );
}

//アニメーション
const animate = () => {
  // Call tick again on the next frame
  window.requestAnimationFrame(animate);

  boids.forEach(biont => {
    biont.draw();
  });

  camera.lookAt(aquarium.position);

  // Render
  renderer.render(scene, camera);
}

animate();