import * as Bab from '@babylonjs/core';
import type { PositionType, PositionOption } from './positioning';
import { getPosition } from './positioning';
import getWaymarkSquareMat from '~/materials/waymarkSquare';
import getWaymarkRoundMat from '~/materials/waymarkRound';
import { Fight } from './fights';

export type WaymarkName =
    | '1'
    | '2'
    | '3'
    | '4'
    | 'a'
    | 'b'
    | 'c'
    | 'd'

const WaymarkNameToSidesMapping: Record<WaymarkName, number> = {
    '1': 4,
    '2': 4,
    '3': 4,
    '4': 4,
    'a': 11,
    'b': 11,
    'c': 11,
    'd': 11,
} as const;

const WaymarkNameToColorsMapping: Record<WaymarkName, string> = {
    'a': 'red',
    '1': 'red',
    'b': 'yellow',
    '2': 'yellow',
    'c': 'blue',
    '3': 'blue',
    'd': 'purple',
    '4': 'purple',
} as const;

export type WaymarkOptions = {
    name: WaymarkName
    label?: string
    position: PositionOption
    positionType: PositionType
}

export class Waymark {
    fight: Fight;
    options: WaymarkOptions;

    icon?: Bab.Mesh;
    mesh?: Bab.Mesh;

    constructor(fight: Fight, options: WaymarkOptions) {
        this.fight = fight;
        this.options = options;

        this.fight.on('dispose', () => {
            this.dispose();
        });

        this.createMesh();
    }

    createMesh() {
        const waymarkName = `waymark-${this.options.name}`;

        const position = this.getPosition();
        const iconSize = 2;
        const icon = Bab.MeshBuilder.CreatePlane(waymarkName, { width: iconSize, height: iconSize }, this.fight.collection.scene);
        icon.position = position?.clone();
        icon.position.y += 5.5;


        const iconMat = new Bab.StandardMaterial(`${waymarkName}-icon`, this.fight.collection.scene);
        iconMat.diffuseTexture = new Bab.Texture(`/images/field-icons/${waymarkName}.png`);
        iconMat.diffuseTexture.hasAlpha = true;
        iconMat.useAlphaFromDiffuseTexture = true;

        const color = WaymarkNameToColorsMapping[this.options.name];
        if (color === 'red') {
            iconMat.emissiveColor = new Bab.Color3(0.4588235294117647, 0.3843137254901961, 0.3843137254901961);// (HEX : #756262 , debugNode as BABYLON.StandardMaterial)
        } else if (color === 'yellow') {
            iconMat.emissiveColor = new Bab.Color3(0.34509803921568627, 0.30980392156862746, 0.17647058823529413);// (HEX : #584F2D , debugNode as BABYLON.StandardMaterial)
        } else if (color === 'blue') {
            iconMat.emissiveColor = new Bab.Color3(0.1568627450980392, 0.23137254901960785, 0.3058823529411765);// (HEX : #283B4E , debugNode as BABYLON.StandardMaterial)
        } else if (color === 'purple') {
            iconMat.emissiveColor = new Bab.Color3(0.21568627450980393, 0.12549019607843137, 0.3254901960784314);// (HEX : #372053 , debugNode as BABYLON.StandardMaterial)
        }

        icon.material = iconMat;
        icon.billboardMode = Bab.Mesh.BILLBOARDMODE_ALL;
        this.fight.collection.addGlow(icon);
        this.icon = icon;

        let sides = WaymarkNameToSidesMapping[this.options.name];
        const bodyHeight = 4.5;
        const mesh = Bab.MeshBuilder.CreateCylinder(
            `${waymarkName}-body`,
            {
                diameter: sides === 4 ? 3 : 2.25,
                height: bodyHeight,
                tessellation: sides,
                sideOrientation: Bab.Mesh.DOUBLESIDE,
                faceUV: [
                    new Bab.Vector4(0, 0, 1, 1),
                    new Bab.Vector4(0, 0, 1, 1),
                    new Bab.Vector4(1, 1, 1, 1),
                ],
                frontUVs: new Bab.Vector4(0, 0, 1, 1),
                backUVs: new Bab.Vector4(0, 0, 1, 1),
            },
            this.fight.collection.scene
        )
        mesh.position = position?.clone();
        mesh.position.y += bodyHeight / 2;
        mesh.position.y += 0.1;
        if (sides === 4) {
            mesh.rotation.y = 0.7854;
        }

        let matColor = new Bab.Color3(0.4588235294117647, 0.3843137254901961, 0.3843137254901961);// (HEX : #756262 , debugNode as BABYLON.StandardMaterial)
        if (color === 'red') {
            matColor = Bab.Color3.FromHexString('#eb1919');
        } else if (color === 'yellow') {
            matColor = Bab.Color3.FromHexString('#ebd319');
        } else if (color === 'blue') {
            matColor = Bab.Color3.FromHexString('#4883f1');
        } else if (color === 'purple') {
            matColor = Bab.Color3.FromHexString('#8340d7');
        }

        const bodyMat = sides === 4 ? getWaymarkSquareMat(this.fight.collection.scene, matColor) : getWaymarkRoundMat(this.fight.collection.scene, matColor);
        mesh.material = bodyMat;
        this.fight.collection.addGlow(mesh);
        let time = 0;
        this.fight.collection.scene.registerAfterRender(() => {
            bodyMat.setFloat('time', time);
            time += 0.1;
        })

        this.mesh = mesh;

        return {
            mesh,
        };
    }

    dispose() {
        this.mesh?.dispose();
        this.icon?.dispose();
    }

    getPosition() {
        return getPosition(
            this.options.position,
            this.options.positionType,
            this.fight.collection
        )
    }
}
