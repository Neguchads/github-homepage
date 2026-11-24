# NAVI Universe renderer

Consumes the version-1 public snapshot from [NAVI Graphify](https://github.com/Neguchads/navi-graphify) and the responsive theme + optional WebGPU world from [Navyv Abyss](https://github.com/Neguchads/navyv-abyss). The [Neguchads profile](https://github.com/Neguchads/Neguchads) publishes the bundle.

`node scripts/build-universe.mjs SNAPSHOT ABYSS_ROOT PROFILE_ROOT OUTPUT`

The dashboard uses actual XYZ coordinates, rotation and perspective projection onto Canvas 2D (not WebGPU). No network or CDN required for the dashboard once downloaded with assets. The optional Abyss world is the original separate WebGPU experience. Integration and membership edges are not inferred dependencies. Missing AST counts are explicitly unavailable. Existing card rendering and offline explorer remain intact.
