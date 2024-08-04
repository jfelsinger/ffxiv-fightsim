precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vUV;
varying vec3 vPos;

// STANDARD AOE
void main(void) {
    vUV = uv;
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vPos = gl_Position.xyz;
}
