import React from "react";
import * as THREE from "three";

const MAX_CLICKS = 10;

const SHAPE_MAP = {
  circle: 1,
  diamond: 3,
  square: 0,
  triangle: 2,
} as const;

const VERTEX_SHADER = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int uShapeType;
uniform int uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;
uniform vec2 uClickPos[${MAX_CLICKS}];
uniform float uClickTimes[${MAX_CLICKS}];

out vec4 fragColor;

float hash11(float n) {
  return fract(sin(n) * 43758.5453);
}

float vnoise(vec3 p) {
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n100 = hash11(dot(ip + vec3(1.0, 0.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n010 = hash11(dot(ip + vec3(0.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n110 = hash11(dot(ip + vec3(1.0, 1.0, 0.0), vec3(1.0, 57.0, 113.0)));
  float n001 = hash11(dot(ip + vec3(0.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n101 = hash11(dot(ip + vec3(1.0, 0.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n011 = hash11(dot(ip + vec3(0.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));
  float n111 = hash11(dot(ip + vec3(1.0, 1.0, 1.0), vec3(1.0, 57.0, 113.0)));
  vec3 w = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  return mix(mix(x00, x10, w.y), mix(x01, x11, w.y), w.z) * 2.0 - 1.0;
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}

float fbm2(vec2 uv, float t) {
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < 5; ++i) {
    sum += amp * vnoise(p * freq);
    freq *= 1.25;
    amp *= 1.0;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov) {
  float r = sqrt(cov) * 0.25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov) {
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d = p.y - r * (1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d / aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov) {
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main() {
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * 0.5;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUv = fract(fragCoord / pixelSize);
  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);
  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;
  float feed = base + (uDensity - 0.5) * 0.3;

  if (uEnableRipples == 1) {
    for (int i = 0; i < ${MAX_CLICKS}; ++i) {
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      vec2 clickUv = (((pos - uResolution * 0.5 - cellPixelSize * 0.5) / uResolution)) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, clickUv);
      float ring = exp(-pow((r - uRippleSpeed * t) / uRippleThickness, 2.0));
      float atten = exp(-1.0 * t) * exp(-10.0 * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);
  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float coverage = bw * (1.0 + (h - 0.5) * uPixelJitter);
  float mask;
  if (uShapeType == 1) mask = maskCircle(pixelUv, coverage);
  else if (uShapeType == 2) mask = maskTriangle(pixelUv, pixelId, coverage);
  else if (uShapeType == 3) mask = maskDiamond(pixelUv, coverage);
  else mask = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    mask *= smoothstep(0.0, uEdgeFade, edge);
  }

  fragColor = vec4(uColor, mask);
}
`;

export interface PixelBlastProps {
  readonly className?: string | undefined;
  readonly color?: string | undefined;
  readonly edgeFade?: number | undefined;
  readonly enableRipples?: boolean | undefined;
  readonly patternDensity?: number | undefined;
  readonly patternScale?: number | undefined;
  readonly pixelSize?: number | undefined;
  readonly pixelSizeJitter?: number | undefined;
  readonly rippleIntensityScale?: number | undefined;
  readonly rippleSpeed?: number | undefined;
  readonly rippleThickness?: number | undefined;
  readonly speed?: number | undefined;
  readonly style?: React.CSSProperties | undefined;
  readonly variant?: keyof typeof SHAPE_MAP | undefined;
}

export function PixelBlast({
  className,
  color = "#b497cf",
  edgeFade = 0.3,
  enableRipples = true,
  patternDensity = 1,
  patternScale = 2,
  pixelSize = 4,
  pixelSizeJitter = 0,
  rippleIntensityScale = 1,
  rippleSpeed = 0.3,
  rippleThickness = 0.1,
  speed = 0.5,
  style,
  variant = "circle",
}: PixelBlastProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const speedRef = React.useRef(speed);
  const clickIndexRef = React.useRef(0);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    speedRef.current = speed;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return undefined;
    }
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    container.appendChild(renderer.domElement);

    const uniforms = {
      uClickPos: { value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)) },
      uClickTimes: { value: new Float32Array(MAX_CLICKS) },
      uColor: { value: new THREE.Color(color) },
      uDensity: { value: patternDensity },
      uEdgeFade: { value: edgeFade },
      uEnableRipples: { value: enableRipples ? 1 : 0 },
      uPixelJitter: { value: pixelSizeJitter },
      uPixelSize: { value: pixelSize * renderer.getPixelRatio() },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uRippleIntensity: { value: rippleIntensityScale },
      uRippleSpeed: { value: rippleSpeed },
      uRippleThickness: { value: rippleThickness },
      uScale: { value: patternScale },
      uShapeType: { value: SHAPE_MAP[variant] ?? SHAPE_MAP.circle },
      uTime: { value: 0 },
    };
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      fragmentShader: FRAGMENT_SHADER,
      glslVersion: THREE.GLSL3,
      transparent: true,
      uniforms,
      vertexShader: VERTEX_SHADER,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const setSize = (): void => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
      uniforms.uPixelSize.value = pixelSize * renderer.getPixelRatio();
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    const clock = new THREE.Clock();
    const timeOffset = Math.random() * 1000;
    let animationFrame = 0;
    const render = (): void => {
      uniforms.uTime.value = timeOffset + clock.getElapsedTime() * speedRef.current;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    const mapPointer = (event: PointerEvent): THREE.Vector2 => {
      const rect = renderer.domElement.getBoundingClientRect();
      const scaleX = renderer.domElement.width / rect.width;
      const scaleY = renderer.domElement.height / rect.height;
      return new THREE.Vector2(
        (event.clientX - rect.left) * scaleX,
        (rect.height - (event.clientY - rect.top)) * scaleY,
      );
    };

    const handlePointerDown = (event: PointerEvent): void => {
      const index = clickIndexRef.current;
      uniforms.uClickPos.value[index]?.copy(mapPointer(event));
      uniforms.uClickTimes.value[index] = uniforms.uTime.value;
      clickIndexRef.current = (index + 1) % MAX_CLICKS;
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    color,
    edgeFade,
    enableRipples,
    patternDensity,
    patternScale,
    pixelSize,
    pixelSizeJitter,
    rippleIntensityScale,
    rippleSpeed,
    rippleThickness,
    speed,
    variant,
  ]);

  return (
    <div
      aria-hidden="true"
      className={["agenthub-pixel-blast", className].filter(Boolean).join(" ")}
      ref={containerRef}
      style={style}
    />
  );
}
