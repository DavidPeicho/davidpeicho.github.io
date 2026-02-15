{
  "title": "About",
  "heading": "David Peicho",
  "keywords": [ "graphics", "rendering", "3D", "blog", "david peicho" ],
  "description": "David Peicho is a Senior Rendering Engineer currently working on the Wonderland Engine",
  "images": [ "/images/me.jpg" ],
  "teaching": [
    {
      "title": "Real-Time Rendering",
      "course": "Rendering Theory, PBR",
      "school": "EPITA",
      "date": "2023"
    },
    {
      "title": "Three.js",
      "course": "Fundamentals, Lighting, PBR, Postprocessing",
      "school": "EPITA",
      "date": "2022"
    },
    {
      "title": "Teaching Assistant",
      "course": "C, Unix, Shell, and Algorithms",
      "school": "EPITA",
      "date": "2018"
    },
    {
      "title": "Teaching Assistant",
      "course": "Java, SQL, and Algorithms",
      "school": "EPITA",
      "date": "2017"
    },
    {
      "title": "Teaching Assistant",
      "course": "OCaml, C#, and Algorithms",
      "school": "EPITA",
      "date": "2016"
    }
  ]
}

## Hi!

I am David Peicho, a *Senior Rendering Engineer* working on the [Wonderland Engine](https://wonderlandengine.com/), with strong interests in computer graphics and game development, using C++, Rust, and TypeScript.

I have spent the past decade focusing on WebGL, and more recently, WebGPU.

{{< socials >}}

#### Open-Source Contributions

> * [Albedo](https://github.com/DavidPeicho/albedo)
> * [Wonderland Engine community](https://github.com/wonderlandEngine)
> * [Three.js](https://github.com/mrdoob/three.js/)
> * [wgpu-native](https://github.com/gfx-rs/wgpu-native/)
> * [WebGL](https://github.com/KhronosGroup/WebGL)

## Work

### Wonderland Engine (2022-Current)

*Senior Rendering Engineer* on the [Wonderland Engine](https://wonderlandengine.com/),
a C++ game engine compiled to WebAssembly and running in the browser.

{{< image src="clear-coat.webp" alt="Clear-coat implementation made for Wonderland Engine" >}}

Rendering contributions include:
* Engine architecture
* Sparse probes volume for GI (voxelization, baking)
* PBR workflows (colorspace, shading, baking)
* GTAO
* Optimization (OVR GPU Profiler, GPU queries, and Chrome DevTools)

<iframe
  src="https://wonderlandengine.github.io/wonderland-engine-examples/sponza.html"
  allow="xr-spatial-tracking https://wonderlandengine.github.io; cross-origin-isolated https://wonderlandengine.github.io"
  style="width: 100%; aspect-ratio: 1.77;"
  loading="lazy"
  allowfullscreen="">
</iframe>

Being in a startup also means working on a broad range of topics. My contributions span non-rendering areas
such as prefabs, or nodejs embedding for user plugins.

### Siemens Healthineers (2018-2022)

*Research Scientist* and *Lead Developer* of a **real-time** WebGL medical data visualization library.

{{< image src="cinematic-rendering-heart.webp" alt="Cinematic Rendering heart example from Siemens Healthineers page" >}}

* Multi-bounce Volume Pathtracer
* Multiplanar reconstruction
* Mobile optimization

While none of the work is public, the library produced images such as the [Cinematic Rendering](https://www.siemens-healthineers.com/en-us/digital-health-solutions/cinematic-rendering) ones:

{{< image src="cinematic-rendering.webp" alt="Cinematic Rendering example from Siemens Healthineers page" >}}

### Sketchfab (2016)

6 months internship in the Sketchfab 3D team.

{{< image src="sponza-ssao.webp" >}}

Some of the features I shipped are live on [Sketchfab](https://sketchfab.com/):
* ASTC software decompression in JavaScript
* glTF loading in [OSG.js](https://github.com/cedricpinson/osgjs)
* SSAO

## Education

I graduated from EPITA (Ecole des Ingénieurs en Intelligence Informatique) in 2018, where I obtained a Master’s degree in Computer Science, specializing in “Advanced" Computer Science and Artificial Intelligence.
