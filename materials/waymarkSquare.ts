import vertShader from '../glsl/waymarkSquare.vert';
import fragShader from '../glsl/waymarkSquare.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Color3,
} from '@babylonjs/core';

Effect.ShadersStore['waymarkSquareVertexShader'] = vertShader;
Effect.ShadersStore['waymarkSquareFragmentShader'] = fragShader;

export default function createShader(scene: Scene, color?: Color3, shaderName = 'waymarkSquareShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'waymarkSquare',
            fragment: 'waymarkSquare',
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
