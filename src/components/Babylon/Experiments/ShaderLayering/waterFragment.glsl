// Found this on GLSL sandbox. I really liked it, changed a few things and made it tileable.
// :)
// by David Hoskins.
// https://www.shadertoy.com/view/MdlXz8

// Water turbulence effect by joltz0r 2013-07-04, improved 2013-07-07

#define TAU 6.28318530718
#define MAX_ITER 32

void mainImage( out vec4 fragColor, in vec2 fragCoord ) 
{
	float time = iTime / 50.5;
    // uv should be the 0-1 uv of texture...
	vec2 uv = fragCoord.xy / iResolution.xy;
    

  vec2 p = mod(uv*TAU, TAU)-250.0;
	vec2 i = vec2(p) / 20.;
	float c = 1.0;
	float inten = .002;

	for (int n = 0; n < MAX_ITER; n++) 
	{
		float t = time * (1.0 - (3.5 / float(n+1)));
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
	}
	c /= float(MAX_ITER);
	c = 0.17-pow(c, 0.2);
	vec3 colour = vec3(pow(abs(c), 8.0));
  colour = clamp(colour + vec3(0.0, 0.1, 0.4), 0.0, 1.0);
    
	fragColor = vec4(colour, 1.0);
}