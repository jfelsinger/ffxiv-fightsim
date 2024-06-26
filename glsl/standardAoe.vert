precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 viewProjection;

varying vec2 vuv;
varying vec3 vPos;
varying float iid;

#include<instancesDeclaration>

// STANDARD AOE
void main(void) {
    #include<instancesVertex>

    int iidF = gl_InstanceID;
    iid = float(iidF);

    vPos = (viewProjection * finalWorld * vec4(position, 1.0)).xyz;
    gl_Position = viewProjection * finalWorld * vec4(position, 1.0);

    vuv = uv;
}
