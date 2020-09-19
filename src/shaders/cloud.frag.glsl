precision highp float;
precision highp sampler3D;

#define M_PI 3.1415926535897932384626433832795
#define NB_STEPS 80

#define EPSILON 0.0000001
#define EPSILON_ONE 1.0000001
#define saturate(a) clamp(a, 0.0, 1.0)

#define NON_LINEAR_CLASSIFICATION

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

uniform vec3 uInverseVoxelSize;
uniform mat4 modelViewMatrix;

uniform float uWindowMin;
uniform float uWindowMax;
uniform float uAbsorption;
uniform float uAlphaTest;
uniform float uFrame;
uniform vec3 uBaseColor;

#ifdef EDGE_GLOW
uniform vec3 uEdgeColor;
#endif // EDGE_GLOW

uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

uint wang_hash(inout uint seed)
{
  seed = (seed ^ 61u) ^ (seed >> 16u);
  seed *= 9u;
  seed = seed ^ (seed >> 4u);
  seed *= 0x27d4eb2du;
  seed = seed ^ (seed >> 15u);
  return seed;
}

float randomFloat(inout uint seed)
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

bool
intersectAABB(Ray ray, inout float near, inout float far)
{
  // Ray is assumed to be in local coordinates, ie:
  // ray = inverse(objectMatrix * invCameraMatrix) * ray

  // Equation of ray: O + D * t

  vec3 aabbMin = vec3(-0.5);
  vec3 aabbMax = vec3(0.5);

  vec3 invRay = 1.0 / ray.dir;
  vec3 tbottom = invRay * (aabbMin - ray.origin);
  vec3 ttop = invRay * (aabbMax - ray.origin);

  vec3 tmin = min(ttop, tbottom);
  vec3 tmax = max(ttop, tbottom);

  float largestMin = max(max(tmin.x, tmin.y), max(tmin.x, tmin.z));
  float smallestMax = min(min(tmax.x, tmax.y), min(tmax.x, tmax.z));

  near = largestMin;
  far = smallestMax;

  return smallestMax > largestMin;
}

bool
outsideUnitBox(vec3 pos)
{
  return (
    pos.x < 0. || pos.y < 0. || pos.z < 0. ||
    pos.x > 1. || pos.y > 1. || pos.z > 1.
  );
}

float
getSample(vec3 modelPosition)
{
  // Center the fetch
  vec3 pos = modelPosition + 0.5;
  // vec3 pos = modelPosition;
  return texture(uVolume, pos).r;
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

  return normalize(texture(uGradientMap, position + 0.5).rgb * 2.0 - 1.0);

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
computeIrradiance(Ray rayView, vec3 gradient)
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
    posToLight = p.position - rayView.origin;
    len = length(posToLight);
    NdotL = dot(gradient, normalize(posToLight));
    if (NdotL < 0.0) NdotL = -NdotL;
    NdotL = max(0.0, NdotL) * 1.5;
    acc += p.color * pow(saturate( -len / p.distance + 1.0 ), p.decay) * NdotL;
	}
	#pragma unroll_loop_end

  #endif

  return acc;
}

void
main()
{
  float near = 0.0;
  float far = 0.0;
  vec4 acc = vec4(0.0);

  Ray ray;
  ray.origin = vRay.origin;
  ray.dir = normalize(vRay.dir);

  Ray rayView;

  bool intersect = intersectAABB(ray, near, far);

  ray.origin = vRay.origin + near * ray.dir;

  vec3 inc = 1.0 / abs( ray.dir );
  float delta = min(inc.x, min(inc.y, inc.z)) / float(NB_STEPS);
  ray.dir = ray.dir * delta;

  #define JITTER
  #ifdef JITTER
    // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
	  uint seed = uint(gl_FragCoord.x) * uint(1973) + uint(gl_FragCoord.y) * uint(9277) + uint(uFrame) * uint(26699);
    float randNum = randomFloat(seed) * 2.0 - 1.0;
    ray.origin += ray.dir * randNum;
  #endif

  #ifdef DEBUG_BOX
  vec4 debugColor = intersect ? vec4(1.0, 0.0, 0.0, 1.0) : vec4(0.0);
  #endif

  for (int i = 0; i < NB_STEPS; ++i)
  {
    float s = getSample(ray.origin);
    s = smoothstep(uWindowMin, uWindowMax, s) * uAbsorption;
    #ifdef NON_LINEAR_CLASSIFICATION
    s *= s * uAbsorption;
    #endif // NON_LINEAR_CLASSIFICATION

    rayView.origin = transformPoint(modelViewMatrix, ray.origin);
    vec3 gradient = transformDir(modelViewMatrix, computeGradient(ray.origin, delta));

    float transparency = 1.0 - acc.a;
    float sampleFactor = transparency * s;
    vec3 diffuse = computeIrradiance(rayView, gradient);
    diffuse *= 2.0 - uAbsorption;

    acc.rgb += sampleFactor * (uBaseColor + diffuse);
    acc.a += sampleFactor;

    if (acc.a > uAlphaTest) { break; }

    ray.origin += ray.dir;

    if (outsideUnitBox(ray.origin + 0.5)) { break; }
  }

  #ifdef DEBUG_BOX
  pc_fragColor = debugColor;
  #else
  pc_fragColor.rgba += acc;

  #ifdef EDGE_GLOW
  pc_fragColor.rgb += (1.0 - acc.a) * uEdgeColor;
  #endif // EDGE_GLOW

  #endif
}
