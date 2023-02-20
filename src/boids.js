import scene from "./three-scene";
import Biont from "./Biont";

const boids = [];
const type_of_bois = [];
const createBoids = (params) => {
    for (let i = 0; i < params.NUMBER; i++) {
        boids.push(
            new Biont((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, i, params, scene)
        );
    }
}



export { boids, type_of_bois, createBoids };