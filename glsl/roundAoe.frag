precision highp float;
varying vec2 vuv;
varying vec3 vPos;
uniform sampler2D textureSampler;
uniform float elapsed;
uniform vec3 color;
varying float arenaDistance;

float cubicInOut(float t) {
    return t < 0.5
    ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

// STANDARD AOE
void main(void) {
    // gl_FragColor = texture2D(textureSampler, vUV);

    float distCenter = 0.0;
    distCenter = abs(distance(vuv.xy, vec2(0.5)));

    float alpha = distCenter;
    float wdt = 0.015;

    alpha = step(0.5, 1.0 - distCenter); // Outer ring
    alpha = min(0.8, alpha); // Set a max transparency
    alpha *= (step(0.5 - distCenter, 0.025) * 0.2) + smoothstep(-0.15, 0.7, distCenter);
    alpha += (1.0 - max(0.50, distCenter * 3.125)) * 0.8;

    // Crosshairs
    // alpha = mix(alpha, 1.0,
    //         smoothstep(0.5 - wdt, 0.5, vuv.y) -
    //             smoothstep(0.5, 0.5 + wdt, vuv.y));
    // alpha = mix(alpha, 0.8,
    //         smoothstep(0.5 - wdt, 0.5, vuv.x) -
    //             smoothstep(0.5, 0.5 + wdt, vuv.x));

    // Fade across X-axis
    // alpha *= smoothstep(0.0, 1.0, vuv.x);
    // float a2 = step(0.4, 0.8 - distCenter);

    // gl_FragColor = vec4(0.2, 0.6, 1.0, alpha);
    float adj = cubicInOut(elapsed);
    float r = clamp((color.r) + (adj * 0.35), 0.0, 1.0);
    float g = clamp((color.g) - (adj * 0.25), 0.0, 1.0);
    float b = clamp((color.b) - (adj * 0.25), 0.0, 1.0);
    alpha = max(0.20, alpha);
    alpha *= step(arenaDistance, 1.0);

    gl_FragColor = vec4(r, g, b, alpha);
}
