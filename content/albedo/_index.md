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

Albedo is raytracing ecosystem written in rust and leveraging WebGPU native and WebGPU web:
* Low level raytracing library
  * Intersection, shading kernels
  * Denoising kernels
* Native editor to process scenes into a custom runtime format
* Lightweight Web pathtracing runtime

{{< image src="editor.webp" alt="Albedo editor Sponza scene" >}}

{{< hint note >}}

Originally open sourced on [GitHub](https://github.com/davidPeicho/albedo), the project
is continued closed-source for the time being.

{{< /hint >}}

## Try it!

<iframe class="demo-carousel demo-carousel__frame" src="/demo/albedo/index.html"></iframe>

{{< hint warning >}}

Currently works on **Firefox**, **Safari**, and **Chromium** browsers.

Prefer using Firefox or Canary, since Chrome and Safari have performance issues.

{{< /hint >}}

## Use Cases

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

{{< image src="ao-bake.webp" alt="Ambient Occlusiong baking" >}}

## Technical Side

### Editor

* Multithreaded image compression
* Asset processing cache
* Instantaneous packaging in a fast runtime format

<video autoplay loop muted playsinline src="package.mp4" style="width: 100%; display: block; margin: auto"></video>

{{< hint info >}}

Packaging is instantaneous here, but the progress has a minimum display time for improved UX.

{{< /hint >}}
### Runtime

* Custom dynamic data-oriented scene format
    * Not a general purpose ECS

## Interested?

Please reach out to me via on my socials if this project peaked your interest!

{{< socials >}}
