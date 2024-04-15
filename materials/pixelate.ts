import vertexShader from '../glsl/pixelate.vert';
import fragmentShader from '../glsl/pixelate.frag';

import {
    Effect,
    ShaderMaterial,
    Scene,
    Vector4,
} from '@babylonjs/core';

export { vertexShader as vert, fragmentShader as frag };

Effect.ShadersStore['pixelateVertexShader'] = vertexShader;
Effect.ShadersStore['pixelateFragmentShader'] = fragmentShader;

export { createShader as createPixelateShader };
export default function createShader(scene: Scene, shaderName = 'pixelateShader') {
    let material = new ShaderMaterial(
        shaderName, scene,
        {
            vertex: 'pixelate',
            fragment: 'pixelate',
        },
        {
            needAlphaBlending: false,
            attributes: ['position', 'normal', 'uv'],
            defines: [],
            samplers: [],
            uniforms: [
                'tDiffuse',
                'tDepth',
                'tNormal',
                'resolution',
                'normalEdgeStrength',
                'depthEdgeStrength',
            ],
        }
    )

    const resolution = new Vector4(
        // this.renderResolution.x,
        // this.renderResolution.y,
        // 1 / this.renderResolution.x,
        // 1 / this.renderResolution.y,
    );

    material.setVector4('resolution', resolution);
    material.setFloat('normalEdgeStrength', 0.4);
    material.setFloat('depthEdgeStrength', 0.3);

    return material;
}
