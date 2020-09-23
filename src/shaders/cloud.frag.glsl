precision highp float;
precision highp sampler3D;

#define M_PI 3.1415926535897932384626433832795

#define EPSILON 0.0000001
#define EPSILON_ONE 1.0000001
#define saturate(a) clamp(a, 0.0, 1.0)

struct PointLight {
  vec3 position;
  vec3 color;
  float distance;
  float decay;
};

struct Ray {
  vec3 origin;
  vec3 dir;
};

in Ray vRay;

uniform sampler3D uVolume;

#ifdef USE_GRADIENT_MAP
uniform sampler3D uGradientMap;
#endif // USE_GRADIENT_MAP

uniform mat4 modelViewMatrix;

uniform vec3 uBaseColor;
uniform float uWindowMin;
uniform float uWindowMax;
uniform float uAbsorption;
uniform float uAlphaTest;
uniform float uDecay;
uniform float uFrame;

#if ( NUM_POINT_LIGHTS > 0 )
uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
#endif // NUM_POINT_LIGHTS > 0

uint
wang_hash(inout uint seed)
{
  seed = (seed ^ 61u) ^ (seed >> 16u);
  seed *= 9u;
  seed = seed ^ (seed >> 4u);
  seed *= 0x27d4eb2du;
  seed = seed ^ (seed >> 15u);
  return seed;
}

float
randomFloat(inout uint seed)
{
  return float(wang_hash(seed)) / 4294967296.;
}

vec3
transformPoint(mat4 transform, vec3 point)
{
  vec4 projected = transform * vec4(point, 1.0);
  return (projected.xyz / projected.w).xyz;
}

vec3
transformDir(mat4 transform, vec3 dir)
{
  return normalize(transform * vec4(dir, 0.0)).xyz;
}

void
computeNearFar(Ray ray, inout float near, inout float far)
{
  // Ray is assumed to be in local coordinates, ie:
  // ray = inverse(objectMatrix * invCameraMatrix) * ray
  // Equation of ray: O + D * t

  vec3 invRay = 1.0 / ray.dir;

  // Shortcut here, it should be: `aabbMin - ray.origin`.
  // As we are always using normalized AABB, we can skip the line
  // `(0, 0, 0) - ray.origin`.
  vec3 tbottom = - invRay * ray.origin;
  vec3 ttop = invRay * (vec3(1.0) - ray.origin);

  vec3 tmin = min(ttop, tbottom);
  vec3 tmax = max(ttop, tbottom);

  float largestMin = max(max(tmin.x, tmin.y), max(tmin.x, tmin.z));
  float smallestMax = min(min(tmax.x, tmax.y), min(tmax.x, tmax.z));

  near = largestMin;
  far = smallestMax;
}

float
getSample(vec3 modelPosition)
{
  return texture(uVolume, modelPosition).r;
}

float
getSample(float x, float y, float z)
{
  return getSample(vec3(x, y, z));
}

vec3
computeGradient(vec3 position, float step)
{
  #ifdef USE_GRADIENT_MAP

  return normalize(texture(uGradientMap, position).rgb * 2.0 - 1.0);

  #else // !USE_GRADIENT_MAP

  return normalize(vec3(
    getSample(position.x + step, position.y, position.z)
    - getSample(position.x - step, position.y, position.z),
    getSample(position.x, position.y + step, position.z)
    - getSample(position.x, position.y - step, position.z),
    getSample(position.x, position.y, position.z + step)
    - getSample(position.x, position.y, position.z - step)
  ));

  #endif // USE_GRADIENT_MAP
}

vec3
computeIrradiance(vec3 originViewSpace, vec3 gradient)
{
  vec3 acc = vec3(0.0);

  #if ( NUM_POINT_LIGHTS > 0 )

	PointLight p;
  vec3 posToLight;
  float len = 0.0;
  float NdotL = 1.0;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		p = pointLights[ i ];
    posToLight = p.position - originViewSpace;
    len = length(posToLight);
    NdotL = dot(gradient, normalize(posToLight));
    if (NdotL < 0.0) NdotL = -NdotL;
    NdotL = max(0.2, NdotL);
    acc += p.color * pow(saturate( -len / p.distance + 1.0 ), p.decay) * NdotL;
	}
	#pragma unroll_loop_end

  #endif

  return acc;
}

void
main()
{
  vec4 acc = vec4(0.0);

  Ray ray;
  ray.origin = vRay.origin;
  ray.dir = normalize(vRay.dir);

  float near = 0.0;
  float far = 0.0;
  computeNearFar(ray, near, far);

  ray.origin = vRay.origin + near * ray.dir;

  vec3 inc = 1.0 / abs( ray.dir );
  float delta = min(inc.x, min(inc.y, inc.z)) / float(NB_STEPS);
  ray.dir = ray.dir * delta;

  float dist = near;

  #define JITTER
  #ifdef JITTER
  // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
  uint seed =
    uint(gl_FragCoord.x) * uint(1973) +
    uint(gl_FragCoord.y) * uint(9277) +
    uint(uFrame) * uint(26699);
  float randNum = randomFloat(seed) * 2.0 - 1.0;
  ray.origin += ray.dir * randNum;
  dist += randNum * delta;
  #endif

  vec3 originViewSpace = vec3(0.0);
  for (int i = 0; i < NB_STEPS; ++i)
  {
    float s = getSample(ray.origin);
    #ifdef INVERSE
    s = 1.0 - s;
    #endif // INVERSE
    s = pow(s, uDecay);
    s = smoothstep(uWindowMin, uWindowMax, s) * uAbsorption;

    // NOTE: would be better to pass light in local space as well.
    // Three.js has light in View Space by default so I simply used that.
    originViewSpace = transformPoint(modelViewMatrix, ray.origin);
    vec3 gradient = transformDir(modelViewMatrix, computeGradient(ray.origin, delta));

    float sampleFactor = (1.0 - acc.a) * s;
    vec3 diffuse = computeIrradiance(originViewSpace, gradient);

    acc.rgb += sampleFactor * (uBaseColor + diffuse);
    acc.a += sampleFactor;

    if (acc.a > uAlphaTest) { break; }

    ray.origin += ray.dir;
    dist += delta;

    if (dist > far) { break; }
  }

  pc_fragColor.rgba += acc;
}
