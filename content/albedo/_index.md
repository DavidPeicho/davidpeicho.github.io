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

Albedo is a work-in-progress raytracing ecosystem written in **Rust** and leveraging **wgpu native** and **WebGPU**.

* Runs everywhere: Chrome/Firefox/Safari and native
* No **RT cores** / vendor-specific raytracing hardware required

{{< hint note >}}

Originally open sourced on [GitHub](https://github.com/davidPeicho/albedo), the project
is being continued as closed source for the time being.

{{< /hint >}}

### Runtime

Real-time path tracing runtime, running natively or the web. Try it:

<iframe loading="lazy" class="demo-carousel demo-carousel__frame large" src="/demo/albedo/index.html"></iframe>

{{< hint warning >}}

Works on **Firefox**, **Safari**, and **Chromium** browsers.

Prefer Firefox or Canary, as Chrome and Safari suffer performance issues.

{{< /hint >}}

Nitty-gritty details:

* Zero-copy file format
* Custom dynamic data-oriented scene format
    * Not a general-purpose ECS
* GPU-driven rendering

### Editor

Native application used to package scenes for use with the runtime.

{{< image src="editor.webp" alt="Albedo editor Sponza scene" >}}

While still minimalistic, it is built around the concept that processing files and packaging
should be threaded, fast, and painless.

<video autoplay loop muted playsinline src="compression.mp4"></video>
<p class="descriptive-title">Editor image compression during asset import</p>

<video autoplay loop muted playsinline src="package.mp4"></video>
<p class="descriptive-title">Packaging a scene is typically in the milliseconds range</p>

### Libraries

While the demo showcases real-time path tracing and screen-space denoising, the ecosystem exposes:
* Intersection, shading, and denoising kernels
* Bindless-style textures and materials management

#### Use Cases

* Baking GI (probes, lightmaps)
* Baking ambient occlusion

{{< image src="ao-bake.webp" alt="Baked Ambient Occlusion" >}}

* Real-time ambient occlusion
* Real-time shadows
* GPU Picking

<video autoplay loop muted playsinline src="gpu-picking.mp4"></video>
<p class="descriptive-title">Albedo low-level raytracing library used for GPU picking</p>

## Interested?

If this project peaked your interest, please reach out to me on socials:

{{< socials >}}
