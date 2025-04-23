float prec(float inp, float d) {
    float res = float(round(inp * d));
    return (res / d);
}

float prec(float inp) {
    float d = 10000.0;
    return prec(inp, d);
}

vec2 prec(vec2 inp) {
    return vec2(prec(inp.x), prec(inp.y));
}

vec3 prec(vec3 inp) {
    return vec3(prec(inp.r), prec(inp.g), prec(inp.b));
}

vec4 prec(vec4 inp) {
    return vec4(prec(inp.r), prec(inp.g), prec(inp.b), prec(inp.a));
}
