import { useState } from '#imports';
import createAoeMat from '../../materials/squareAoe';
import { yalmsToM } from '../conversions';
import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    AoeSquareEffect,
    type AoeSquareEffectOptions,
} from './aoe-square';

export type GridOrientation =
    | 'bottom-left'
    | 'bottom-right'
    | 'top-left'
    | 'top-right'
    | 'center';

export type GridPattern =
    | 'none'
    | 'checkered'
    | 'checkered-alt'
    | 'alternating-cols'
    | 'alternating-rows'
    | 'alternating-cols-alt'
    | 'alternating-rows-alt';

export type AoeSquareGridEffectOptions = AoeSquareEffectOptions & {
    orientation?: GridOrientation
    pattern?: GridPattern
    gap?: number | string

    size?: number | string
    rows?: number | string
    cols?: number | string
};

export class AoeSquareGridEffect extends AoeSquareEffect {
    name = 'aoe-square-grid';
    orientation: GridOrientation;
    pattern: GridPattern;
    gap: number;
    rows: number;
    cols: number;
    positionChecks: { position: Bab.Vector3 }[] = [];

    constructor(options: AoeSquareGridEffectOptions) {
        super(options);

        this.orientation = options.orientation || 'center';
        this.pattern = options.pattern || 'none';

        this.gap = parseNumber(options.gap || 0);
        this.rows = parseNumber(options.rows || options.size || 4);
        this.cols = parseNumber(options.cols || options.size || 4);
    }

    async startup() {
        await super.startup();
    }

    async cleanup() {
        await super.cleanup();
    }

    toJSON() {
        return {
            ...super.toJSON(),
            orientation: this.orientation,
            pattern: this.pattern,
            gap: this.gap,
            size: (this.options as any).size,
            rows: (this.options as any).rows,
            cols: (this.options as any).cols,
        };
    }

    getOrientationAdjustment() {
        const size = yalmsToM(this.yalms);
        const gap = yalmsToM(this.gap);
        const cols = this.cols;
        const rows = this.rows;

        let xOrientAdjust = 0;
        let zOrientAdjust = 0;
        if (this.orientation === 'center') {

            xOrientAdjust = ((cols - 1) * (size + gap)) / 2;
            zOrientAdjust = ((rows - 1) * (size + gap)) / 2;

        } else {
            if (this.orientation.includes('top')) {
                zOrientAdjust = (rows - 1) * (size + gap);
            }
            if (this.orientation.includes('right')) {
                xOrientAdjust = (cols - 1) * (size + gap);
            }
        }

        return {
            x: xOrientAdjust,
            y: 0,
            z: zOrientAdjust,
        }
    }

    getInstanceTotal() {
        const cols = this.cols;
        const rows = this.rows;
        const pattern = this.pattern;

        if (pattern === 'alternating-cols') {
            return rows * Math.ceil(cols / 2);
        } else if (pattern === 'alternating-cols-alt') {
            return rows * Math.floor(cols / 2);
        } else if (pattern === 'alternating-rows') {
            return cols * Math.ceil(rows / 2);
        } else if (pattern === 'alternating-rows-alt') {
            return cols * Math.floor(rows / 2);
        } else if (pattern === 'checkered') {
            return Math.ceil((cols * rows) / 2);
        } else if (pattern === 'checkered-alt') {
            return Math.floor((cols * rows) / 2);
        }

        return cols * rows;
    }

    inPattern(col: number, row: number) {
        if (!this.pattern || this.pattern === 'none') {
            return true;
        } // else:

        if (this.pattern === 'alternating-cols') {
            return col % 2 === 0
        } else if (this.pattern === 'alternating-cols-alt') {
            return col % 2 === 1
        } else if (this.pattern === 'alternating-rows') {
            return row % 2 === 0
        } else if (this.pattern === 'alternating-rows-alt') {
            return row % 2 === 1
        } else if (this.pattern === 'checkered') {
            return (
                (col % 2 === 0 && row % 2 === 0) ||
                (col % 2 === 1 && row % 2 === 1)
            );
        } else if (this.pattern === 'checkered-alt') {
            return (
                (col % 2 === 0 && row % 2 === 1) ||
                (col % 2 === 1 && row % 2 === 0)
            );
        }

        return true;
    }

    checkMeshCollision(target: Bab.Mesh) {
        const mesh = this.mesh;
        if (!mesh || !target) {
            return false;
        }

        const size = yalmsToM(this.yalms);
        const targetPosition = new Bab.Vector2(target.absolutePosition.x, target.absolutePosition.z);
        return this.positionChecks.some(({ position }) => {
            const adjustedPos = targetPosition.subtract(new Bab.Vector2(
                position.x, position.z
            ));
            return (
                adjustedPos.x >= (-size / 2) &&
                adjustedPos.x <= (size / 2) &&
                adjustedPos.y >= (-size / 2) &&
                adjustedPos.y <= (size / 2)
            );
        });
    }

    makeAoe() {
        const squareMat = createAoeMat(this.scene, this.getColor(), 'squareMat');
        squareMat.alpha = 0.7;

        squareMat.setFloat('telegraph', this.adjustedTelegraph);
        squareMat.setFloat('elapsed', this.getDurationPercent());
        this.on('tick', ({ time, durationPercent, telegraph }) => {
            squareMat.setFloat('time', time);
            squareMat.setFloat('telegraph', telegraph);
            squareMat.setFloat('elapsed', durationPercent);
        });

        const size = yalmsToM(this.yalms);
        const gap = yalmsToM(this.gap);
        const square = Bab.MeshBuilder.CreatePlane('area', { size }, this.scene);
        square.rotation.x = Math.PI / 2;
        square.position.y = 0.01;
        square.bakeCurrentTransformIntoVertices();
        square.position = this.getPosition();
        square.material = squareMat;
        square.checkCollisions = true;

        const cols = this.cols;
        const rows = this.rows;
        const matrix = Bab.Matrix.Identity();
        const bufferMatrices = new Float32Array(16 * this.getInstanceTotal());

        const orientAdjust = this.getOrientationAdjustment();
        if (orientAdjust.x || orientAdjust.z || orientAdjust.y) {
            square.position.subtractInPlace(new Bab.Vector3(
                orientAdjust.x,
                orientAdjust.y,
                orientAdjust.z
            ));
        }


        let count = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (!this.inPattern(j, i)) {
                    continue;
                }

                const x = (size + gap) * j;
                const z = (size + gap) * i;

                // We re-use a single matrix to save on processing.
                // Matrix indices 12, 13, 14 relate to x, y, z respectively.
                (matrix as any).m[12] = x;
                (matrix as any).m[14] = z;

                const position = new Bab.Vector3(x, 0, z);
                // positions.push(position);
                this.positionChecks.push({
                    position: position.add(square.position),
                })

                matrix.copyToArray(bufferMatrices, count * 16);
                count++;
            }
        }

        square.thinInstanceSetBuffer('matrix', bufferMatrices, 16);


        return {
            square
        };
    }
}
