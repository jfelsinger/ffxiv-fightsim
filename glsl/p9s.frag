#define PI 3.14159265359
#define PI_2 6.2831
#define GRID_DIMS vec2(8.0, 3.0);

precision highp float;
varying vec2 vUV;
varying vec3 vPos;
uniform sampler2D textureSampler;
uniform vec3 color;

mat2 rotate2d(float _angle) {
    return mat2(cos(_angle), -sin(_angle),
        sin(_angle), cos(_angle));
}

vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// SQUARE AOE
void main(void) {
    float d = 0.0;
    d = length(abs(vUV) - 0.5);
    float seg = fract(d * (3.0 * 2.0));

    float gap = 0.0005;
    float smoothing = 0.0025;
    seg = 1.0 - (smoothstep(0.00 + gap, 0.00 + gap + smoothing, seg) * smoothstep(1.00 - gap, 1.00 - gap - smoothing, seg));

    // Vertical+Horizontal Crosshair lines
    gap = 0.0002;
    smoothing = 0.0005;
    seg += smoothstep(0.5 - gap, 0.5 - gap + smoothing, vUV.x) * smoothstep(0.5 + gap + smoothing, 0.5 + gap, vUV.x);
    seg += smoothstep(0.5 - gap, 0.5 - gap + smoothing, vUV.y) * smoothstep(0.5 + gap + smoothing, 0.5 + gap, vUV.y);

    // 45deg rotated, Vertical+Horizontal Crosshair lines
    vec2 st = vUV.xy;
    smoothing = 0.0007;
    st -= vec2(0.5);
    st = rotate2d(0.25 * PI) * st;
    st += vec2(0.5);
    seg += smoothstep(0.5 - gap, 0.5 - gap + smoothing, st.x) * smoothstep(0.5 + gap + smoothing, 0.5 + gap, st.x);
    seg += smoothstep(0.5 - gap, 0.5 - gap + smoothing, st.y) * smoothstep(0.5 + gap + smoothing, 0.5 + gap, st.y);
    seg *= smoothstep(0.05, 0.35, distance(vUV, vec2(0.5)));
    seg *= smoothstep(0.5, 0.20, distance(vUV, vec2(0.5)));

    st *= 3.5;
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);
    float m_dist = 1.; // minimum distance
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            // Neighbor place in the grid
            vec2 neighbor = vec2(float(x), float(y));

            // Random position from current + neighbor place in the grid
            vec2 point = random2(i_st + neighbor);

            // Animate the point
            point = 0.5 + 0.5 * sin(3.0 + 6.2831 * point);

            // Vector between the pixel and the point
            vec2 diff = neighbor + point - f_st;

            // Distance to the point
            float dist = length(diff);

            // Keep the closer distance
            m_dist = min(m_dist, dist);
        }
    }

    vec3 c = color.rgb;
    c *= 0.95;
    c += m_dist * 0.60;
    c *= 0.95;

    // gl_FragColor = vec4(vec3(seg), 1.0);
    gl_FragColor = vec4(c / (1.0 - clamp(seg, 0.0, 0.12)), 1.0);
}
