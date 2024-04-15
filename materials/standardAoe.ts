import vertShader from '../glsl/standardAoe.vert';
import fragShader from '../glsl/standardAoe.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Color3,
} from '@babylonjs/core';

Effect.ShadersStore['standardAoeVertexShader'] = vertShader;
Effect.ShadersStore['standardAoeFragmentShader'] = fragShader;

export default function createShader(scene: Scene, color?: Color3, shaderName = 'standardAoeShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'standardAoe',
            fragment: 'standardAoe',
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
                'direction',
                'color',
            ],
        }
    )

    material.setColor3('color', color || new Color3(0.2, 0.6, 1.0));
    return material;
}
