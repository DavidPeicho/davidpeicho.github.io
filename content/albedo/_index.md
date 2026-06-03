{
  "title": "Albedo",
  "heading": "Albedo",
  "keywords": [ "graphics", "rendering", "3D", "albedo", "raytracing" ],
  "description": "Albedo: Raytracing tool suite based on Rust, WebGPU, and Wasm",
  "images": [ "/images/me.jpg" ],
  "type": "about",
  "showSocials": false
}

## Albedo

Albedo is raytracing ecosystem written in rust and leveraging WebGPU native and WebGPU web.

The ecosystem already comes with:
* Low level WebGPU raytracing library
  * Intersection, shading kernels
  * Denoising
* Native editor to process scenes into a custom runtime format
* Lightweight Web pathtracing runtime

{{< image src="editor.webp" alt="Albedo editor Sponza scene" >}}


## Try it!

<iframe class="demo-carousel demo-carousel__frame" src="/demo/albedo/index.html"></iframe>

Currently works on Safari, Firefox, and Chromium-based browsers.

## Technical

The albedo ecosystem is flexibile enough to be used in different enviroments (web / native), as well
as different use cases that need raytracing / pathtracing.

While the demo showcase real-time pathtracing and screen-space denoising, the ecosystem can be integrated
into a custom engine for:

**Baking:**
* GI (probes, lightmaps)
* Ambient Occlusion

**Dynamic Effects:**
* Ambient Occlusion
* Shadows

## Interested?

Please reach out to me via on my socials if this project peaked your interest!

{{< socials >}}
