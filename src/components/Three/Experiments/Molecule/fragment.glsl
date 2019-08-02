precision highp float;
precision highp int;

uniform vec3 color;

// varying float intensity;
varying float vNoise;

void main() {
	// vec3 glow = vec3(1., 1., 1.) * intensity;

  gl_FragColor = vec4((color * smoothstep( -2., 2., vNoise )), 1.0 );
}
  