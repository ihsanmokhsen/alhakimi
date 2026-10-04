"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Efek "cair" pada gambar hero: gambar terdistorsi mengikuti jejak kursor lalu pulih perlahan.
 *
 * Cara kerja: tekstur jejak beresolusi rendah menyimpan vektor kecepatan kursor (RG, 0.5 = diam),
 * di-ping-pong tiap frame agar memudar dan sedikit "mengalir", lalu dipakai untuk menggeser UV
 * gambar. Latar CSS di section tetap jadi fallback bila WebGL tidak ada / reduced motion.
 */

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const TRAIL_FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D previous;
uniform vec2 point;
uniform vec2 force;
uniform float radius;
uniform float aspect;
void main() {
  vec2 d = texture2D(previous, vUv).xy - 0.5;
  // Ambil sampel sedikit "ke belakang" agar jejak ikut mengalir, bukan sekadar memudar.
  d = texture2D(previous, vUv - d * 0.02).xy - 0.5;
  float len = length(d);
  // Peluruhan + pengurang tetap supaya presisi 8-bit tidak meninggalkan sisa distorsi.
  d *= len > 0.0 ? max(len * 0.955 - 0.004, 0.0) / len : 0.0;
  vec2 diff = (vUv - point) * vec2(aspect, 1.0);
  d += force * exp(-dot(diff, diff) / radius);
  gl_FragColor = vec4(clamp(d, -0.5, 0.5) + 0.5, 0.0, 1.0);
}`;

const DISPLAY_FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D image;
uniform sampler2D trail;
uniform vec2 cover;
uniform float strength;
void main() {
  vec2 d = texture2D(trail, vUv).xy - 0.5;
  float len = length(d);
  d *= max(len - 0.006, 0.0) / max(len, 0.0001);
  vec2 uv = (vUv - 0.5) * cover + 0.5;
  vec2 offset = d * strength;
  // Pemisahan warna tipis di tepi distorsi memberi kesan cairan/lensa.
  float r = texture2D(image, uv - offset * 1.15).r;
  float g = texture2D(image, uv - offset).g;
  float b = texture2D(image, uv - offset * 0.85).b;
  float sheen = smoothstep(0.0, 0.3, length(d)) * 0.07;
  gl_FragColor = vec4(vec3(r, g, b) + sheen, 1.0);
}`;

