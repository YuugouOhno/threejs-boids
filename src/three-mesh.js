import * as THREE from "three";

import { aquariumGeometry, cameraTargetGeometry } from "./three-geometry";
import{ normalMaterial } from "./three-material";

const aquarium = new THREE.Mesh(aquariumGeometry, normalMaterial);
const cameraTarget = new THREE.Mesh(cameraTargetGeometry, normalMaterial);

export { aquarium, cameraTarget };