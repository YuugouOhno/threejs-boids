import * as THREE from "three";

import { activeRange } from "./setting-biont-params";

const aquariumGeometry = new THREE.SphereGeometry(activeRange*1.1, 32, 16);
const cameraTargetGeometry = new THREE.SphereGeometry(0.00001, 32, 16);

export { aquariumGeometry, cameraTargetGeometry };