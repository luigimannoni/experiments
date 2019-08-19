precision mediump float;
varying vec2 vUV;

#define PI 3.14159265359

void main(void) {
  float x = vUV.x;

  gl_FragColor = vec4(1., 1., 1., x);
}