import vertShader from '~/glsl/enemy-marker.vert';
import fragShader from '~/glsl/enemy-marker.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Color3,
} from '@babylonjs/core';

Effect.ShadersStore['enemyMarkerVertexShader'] = vertShader;
Effect.ShadersStore['enemyMarkerFragmentShader'] = fragShader;

export default function createShader(scene: Scene, color?: Color3, shaderName = 'enemyMarkerShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'enemyMarker',
            fragment: 'enemyMarker',
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

    material.setColor3('color', color || Color3.Red());
    return material;
}
