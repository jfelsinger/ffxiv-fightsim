import vertShader from '../glsl/squareAoe.vert';
import fragShader from '../glsl/squareAoe.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Color3,
} from '@babylonjs/core';

Effect.ShadersStore['squareAoeVertexShader'] = vertShader;
Effect.ShadersStore['squareAoeFragmentShader'] = fragShader;

export default function createShader(scene: Scene, color?: Color3, shaderName = 'squareAoeShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'squareAoe',
            fragment: 'squareAoe',
        },
        {
            needAlphaBlending: true,
            attributes: ['position', 'normal', 'uv'],
            defines: [],
            samplers: [],
            uniforms: [
                'world', 'worldView', 'worldViewProjection',
                'view', 'projection', 'viewProjection',
                'direction',

                'time',
                'elapsed',
                'color',
            ],
        }
    )

    material.setFloat('time', 0);
    material.setFloat('elapsed', 0);
    material.setColor3('color', color || new Color3(0.2, 0.6, 1.0));
    return material;
}
