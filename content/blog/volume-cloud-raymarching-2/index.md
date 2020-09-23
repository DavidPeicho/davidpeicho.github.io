---
title: "Behind The Scene: Cloud Raymarching Demo (2/2)"
date: 2020-09-29
slug: "cloud-raymarching-walkthrough-part2"
description: "Walthrough to understand how to visualize clouds using raymarching"
keywords: [ "volume rendering", "raymarching", "cloud", "three.js", "webgl" ]
tags: [ "graphics", "three.js" ]
images: [ "/images/homepage.jpg" ]
draft: true
math: false
---

This blog post will walk you through how I created the volume rendering visualization
available on the [Home page](/).

<!--more-->

## Light Support

Right now, the light is hardcoded in the shader. In my demo, I decided to let
the user control the lighting using the mouse.

## Burning Effect

TODO

## Improving Ray Generation

There is one gotcha here. We are **not** going to generate World Space rays.
The volume is going to be represented by a texture in which sample are retrieved
in the interval `[0...1]`. By generating rays in **Model Space**, we can directly
sample the texture **without** performing any change of basis. This has two advantages:

1. It's faster. we do not apply matrices back and forth
2. I write less code and so my mental health is better

TODO

## Improving Performance

Texture fetch are always expensive in shaders. To compute the gradients, we
used the Finite-difference technique and we ended up with **6** extra fetches.

Our volume is static (the texture doesn't change), it's possible to create a
_"gradient"_ texture containing, for every voxel, the associated gradient.

For performance purpose, I decided to generate the gradient texture in a background
thread using a [Worker](). The code to generate the gradient textures is available
on [GitHub](). While the texture is being built, the user can visualize the cloud
witht the gradient computed on the fly. When the gradient texture is available,
the shader is updated and fetches the gradient in the texture:

_cloud.frag.glsl_
```glsl
vec3
computeGradient(vec3 position, float step)
{
  #ifdef USE_GRADIENT_MAP

  vec3 gradientRGB = texture(uGradientMap, position + 0.5).rgb;
  return normalize(gradientRGB * 2.0 - 1.0);

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
```

## Tweaking

TODO

## Going Further

#### 1. Emtpy-space Skipping

TODO
