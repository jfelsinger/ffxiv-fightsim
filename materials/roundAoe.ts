import vertShader from '../glsl/roundAoe.vert';
import fragShader from '../glsl/roundAoe.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Color3,
} from '@babylonjs/core';

Effect.ShadersStore['roundAoeVertexShader'] = vertShader;
Effect.ShadersStore['roundAoeFragmentShader'] = fragShader;

export default function createShader(scene: Scene, color?: Color3, shaderName = 'roundAoeShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'roundAoe',
            fragment: 'roundAoe',
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
                'view',
                'projection',
                'time',
                'elapsed',
                'direction',
                'color',
            ],
        }
    )

    material.setFloat('time', 0);
    material.setFloat('elapsed', 0);
    material.setColor3('color', color || new Color3(0.2, 0.6, 1.0));
    return material;
}
