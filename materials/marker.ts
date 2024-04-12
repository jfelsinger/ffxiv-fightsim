import vertShader from '../glsl/marker.vert';
import fragShader from '../glsl/marker.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Color3,
} from '@babylonjs/core';

export const vert =
    Effect.ShadersStore['markerVertexShader'] =
    vertShader;

export const frag =
    Effect.ShadersStore['markerFragmentShader'] =
    fragShader;

export default function createShader(scene: Scene, color?: Color3, shaderName = 'markerShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'marker',
            fragment: 'marker',
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
