struct Ray {
  vec3 origin;
  vec3 dir;
};

out Ray vRay;

// Camera origin express in the space `inverse(modelViewMatrix)`.
uniform vec3 uLocalSpaceCameraOrigin;

void
main()
{
  vRay.dir = position - uLocalSpaceCameraOrigin;
  vRay.origin = uLocalSpaceCameraOrigin + vec3(0.5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
