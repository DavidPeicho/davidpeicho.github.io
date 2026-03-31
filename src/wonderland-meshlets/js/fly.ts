import {Component, Property} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';
import {vec3} from 'gl-matrix';

const _point = vec3.create();

export class Fly extends Component {
    static TypeName = 'auto-fly';

    @property.array(Property.vector3())
    positions: Float32Array[] = [];

    @property.float(1.0)
    speed = 1.0;

    private _current: number = 0;

    onActivate(): void {
        this.object.setPositionWorld(this.positions[0]);
        if (!window.matchMedia("(pointer: coarse)").matches) {
            this.active = false;
        }
    }

    update(delta: number): void {
        const pos = this.object.getPositionWorld(_point);
        const target = this.positions[this._current];
        vec3.lerp(pos, pos, this.positions[this._current], delta * this.speed);
        this.object.setPositionWorld(pos);

        if(vec3.squaredDistance(pos, target) < 0.005) {
            this._current = (this._current + 1) % this.positions.length;
        }
    }
}