const MAX_DPR = 1.5;
const TRAIL_SCALE = 0.25;
const TRAIL_RADIUS = 0.012;
const FORCE_GAIN = 7;
const DISTORTION_STRENGTH = 0.12;
/** Jumlah frame yang tetap dirender setelah gerakan terakhir, cukup untuk jejak memudar habis. */
const SETTLE_FRAMES = 150;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("[hero-liquid] shader gagal dikompilasi:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, fragment: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

function createTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

type Trail = { texture: WebGLTexture; framebuffer: WebGLFramebuffer };

function createTrail(gl: WebGLRenderingContext, width: number, height: number): Trail | null {
  const texture = createTexture(gl);
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) return null;
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.clearColor(0.5, 0.5, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { texture, framebuffer };
}

export function HeroLiquid({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl || gl.isContextLost()) return;

    const trailProgram = createProgram(gl, TRAIL_FRAGMENT);
    const displayProgram = createProgram(gl, DISPLAY_FRAGMENT);
    if (!trailProgram || !displayProgram) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const trailUniforms = {
      previous: gl.getUniformLocation(trailProgram, "previous"),
      point: gl.getUniformLocation(trailProgram, "point"),
      force: gl.getUniformLocation(trailProgram, "force"),
      radius: gl.getUniformLocation(trailProgram, "radius"),
      aspect: gl.getUniformLocation(trailProgram, "aspect")
    };
    const displayUniforms = {
      image: gl.getUniformLocation(displayProgram, "image"),
      trail: gl.getUniformLocation(displayProgram, "trail"),
      cover: gl.getUniformLocation(displayProgram, "cover"),
      strength: gl.getUniformLocation(displayProgram, "strength")
    };

    const imageTexture = createTexture(gl);
    let imageAspect = 1;
    let trails: [Trail, Trail] | null = null;
    let trailSize = [1, 1];
    let disposed = false;
    let visible = true;
    let frame = 0;
    let settleFrames = 0;
    let pointer: { x: number; y: number } | null = null;
    let force = [0, 0];

    function deleteTrails() {
      if (!gl || !trails) return;
      for (const trail of trails) {
        gl.deleteTexture(trail.texture);
        gl.deleteFramebuffer(trail.framebuffer);
      }
      trails = null;
    }

    function resize() {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width === width && canvas.height === height && trails) return;

      canvas.width = width;
      canvas.height = height;
      trailSize = [Math.max(1, Math.round(width * TRAIL_SCALE)), Math.max(1, Math.round(height * TRAIL_SCALE))];
      deleteTrails();
      const a = createTrail(gl, trailSize[0], trailSize[1]);
      const b = createTrail(gl, trailSize[0], trailSize[1]);
      trails = a && b ? [a, b] : null;
      settleFrames = Math.max(settleFrames, 1);
      requestRender();
    }

    function render() {
      frame = 0;
      if (disposed || !gl || !canvas || !trails) return;

      // 1. Perbarui jejak (ping-pong): baca trails[0], tulis trails[1].
      gl.useProgram(trailProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, trails[1].framebuffer);
      gl.viewport(0, 0, trailSize[0], trailSize[1]);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, trails[0].texture);
      gl.uniform1i(trailUniforms.previous, 0);
      gl.uniform2f(trailUniforms.point, pointer?.x ?? -10, pointer?.y ?? -10);
      gl.uniform2f(trailUniforms.force, force[0], force[1]);
      gl.uniform1f(trailUniforms.radius, TRAIL_RADIUS);
      gl.uniform1f(trailUniforms.aspect, canvas.width / canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      trails = [trails[1], trails[0]];
      force = [0, 0];

      // 2. Gambar hero dengan UV yang digeser jejak.
      const canvasAspect = canvas.width / canvas.height;
      gl.useProgram(displayProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(displayUniforms.image, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, trails[0].texture);
      gl.uniform1i(displayUniforms.trail, 1);
      // Setara background-size: cover + background-position: center.
      gl.uniform2f(
        displayUniforms.cover,
        canvasAspect > imageAspect ? 1 : canvasAspect / imageAspect,
        canvasAspect > imageAspect ? imageAspect / canvasAspect : 1
      );
      gl.uniform1f(displayUniforms.strength, DISTORTION_STRENGTH);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      settleFrames -= 1;
      if (settleFrames > 0) requestRender();
    }

    function requestRender() {
      if (!frame && visible && !disposed) frame = requestAnimationFrame(render);
    }

    function onPointerMove(event: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointer = null;
        return;
      }
      if (pointer) {
        const fx = force[0] + (x - pointer.x) * FORCE_GAIN;
        const fy = force[1] + (y - pointer.y) * FORCE_GAIN;
        const magnitude = Math.hypot(fx, fy);
        const scale = magnitude > 0.5 ? 0.5 / magnitude : 1;
        force = [fx * scale, fy * scale];
      }
      pointer = { x, y };
      settleFrames = SETTLE_FRAMES;
      requestRender();
    }

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (disposed) return;
      imageAspect = image.naturalWidth / image.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      resize();
      settleFrames = 1;
      render();
      setIsReady(true);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    };
    image.src = src;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && settleFrames > 0) requestRender();
    });
    intersectionObserver.observe(canvas);

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      // Jangan loseContext(): canvas bisa dipakai ulang (StrictMode/remount) dan context yang hilang tidak bisa dipakai lagi.
      deleteTrails();
      gl.deleteTexture(imageTexture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(trailProgram);
      gl.deleteProgram(displayProgram);
    };
  }, [src]);

  return (
    <canvas
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700 ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
      ref={canvasRef}
    />
  );
}
