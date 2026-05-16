(function () {
  /** Three.js-сцена в отдельной секции (не в hero) */
  const canvas = document.getElementById("scene-3d-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const section = canvas.closest(".section-scene");
  let renderer;
  let scene;
  let camera;
  let points;
  let rafId = 0;
  let isRunning = false;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init() {
    const width = canvas.clientWidth || section?.clientWidth || 800;
    const height = canvas.clientHeight || 360;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.z = 14;

    const count = prefersReducedMotion() ? 120 : 520;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(0x2b7fff),
      new THREE.Color(0xad46ff),
      new THREE.Color(0xf6339a),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 22;
      positions[i3 + 1] = (Math.random() - 0.5) * 12;
      positions[i3 + 2] = (Math.random() - 0.5) * 16;
      const c = palette[i % palette.length];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
  }

  function resize() {
    if (!renderer || !camera) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate() {
    if (!isRunning || !points) return;
    points.rotation.y += 0.0018;
    points.rotation.x += 0.0006;
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (prefersReducedMotion() || isRunning) return;
    isRunning = true;
    animate();
  }

  function stop() {
    isRunning = false;
    cancelAnimationFrame(rafId);
  }

  init();
  resize();
  start();

  window.addEventListener("resize", resize);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  if (section && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !document.hidden) start();
          else stop();
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(section);
  }
})();
