import vertShader from '../glsl/waymarkRound.vert';
import fragShader from '../glsl/waymarkRound.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
} from '@babylonjs/core';

Effect.ShadersStore['waymarkRoundVertexShader'] = vertShader;
Effect.ShadersStore['waymarkRoundFragmentShader'] = fragShader;

export { createShader as roundWaymarkMaterial };
export default function createShader(scene: Scene, color?: Color3, shaderName = 'waymarkRoundShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'waymarkRound',
            fragment: 'waymarkRound',
        },
        {
            needAlphaBlending: true,
            attributes: ['position', 'normal', 'uv'],
            defines: [],
            samplers: [],
            uniforms: [
                'world',
                'worldView',
                'worldViewProjection',
                'characterPosition',
                'view',
                'projection',
                'time',
                'direction',
                'color',
            ],
        }
    )

    material.setColor3('color', color || new Color3(0.2, 0.6, 1.0));
    material.alpha = 39;
    material.alphaMode = 1;
    return material;
}
