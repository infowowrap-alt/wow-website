import * as THREE from "three";

// Compone le due scene della hero: Interior sotto il taglio, Garage sopra, e
// la pellicola Interior con il suo spessore (riflesso sul bordo, ombra sul
// Garage) e l'angolo sollevato che mostra la carta siliconata.
export function compositeMaterial(liner: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      tI: { value: null },
      tG: { value: null },
      tLiner: { value: liner },
      uRes: { value: new THREE.Vector2(1, 1) },
      uCut: { value: 0 },
      uK: { value: new THREE.Vector2() },
      uU: { value: new THREE.Vector2(0, -1) },
      uFold: { value: 0 },
      uLinerScale: { value: 1 / 640 },
      uFade: { value: 0 },
      uExpI: { value: 1 },
      uExpG: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tI;
      uniform sampler2D tG;
      uniform sampler2D tLiner;
      uniform vec2 uRes;
      uniform float uCut;
      uniform vec2 uK;
      uniform vec2 uU;
      uniform float uFold;
      uniform float uLinerScale;
      uniform float uFade;
      varying vec2 vUv;

      uniform float uExpI;
      uniform float uExpG;
      // ACES (approssimazione di Narkowicz): le scene arrivano in HDR lineare.
      vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

      float sdCut(vec2 p) { return (p.x - p.y - uCut) * 0.70710678; }

      void main() {
        vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;
        vec3 ci = aces(texture2D(tI, vUv).rgb * uExpI);
        vec3 cg = aces(texture2D(tG, vUv).rgb * uExpG);
        float sd = sdCut(p);

        // Pellicola Interior sopra il Garage: bordo netto da taglierino.
        float onG = smoothstep(-0.7, 0.7, sd);
        // Ombra portata dal bordo della pellicola sul Garage.
        cg *= 1.0 - 0.55 * exp(-max(sd, 0.0) / 9.0) * onG;
        vec3 col = mix(ci, cg, onG);
        // Spessore: un filo di luce sul bordo della pellicola.
        col += vec3(0.9, 0.92, 1.0) * 0.6 * exp(-pow((sd + 1.2) / 0.9, 2.0));

        if (uFold > 0.5) {
          float d = dot(p - uK, uU);
          if (sd < 0.0 && d < uFold) {
            // Sotto l'angolo sollevato si vede il Garage, in ombra vicino alla piega.
            col = cg * (0.55 + 0.45 * smoothstep(0.0, uFold, uFold - d));
          } else if (d >= uFold && d < 2.0 * uFold + 2.0) {
            vec2 pr = p - 2.0 * (d - uFold) * uU;
            bool inScreen = pr.x >= -0.5 && pr.y <= uRes.y + 0.5 && pr.y >= -0.5 && pr.x <= uRes.x + 0.5;
            if (sdCut(pr) < 0.0 && inScreen && dot(pr - uK, uU) < uFold) {
              // Il lembo: carta siliconata, più chiara sulla piega, più scura verso la punta.
              float t = (d - uFold) / max(uFold, 1.0);
              vec3 liner = texture2D(tLiner, pr * uLinerScale).rgb;
              float shade = mix(1.04, 0.78, t);
              float edge = smoothstep(0.0, 1.5, min(-sdCut(pr), uFold - dot(pr - uK, uU)));
              col = mix(col * 0.7, liner * shade, edge);
            } else {
              // Ombra morbida del lembo sul resto.
              float sh = exp(-(d - 2.0 * uFold) / 14.0);
              col *= 1.0 - 0.18 * clamp(sh, 0.0, 1.0) * step(sd, 0.0);
            }
          }
        }
        gl_FragColor = vec4(col, uFade);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
}
