precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vUV;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;
}
// varying vec2 vUv;
//
// void main() {
//
//     vUv = uv;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
//
// }
