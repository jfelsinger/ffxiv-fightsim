precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 viewProjection;

varying vec2 vUV;
varying vec3 vPos;
varying float iid;

#include<instancesDeclaration>

// SQUARE AOE
void main(void) {
    #include<instancesVertex>

    int iidF = gl_InstanceID;
    iid = float(iidF);

    vPos = (viewProjection * finalWorld * vec4(position, 1.0)).xyz;
    gl_Position = viewProjection * finalWorld * vec4(position, 1.0);

    vUV = uv;
}
