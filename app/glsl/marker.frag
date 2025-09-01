precision highp float;
varying vec2 vUV;
varying vec3 vPos;
uniform sampler2D textureSampler;
uniform vec3 color;

// Character Marker
void main(void) {
    // gl_FragColor = texture2D(textureSampler, vUV);

    float distCenter = 0.0;
    distCenter = distance(vUV.xy, vec2(0.5));

    float alpha = distCenter;
    float wdt = 0.020;
    float smth = 0.025;

    // Outer Ring
    alpha = smoothstep(0.5, 0.5 + smth, 1.0 - distCenter);
    alpha *= smoothstep(1.0 - distCenter, 1.0 + smth - distCenter, 0.558);

    // Inner Ring
    alpha += smoothstep(0.7, 0.70 + smth, 1.0 - distCenter);
    alpha *= smoothstep(0.70 - distCenter, 0.70 + smth - distCenter, 0.438);

    alpha *= 0.8;

    // Inner Plus
    alpha = mix(alpha, 1.0,
        (smoothstep(0.5 - wdt, 0.5, vUV.y) - smoothstep(0.5, 0.5 + wdt, vUV.y))
        * smoothstep(0.72, 0.85, 1.0 - distCenter)
    );
    alpha = mix(alpha, 1.0,
        (smoothstep(0.5 - wdt, 0.5, vUV.x) - smoothstep(0.5, 0.5 + wdt, vUV.x))
        * smoothstep(0.72, 0.85, 1.0 - distCenter)
    );

    // Forward
    alpha = mix(alpha, 1.0,
        (smoothstep(0.5 - wdt, 0.5, vUV.y) - smoothstep(0.5, 0.5 + wdt, vUV.y))
        * smoothstep(0.8, 0.85, vUV.x)
        * smoothstep(0.965, 0.9, vUV.x)
    );

    alpha *= smoothstep(0.0, 0.85, vUV.x);
    // float a2 = step(0.4, 0.8 - distCenter);

    // gl_FragColor = vec4(0.2, 0.6, 1.0, alpha);
    gl_FragColor = vec4(color, alpha);
}
