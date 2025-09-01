import vertShader from '../glsl/standardAoe.vert';
import fragShader from '../glsl/standardAoe.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
} from '@babylonjs/core';

Effect.ShadersStore['standardAoeVertexShader'] = vertShader;
Effect.ShadersStore['standardAoeFragmentShader'] = fragShader;

export { createShader as standardAoeMaterial };
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
                'world', 'worldView', 'worldViewProjection',
                'view', 'projection', 'viewProjection',
                'direction',

                'time',
                'elapsed',
                'telegraph',
                'color',
            ],
        }
    )

    material.setFloat('time', 0);
    material.setFloat('elapsed', 0);
    material.setFloat('telegraph', 0);
    material.setColor3('color', color || new Color3(0.2, 0.6, 1.0));
    return material;
}
