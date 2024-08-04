precision highp float;
varying vec2 vUV;
varying vec3 vPos;
uniform sampler2D textureSampler;
uniform vec3 color;
uniform float time;
#define PI 3.14159265359
#define TAU 6.28318530718
#define MAX_ITER 5

mat2 rotate2d(float _angle) {
    return mat2(cos(_angle), -sin(_angle),
        sin(_angle), cos(_angle));
}

vec3 waterCaustics(vec2 uv) {
    float tme = time * .0125 + 23.0;

    vec2 p = mod(uv * TAU, TAU) - 250.0;
    vec2 i = vec2(p);
    float c = 1.0;

    float inten = .005;

    for (int n = 0; n < MAX_ITER; n++)
    {
        float t = tme * (1.0 - (3.5 / float(n + 1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
    }
    c /= float(MAX_ITER);
    c = 1.17 - pow(c, 1.4);
    vec3 colour = vec3(pow(abs(c), 8.0));
    colour = clamp(colour + vec3(0.0, 0.35, 0.5), 0.0, 1.0);
    return colour;
}

// STANDARD AOE
void main(void) {
    // gl_FragColor = texture2D(textureSampler, vUV);

    vec2 st = vUV.xy;
    float distCenter = 0.0;
    distCenter = distance(st.xy, vec2(0.5));

    float wdt = 0.015;

    st -= vec2(0.5);
    st = rotate2d((1.0 / 2.) * PI) * st;
    st += vec2(0.5);
    float dist = distance(smoothstep(0., 1.0, st.x), 1.0);
    float alpha = dist;
    // alpha /= 0.5;

    // -----  UNCOMMENT FOR SOME FX  -----
    // alpha = step(0.5, 1.0 - dist); // Outer ring
    // alpha *= 0.8; // Set a max transparency
    // alpha *= (step(0.5 - dist, 0.025) * 0.2) + smoothstep(-0.15, 0.7, dist);

    // Crosshairs
    // alpha = mix(alpha, 1.0,
    //         smoothstep(0.5 - wdt, 0.5, vUV.y) -
    //             smoothstep(0.5, 0.5 + wdt, vUV.y));
    // alpha = mix(alpha, 0.8,
    //         smoothstep(0.5 - wdt, 0.5, vUV.x) -
    //             smoothstep(0.5, 0.5 + wdt, vUV.x));

    // Fade across X-axis
    // alpha *= smoothstep(0.0, 1.0, vUV.x);
    // float a2 = step(0.4, 0.8 - dist);

    vec3 caustic = waterCaustics(st);
    alpha *= smoothstep(1.0, 0.3, caustic.g);
    alpha *= 0.75;
    alpha += sin((distance(vUV.x, 1.0) + time / 320.0) * 125.0) * smoothstep(0.5, 0.0, distance(vUV.y, 0.3)) * dist * 0.45;
    alpha *= 0.5;

    // gl_FragColor = vec4(0.2, 0.6, 1.0, alpha);
    // gl_FragColor = vec4(color * caustic, alpha);
    gl_FragColor = vec4(color, alpha);

    // gl_FragColor = vec4(vec3(dist, 1.0, 1.0), 1.0);
    // gl_FragColor = vec4(vec3(st.x, 1.0, 0.0), dist);
    // gl_FragColor = vec4(vec3(vUV.y, vUV.x, 0.0), alpha);
}
