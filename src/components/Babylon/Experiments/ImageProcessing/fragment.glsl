precision mediump float;
varying vec2 vUV;
uniform sampler2D diffuseTexture1;
uniform sampler2D diffuseTexture2;
uniform vec2 scale;
uniform float time;

#define PI 3.14159265359

void main(void) {
  float x = vUV.x;

  vec4 color1 = texture2D(diffuseTexture1, vUV);
  vec4 color2 = texture2D(diffuseTexture2, vUV);

  float curve = cos((x + fract(time / 10.)) * ((PI * 2.)))+0.5;

  vec4 color = mix(color1, color2, clamp(curve, 0., 1.));

  gl_FragColor = color;
}