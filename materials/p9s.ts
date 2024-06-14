import vertShader from '../glsl/p9s.vert';
import fragShader from '../glsl/p9s.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Color3,
} from '@babylonjs/core';

Effect.ShadersStore['p9sVertexShader'] = vertShader;
Effect.ShadersStore['p9sFragmentShader'] = fragShader;

export default function createShader(scene: Scene, color?: Color3, shaderName = 'p9sShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'p9s',
            fragment: 'p9s',
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
    material.setColor3('color', color || Color3.FromInts(79, 137, 169));
    return material;
}
