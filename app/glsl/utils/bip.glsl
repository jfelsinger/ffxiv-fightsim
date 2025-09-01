#define SMOOTH(r,R) (1.0-smoothstep(R-1.0,R+1.0, r))

float bip(vec2 uv, vec2 center) {
    float r = length(uv - center);
    float R = 8.0 + mod(87.0 * time, 80.0);
    return smoothstep(max(8.0, R - 20.0), R, r) - SMOOTH(R, r);
}
