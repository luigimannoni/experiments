precision mediump float;
varying vec2 vUV;
uniform sampler2D diffuseTexture1;
uniform sampler2D diffuseTexture2;
uniform sampler2D specularTexture;
uniform vec2 scale;
uniform float time;

#define PI 3.14159265359
#define TAU 6.28318530718
#define MAX_ITER 32

vec4 water() {
  vec2 p = mod(vUV*TAU, TAU)-250.0;
	vec2 i = vec2(p * 32.) / 20.;
	float c = 1.0;
	float inten = .002;

	for (int n = 0; n < MAX_ITER; n++) 
	{
		float t = (time / 10.) * (1.0 - (3.5 / float(n+1)));
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
	}
	c /= float(MAX_ITER);
	c = 0.17-pow(c, 0.2);
	vec3 colour = vec3(pow(abs(c), 8.0));
  colour = clamp(colour + vec3(0.0, 0.01, 0.6), 0.0, 1.0);
    
	return normalize(vec4(colour, 1.0));
}

void main(void) {
  float x = vUV.x;

  vec4 color1 = texture2D(diffuseTexture1, vUV);
  vec4 color2 = texture2D(diffuseTexture2, vUV);
  vec4 specular = texture2D(specularTexture, vUV);

  float multiplier = 3.;
  float curve = cos((x + fract(time / 10.)) * ((PI * 2.))) * multiplier + (multiplier / 2.);

  vec4 color = mix(color1, color2, clamp(curve, 0., 1.));
  vec4 water = water();
  water = mix(water + vec4(0., 0., .05, 0.), water - vec4(0., 0., .25, 0.), clamp(curve, 0., 1.));

  gl_FragColor = mix(color, water, specular.r);
}