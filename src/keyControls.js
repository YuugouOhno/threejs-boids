import { cameraRot } from "./setting-camera";
import { activeRange } from "./setting-biont-params";

import { camera } from "./three-camera";
import { aquarium, cameraTarget } from "./three-mesh";



const keyControls = () => {
    document.addEventListener('keydown', keydown_ivent);
    document.addEventListener('keyup', keyup_ivent);
}

const keydown_ivent = (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            cameraRot.lr += 1;
            break;
        case 'ArrowRight':
            cameraRot.lr -= 1;
            break;
        case 'ArrowUp':
            cameraRot.ud += 2;
            break;
        case 'ArrowDown':
            cameraRot.ud -= 2;
            break;
        case 'Enter':
            cameraRot.cameraInTheAquarium = !cameraRot.cameraInTheAquarium
            if (cameraRot.cameraInTheAquarium) {
                camera.position.set(0, 0, 0);
                camera.lookAt(cameraTarget.position);
            } else {
                camera.position.set(0, activeRange * 1.2, activeRange * 1.2);
                camera.lookAt(aquarium.position);
            }
            break;
    }
    console.log(cameraRot)
    return false;
}

const keyup_ivent = () => {
    cameraRot.lr = 0;
    cameraRot.ud = 0;
    return false;
}

export default keyControls;