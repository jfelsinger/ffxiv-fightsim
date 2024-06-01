precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vuv;
varying vec3 vPos;

// SQUARE AOE
void main(void) {
    vuv = uv;
    vPos = (worldViewProjection * vec4(position, 1.0)).xyz;
    gl_Position = worldViewProjection * vec4(position, 1.0);
}
