precision highp float;
precision highp int;

uniform vec3 color;

varying float vNoise;

void main() {
  gl_FragColor = vec4( color * clamp( vNoise, 0.2, 1.0 ), 1.0 );
}
  