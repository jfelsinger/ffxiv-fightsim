precision highp float;
varying vec2 vuv;
varying vec3 vPos;
uniform sampler2D textureSampler;
uniform vec3 color;

// Character Marker
void main(void) {
    // gl_FragColor = texture2D(textureSampler, vUV);

    float distCenter = 0.0;
    distCenter = distance(vuv.xy, vec2(0.5));

    float alpha = distCenter;
    float wdt = 0.015;

    alpha = step(0.5, 1.0 - distCenter);
    alpha *= step(0.8 - distCenter, 0.4);
    alpha *= 0.8;
    alpha = mix(alpha, 1.0,
            smoothstep(0.5 - wdt, 0.5, vuv.y) -
                smoothstep(0.5, 0.5 + wdt, vuv.y));
    alpha = mix(alpha, 0.8,
            smoothstep(0.5 - wdt, 0.5, vuv.x) -
                smoothstep(0.5, 0.5 + wdt, vuv.x));
    alpha *= smoothstep(0.0, 1.0, vuv.x);
    // float a2 = step(0.4, 0.8 - distCenter);

    // gl_FragColor = vec4(0.2, 0.6, 1.0, alpha);
    gl_FragColor = vec4(color, alpha);
}
