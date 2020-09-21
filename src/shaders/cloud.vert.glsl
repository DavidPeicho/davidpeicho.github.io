struct Ray {
  vec3 origin;
  vec3 dir;
};

out Ray vRay;

uniform mat4 uModelViewMatrixInverse;

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
main()
{
  vRay.origin = uModelViewMatrixInverse[3].xyz;
  vRay.dir = position - vRay.origin;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
