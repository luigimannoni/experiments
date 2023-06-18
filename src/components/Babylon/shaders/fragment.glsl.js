export default `
precision mediump float;
varying vec2 vUV;
uniform sampler2D channel1;
uniform sampler2D channel2;
uniform vec2 scale;
uniform vec3 target;
uniform vec3 wave;
uniform float time;
uniform float speed;
uniform int mode;
uniform int iterations;
uniform int vIterations;
uniform float filterRed;
uniform float filterGreen;
uniform float filterBlue;

vec4 negative() {
  vec4 color = texture2D(channel1, vUV);
  return 1. - color;
}

vec4 blurred() {
  float PI = 3.14;
  float HALFPI = PI / 2.;

  vec4 color1;
  vec4 color2;
  int r = iterations;
  int c = vIterations;
  float d = 0.;
  float offset = 0.02;
  offset = cos((time * speed)*2. + HALFPI) * offset;
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

  float alpha1 = abs(cos((time * speed)));
  float alpha2 = abs(cos((time * speed) + HALFPI));

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

vec4 invert() {
  vec4 color = texture2D(channel1, vUV);
  return color * -1.0;
}

vec4 simpleEdgeDetection() {
  vec4 color = texture2D(channel1, vUV);
  return color;
}

vec4 mirror() {
  vec4 color = texture2D(channel1, vUV);
  float nextX = vUV.x + cos(time);
  float nextY = vUV.y + sin(time);
  vec2 coords = vec2(nextX, nextY);

  vec4 pixel = texture2D(channel1, coords);

  return color + pixel;
}

vec4 colorFilter() {
  vec4 color = texture2D(channel1, vUV);
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

  float alpha1 = abs(cos((time * speed)));
  float alpha2 = abs(cos((time * speed) + HALFPI));

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

#define PI 3.14159265359
#define TAU 6.28318530718
#define MAX_ITER 32

vec4 water() {
	vec2 uv = vUV.xy;

  vec2 p = mod(uv*TAU, TAU)-250.0;
	//vec2 p = uv;
  vec2 i = vec2(p * 0.00001) / 20.;
	float c = 1.0;
	float inten = .002;

	for (int n = 0; n < MAX_ITER; n++)
	{
		float t = (time / 3.) * (1.0 - (3.5 / float(n+1)));
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
	}
	c /= float(MAX_ITER);
	c = 0.17-pow(c, 0.2);
	vec3 colour = vec3(pow(abs(c), 8.0));
  colour = clamp(colour + wave, 0.0, 1.0);
  return vec4(colour, 1.);
}

vec3 palette( float t ) {
  vec3 a = vec3(0.660, 0.560, 0.680);
  vec3 b = vec3(0.718, 0.438, 0.720);
  vec3 c = vec3(0.520, 0.800, 0.520);
  vec3 d = vec3(-0.430, -0.397, -0.083);

  return a + b*cos( 6.28318*(c*t+d) );
}

void main(void) {
  float computedTime = time * speed;
  vec2 uv = vUV - .5;
  vec3 finalColor = vec3(0.);
  for (int i = 0; i < iterations; i++) {
    uv = fract(uv * scale) - .5;

    float d = length(uv);

    vec3 col = palette(d + computedTime);

    float factor = 8.;
    d = sin(d * factor + computedTime) / factor;
    d = abs(d);

    d = .015 / d; // smoothstep(.0, .1, d);

    finalColor += col *= d;
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
