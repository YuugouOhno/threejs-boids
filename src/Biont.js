import * as THREE from "three";
import { boids, type_of_bois } from "./boids";

class Biont {
    constructor(x, y, z, id, params, scene) {
        const bodyGeometry = new THREE.OctahedronGeometry(5);
        const body = new THREE.Mesh(bodyGeometry, params.MATERIAL);
        body.position.set(0, 0, 0);
        body.scale.set(1, 1.1, 2)

        const tailGeometry = new THREE.CircleGeometry(10, 32, 0, (Math.PI * 70) / 180);
        const tail1 = new THREE.Mesh(tailGeometry, params.MATERIAL);
        tail1.position.set(0, 0, -5);
        tail1.rotation.set(-35 * (Math.PI) / 180, (Math.PI) / 2, 0);
        tail1.height = 0.1;

        const tail2 = new THREE.Mesh(tailGeometry, params.MATERIAL);
        tail2.position.set(0, 0, -5);
        tail2.rotation.set(-35 * (Math.PI) / 180, -(Math.PI) / 2, 0);
        tail2.height = 0.1;

        this.object = new THREE.Group();
        this.object.add(body);
        this.object.add(tail1);
        this.object.add(tail2);

        //オブジェクトの描画
        // this.object = new THREE.Mesh(params.GEOMETRY, params.MATERIAL);
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

export default Biont;