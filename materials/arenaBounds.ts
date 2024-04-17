import vertShader from '../glsl/arenaBounds.vert';
import fragShader from '../glsl/arenaBounds.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Color3,
} from '@babylonjs/core';

Effect.ShadersStore['arenaBoundsVertexShader'] = vertShader;
Effect.ShadersStore['arenaBoundsFragmentShader'] = fragShader;

export default function createShader(scene: Scene, color?: Color3, shaderName = 'arenaBoundsShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'arenaBounds',
            fragment: 'arenaBounds',
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
