export default `
  precision highp float;
  precision highp int;

  uniform vec3 color;
  uniform float lowStep;
  uniform float hiStep;
  varying float vNoise;

  void main() {
    gl_FragColor = vec4((color * smoothstep( lowStep, hiStep, vNoise )), 1.0 );
  }
`;
