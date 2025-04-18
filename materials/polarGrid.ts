import vertShader from '../glsl/polarGrid.vert';
import fragShader from '../glsl/polarGrid.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
} from '@babylonjs/core';

Effect.ShadersStore['polarGridVertexShader'] = vertShader;
Effect.ShadersStore['polarGridFragmentShader'] = fragShader;

export { createShader as polarGridMaterial };
export default function createShader(scene: Scene, color?: Color3, shaderName = 'polarGridShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'polarGrid',
            fragment: 'polarGrid',
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
