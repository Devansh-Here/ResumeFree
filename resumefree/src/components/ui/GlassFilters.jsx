// src/components/ui/GlassFilters.jsx

// Renders the SVG distortion filters used by the liquid-glass components.
// Mount this ONCE near the root of the app (e.g. in App.jsx, outside <Routes>) —
// both the Navbar glass and Modal glass components reference these filter ids,
// so we don't want a duplicate <filter> injected every time a glass component renders.

const GlassFilters = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      {/* NAVBAR — strong, fully "liquid" distortion with specular lighting */}
      <filter
        id="glass-distortion-nav"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.001 0.005"
          numOctaves="1"
          seed="17"
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale="5"
          specularConstant="1"
          specularExponent="100"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litImage"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="200"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* MODAL — v2: fine-grain frosted texture, not a wavy melt.
          Old version used baseFrequency 0.003–0.007 + scale 200, which
          produces big smooth warps (looks like melted glass). Reference
          screenshot (weather widget) shows a clean frosted-panel look
          with only faint refraction at the edges — so: higher
          baseFrequency (finer noise grain), numOctaves 2 for a bit of
          organic texture, a small Gaussian blur to soften the noise
          before displacing, and scale dropped from 200 → 18 so the
          content behind barely bends instead of visibly warping. */}
      <filter
        id="glass-distortion-modal"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.012 0.018"
          numOctaves="2"
          seed="4"
          result="turbulence"
        />
        <feGaussianBlur in="turbulence" stdDeviation="2" result="softTurbulence" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softTurbulence"
          scale="18"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

export default GlassFilters;