precision highp float;
precision highp int;

uniform vec3 color;
varying float vNoise;

void main() {
  gl_FragColor = vec4((color * smoothstep( -1., 1., vNoise )), 1.0 );
}
