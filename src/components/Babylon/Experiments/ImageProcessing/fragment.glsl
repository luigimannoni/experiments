precision mediump float;
varying vec2 vUV;
uniform sampler2D channel1;
uniform sampler2D channel2;
uniform vec2 scale;
uniform float time;

vec4 negative() {
  vec4 color = texture2D(channel1, vUV);
  return 1. - color;
}

vec4 blurred() {
  float PI = 3.14;
  float HALFPI = PI / 2.;

  vec4 color1;
  vec4 color2;
  int r = 2;
  int c = 2;
  float d = 0.;
  float offset = 0.02;
  offset = cos(time*2. + HALFPI) * offset;
  vec2 st = vUV.xy / scale;

  vec2 stepper = step(.5, st);
  vec2 smthstepper = smoothstep(0.25, .75, st);


  for(int i = -r; i < r; i++) {
    for(int j = -c; j < c; j++){
      color1 += texture2D(channel1, vUV + vec2(float(i+j)*offset, float(j)*offset));
      color2 += texture2D(channel2, vUV + vec2(float(i+j)*offset, float(j)*offset));
      d+=1.0;
    }
  }

  float alpha1 = abs(cos(time));
  float alpha2 = abs(cos(time + HALFPI));

  color1.rgb /= d;
  color2.rgb /= d;

  color1 = color1 * alpha1;
  color2 = color2 * alpha2;

  return color1 + color2;
}

vec4 greyScaleSimple() {
  vec4 color = texture2D(channel1, vUV);
  color.rgb = vec3(color.r, color.r, color.r);
  return color;
}

vec4 greyScaleWeighted() {
  vec4 color = texture2D(channel1, vUV);
  return color;
}

vec4 emboss() {
  vec4 color = texture2D(channel1, vUV);
  return color;
}

vec4 simpleEdgeDetection() {
  vec4 color = texture2D(channel1, vUV);
  return color;
}

vec4 mirror() {
  vec4 color = texture2D(channel1, vUV);        
  return color;
}

vec4 redOnly() {
  vec4 color = texture2D(channel1, vUV);
  color.g = 0.;
  color.b = 0.;
  return color;
}

vec4 move() {
  vec4 currentPixel = texture2D(channel2, vUV);
  vec2 coords = vec2(vUV.x + cos(time), vUV.y + sin(time));
  // coords = smoothstep(cos(time), 1.0, coords);
  //vec2 d = smoothstep(0.25, .75, st);

  vec4 pixel = texture2D(channel1, coords);
  float HPI = 3.14 / 2.;

  if (pixel.r > .5) {
    pixel.a = 0.;
    currentPixel.a = 0.;
  }
  if (pixel.g > .5) {
  }
  if (pixel.b > .5) {
  }


  return pixel + currentPixel;
}

vec4 transition() {
  vec4 color1 = texture2D(channel1, vUV);
  vec4 color2 = texture2D(channel2, vUV);
  float PI = 3.14;
  float HALFPI = PI / 2.;

  float alpha1 = abs(cos(time));
  float alpha2 = abs(cos(time + HALFPI));

  color1 = color1 * alpha1;
  color2 = color2 * alpha2;

  return color1 + color2;
}

vec4 maxOut() {
  vec4 color = texture2D(channel1, vUV);
  if (color.r > .2) {
    color.r = 1.;
  }
  if (color.g > .2) {
    color.g = 1.;
  }
  if (color.b > .2) {
    color.b = 1.;
  }
  return color;
}

vec4 show() {
  vec4 color = texture2D(channel1, vUV);
  return color;
}

void main(void) {
  vec4 blur = blurred();
  gl_FragColor = blur;  
}