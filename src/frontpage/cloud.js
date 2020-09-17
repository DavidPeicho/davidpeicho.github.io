import { BoxBufferGeometry, Mesh } from 'three';

import { CloudMaterial } from './material';

export class Cloud extends Mesh {

  constructor() {
    super(new BoxBufferGeometry(1, 1, 1), new CloudMaterial());
  }

  update() {
    const material = this.material;
    material.inverseModelView.getInverse(this.modelViewMatrix);
    material.uniforms.uFrame.value++;
  }

}
