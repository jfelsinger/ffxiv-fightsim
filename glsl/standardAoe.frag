precision highp float;
varying vec2 vUV;
varying vec3 vPos;
uniform sampler2D textureSampler;
uniform vec3 color;
uniform float elapsed;
uniform float telegraph;

// SQUARE AOE
void main(void) {
    // gl_FragColor = texture2D(textureSampler, vUV);

    float distCenter = 0.0;
    distCenter = distance(vUV.xy, vec2(0.5));

    // float alpha = distCenter;
    float alpha = 0.0;
    float wdt = 0.015;

    float borderWidth = 0.015;
    float borderOpacity = 0.45;
    // alpha = clamp(alpha + smoothstep(borderWidth, borderWidth - 0.001, vUV.x) * borderOpacity, 0.0, 1.0);
    // alpha = clamp(alpha + smoothstep(1.0 - borderWidth, 1.001 - borderWidth, vUV.x) * borderOpacity, 0.0, 1.0);
    // alpha = clamp(alpha + smoothstep(borderWidth, borderWidth - 0.001, vUV.y) * borderOpacity, 0.0, 1.0);
    // alpha = clamp(alpha + smoothstep(1.0 - borderWidth, 1.001 - borderWidth, vUV.y) * borderOpacity, 0.0, 1.0);

    alpha = clamp(alpha + smoothstep(borderWidth, borderWidth - 0.001, vUV.x), 0.0, 1.0);
    alpha = clamp(alpha + smoothstep(1.0 - borderWidth, 1.001 - borderWidth, vUV.x), 0.0, 1.0);
    alpha = clamp(alpha + smoothstep(borderWidth, borderWidth - 0.001, vUV.y), 0.0, 1.0);
    alpha = clamp(alpha + smoothstep(1.0 - borderWidth, 1.001 - borderWidth, vUV.y), 0.0, 1.0);
    alpha *= borderOpacity;
    // alpha = step(0.5, 1.0 - distCenter); // Outer ring
    alpha = clamp(alpha + distCenter, 0.0, 1.0);
    alpha *= 0.8; // Set a max transparency
    // alpha *= (step(0.5 - distCenter, 0.025) * 0.2) + smoothstep(-0.15, 0.7, distCenter);

    // Crosshairs
    // alpha = mix(alpha, 1.0,
    //         smoothstep(0.5 - wdt, 0.5, vUV.y) -
    //             smoothstep(0.5, 0.5 + wdt, vUV.y));
    // alpha = mix(alpha, 0.8,
    //         smoothstep(0.5 - wdt, 0.5, vUV.x) -
    //             smoothstep(0.5, 0.5 + wdt, vUV.x));

    // Fade across X-axis
    // alpha *= smoothstep(0.0, 1.0, vUV.x);
    // float a2 = step(0.4, 0.8 - distCenter);

    // gl_FragColor = vec4(0.2, 0.6, 1.0, alpha);
    alpha *= step(1.0 - elapsed, telegraph);
    alpha *= step(1.0 - elapsed, telegraph);
    gl_FragColor = vec4(color, alpha);
}
