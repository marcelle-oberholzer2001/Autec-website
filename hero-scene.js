(function () {
  function init() {
    var canvas = document.getElementById('plant-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    function W() { return canvas.parentElement.offsetWidth || window.innerWidth; }
    function H() { return canvas.parentElement.offsetHeight || window.innerHeight; }

    // ── Renderer ─────────────────────────────────────────────────────────────
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0600);
    scene.fog = new THREE.Fog(0x0d0600, 120, 200);

    // Narrow FOV = telephoto drone lens feel
    var camera = new THREE.PerspectiveCamera(38, W() / H(), 1, 300);

    // ── Photo plane ──────────────────────────────────────────────────────────
    var loader = new THREE.TextureLoader();
    loader.load('assets/hero-plant-1.jpg', function (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      // Sharp anisotropic filtering — fixes the pixelation on oblique surfaces
      tex.anisotropy  = renderer.capabilities.getMaxAnisotropy();
      tex.minFilter   = THREE.LinearMipmapLinearFilter;
      tex.magFilter   = THREE.LinearFilter;
      tex.needsUpdate = true;

      // 160×107 — sees ~70% of the image width, plenty of sunset + plant
      var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(160, 107),
        new THREE.MeshBasicMaterial({ map: tex })
      );
      plane.rotation.x = -Math.PI / 2 + Math.PI / 4; // 45° tilt
      scene.add(plane);
    });


    // ── Dust particles ───────────────────────────────────────────────────────
    var DUST = 180;
    var dPos = new Float32Array(DUST * 3);
    var dVX  = new Float32Array(DUST);
    var dVY  = new Float32Array(DUST);
    var dVZ  = new Float32Array(DUST);

    function resetP(i) {
      dPos[i*3]   = (Math.random() - 0.5) * 120;
      dPos[i*3+1] = Math.random() * 2;
      dPos[i*3+2] = (Math.random() - 0.5) * 60;
      dVX[i] = (Math.random() - 0.5) * 0.01;
      dVY[i] = 0.012 + Math.random() * 0.018;
      dVZ[i] = (Math.random() - 0.5) * 0.008;
    }
    for (var i = 0; i < DUST; i++) { resetP(i); dPos[i*3+1] = Math.random() * 28; }
    var dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xffaa33, size: 0.3, transparent: true, opacity: 0.25, sizeAttenuation: true
    })));

    // ── Camera path ──────────────────────────────────────────────────────────
    var t    = 0;
    var R    = 90;
    var elev = Math.PI / 4;
    var look = new THREE.Vector3();

    function animate() {
      requestAnimationFrame(animate);
      t += 0.00038;

      var swing     = Math.sin(t);
      var swingX    = swing * 40;
      var heightVar = Math.sin(t * 0.7) * 10;
      var pullVar   = Math.sin(t * 0.4) * 8;

      camera.position.set(
        swingX,
        R * Math.sin(elev) + heightVar,
        R * Math.cos(elev) + pullVar
      );

      // Look target shifts up slightly so the horizon/sunset stays in frame
      look.set(swing * 16, 8, -10);
      camera.lookAt(look);

      var bank = swing * 0.08;
      camera.up.set(Math.sin(bank), Math.cos(bank), 0);

      for (var j = 0; j < DUST; j++) {
        dPos[j*3]   += dVX[j];
        dPos[j*3+1] += dVY[j];
        dPos[j*3+2] += dVZ[j];
        if (dPos[j*3+1] > 28) resetP(j);
      }
      dustGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    window.addEventListener('resize', function () {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    });

    animate();
  }

  if (document.readyState === 'complete') { init(); }
  else { window.addEventListener('load', init); }
})();
