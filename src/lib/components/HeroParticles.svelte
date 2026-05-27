<script>
	import { onMount } from 'svelte';

	let wrap;
	let pixiCanvas;

	onMount(async () => {
		if (typeof window === 'undefined' || !wrap) return;

		const PIXI = await import('pixi.js');

		const W = wrap.clientWidth || window.innerWidth;
		const H = wrap.clientHeight || window.innerHeight;
		if (W === 0 || H === 0) return;

		const isMobile = W < 768;

		const app = new PIXI.Application({
			width: W,
			height: H,
			view: pixiCanvas,
			backgroundAlpha: 0,
			resolution: Math.min(window.devicePixelRatio || 1, 2),
			autoDensity: true,
			antialias: false,
			powerPreference: 'high-performance'
		});

		// ── CONTAINERS ────────────────────────────────────────────────
		const bgContainer = new PIXI.Container(); // sparse ambient fabric
		const logoContainer = new PIXI.Container(); // logo vortex
		app.stage.addChild(bgContainer);
		app.stage.addChild(logoContainer);

		// ── MOUSE ─────────────────────────────────────────────────────
		let mouseX = W * 0.7;
		let mouseY = H * 0.43;
		let smoothX = mouseX;
		let smoothY = mouseY;

		const onMove = (e) => {
			const r = wrap.getBoundingClientRect();
			mouseX = e.clientX - r.left;
			mouseY = e.clientY - r.top;
		};
		const onTouch = (e) => {
			const r = wrap.getBoundingClientRect();
			mouseX = e.touches[0].clientX - r.left;
			mouseY = e.touches[0].clientY - r.top;
		};
		wrap.addEventListener('mousemove', onMove);
		wrap.addEventListener('touchmove', onTouch, { passive: true });

		// ── HELPERS ───────────────────────────────────────────────────
		const rng = (a, b) => a + Math.random() * (b - a);
		const lerpColor = (c1, c2, t) => {
			const r1 = (c1 >> 16) & 0xff,
				g1 = (c1 >> 8) & 0xff,
				b1 = c1 & 0xff;
			const r2 = (c2 >> 16) & 0xff,
				g2 = (c2 >> 8) & 0xff,
				b2 = c2 & 0xff;
			return (
				(Math.round(r1 + (r2 - r1) * t) << 16) |
				(Math.round(g1 + (g2 - g1) * t) << 8) |
				Math.round(b1 + (b2 - b1) * t)
			);
		};

		// ── TEXTURES ──────────────────────────────────────────────────
		// Tiny solid dot for logo particles
		const makeDotTex = (size) => {
			const c = document.createElement('canvas');
			c.width = c.height = size;
			const ctx = c.getContext('2d');
			ctx.fillStyle = '#ffffff';
			ctx.beginPath();
			ctx.arc(size / 2, size / 2, size / 2 - 0.3, 0, Math.PI * 2);
			ctx.fill();
			return PIXI.Texture.from(c);
		};

		// Soft glow dot for ambient network nodes
		const makeGlowTex = (size) => {
			const c = document.createElement('canvas');
			c.width = c.height = size;
			const ctx = c.getContext('2d');
			const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
			g.addColorStop(0, 'rgba(255,255,255,1)');
			g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
			g.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, size, size);
			return PIXI.Texture.from(c);
		};

		const partTex = makeDotTex(4);
		const nodeTex = makeGlowTex(16);

		// ── AMBIENT DATA NETWORK (background) ─────────────────────────
		const nodeCount = isMobile ? 50 : 85;
		const bgNodes = Array.from({ length: nodeCount }, () => ({
			x: rng(10, W - 10),
			y: rng(10, H - 10),
			size: rng(2, 5),
			baseAlpha: rng(0.05, 0.13),
			pulseOffset: rng(0, Math.PI * 2),
			pulseSpeed: rng(0.2, 0.55)
		}));

		// Static connection lines
		const lineG = new PIXI.Graphics();
		const CONN_D = Math.min(W, H) * 0.15;
		const CONN_D2 = CONN_D * CONN_D;
		for (let i = 0; i < bgNodes.length; i++) {
			for (let j = i + 1; j < bgNodes.length; j++) {
				const dx = bgNodes[i].x - bgNodes[j].x;
				const dy = bgNodes[i].y - bgNodes[j].y;
				const d2 = dx * dx + dy * dy;
				if (d2 < CONN_D2) {
					const pct = 1 - Math.sqrt(d2) / CONN_D;
					lineG.lineStyle(0.5, 0x00d4aa, pct * 0.065);
					lineG.moveTo(bgNodes[i].x, bgNodes[i].y);
					lineG.lineTo(bgNodes[j].x, bgNodes[j].y);
				}
			}
		}
		bgContainer.addChild(lineG);

		const bgNodePC = new PIXI.ParticleContainer(nodeCount, {
			position: true,
			tint: true,
			alpha: true,
			scale: true,
			rotation: false
		});
		bgContainer.addChild(bgNodePC);

		const bgNodeSprites = bgNodes.map((n) => {
			const s = new PIXI.Sprite(nodeTex);
			s.anchor.set(0.5);
			s.x = n.x;
			s.y = n.y;
			s.scale.set(n.size / 16);
			s.alpha = n.baseAlpha;
			s.tint = 0x00d4aa;
			bgNodePC.addChild(s);
			return { ...n, sprite: s };
		});

		// ── LOGO VORTEX — sample the logo PNG ─────────────────────────
		// Logo is positioned in the right-center area, large enough to feel epic
		const logoSize = Math.min(W, H) * (isMobile ? 0.416 : 0.52);
		const logoCX = W * (isMobile ? 0.64 : 0.7);
		const logoCY = H * (isMobile ? 0.38 : 0.44);

		const SAMPLE_RES = 512;
		const STEP = isMobile ? 5 : 3;

		const logoSrcList = [];

		await new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const sc = document.createElement('canvas');
				sc.width = SAMPLE_RES;
				sc.height = SAMPLE_RES;
				const sctx = sc.getContext('2d');
				sctx.drawImage(img, 0, 0, SAMPLE_RES, SAMPLE_RES);
				const px = sctx.getImageData(0, 0, SAMPLE_RES, SAMPLE_RES).data;
				const lx = logoCX - logoSize / 2;
				const ly = logoCY - logoSize / 2;
				for (let y = 0; y < SAMPLE_RES; y += STEP) {
					for (let x = 0; x < SAMPLE_RES; x += STEP) {
						const idx = (y * SAMPLE_RES + x) * 4;
						if (px[idx + 3] > 50) {
							const wx = lx + (x / SAMPLE_RES) * logoSize;
							const wy = ly + (y / SAMPLE_RES) * logoSize;
							logoSrcList.push({ x: wx, y: wy });
						}
					}
				}
				resolve();
			};
			img.onerror = resolve;
			img.src = '/img/geminislabs-nobg.png';
		});

		if (logoSrcList.length === 0) return;

		// Build particle data: store polar coords relative to logo center
		const maxLogoR = logoSize * 0.5;

		const logoPC = new PIXI.ParticleContainer(logoSrcList.length, {
			position: true,
			tint: true,
			alpha: true,
			scale: false,
			rotation: false
		});
		logoContainer.addChild(logoPC);

		const logoParticles = logoSrcList.map((s) => {
			const dx = s.x - logoCX;
			const dy = s.y - logoCY;
			const r = Math.sqrt(dx * dx + dy * dy);
			const baseAngle = Math.atan2(dy, dx);

			// Emerald → cyan gradient based on radius
			const colorT = Math.min(r / maxLogoR, 1);
			const tint = lerpColor(0x00ff7a, 0x00c8ff, colorT);

			// Brightness varies with radius: center brighter, outer dimmer
			const alpha = Math.max(0.15, 0.75 - colorT * 0.38 + rng(-0.1, 0.18));

			const sprite = new PIXI.Sprite(partTex);
			sprite.anchor.set(0.5);
			sprite.x = s.x;
			sprite.y = s.y;
			sprite.alpha = alpha;
			sprite.tint = tint;
			logoPC.addChild(sprite);

			return {
				sprite,
				r,
				baseAngle,
				x: s.x,
				y: s.y,
				vx: 0,
				vy: 0
			};
		});

		// ── ANIMATION TICKER ──────────────────────────────────────────
		let globalRot = 0;
		const ATTR_R = Math.min(W, H) * 0.34;
		const PARALLAX = isMobile ? 0.25 : 1.0;

		app.ticker.add(() => {
			const t = performance.now() * 0.001;
			// ~0.2 RPM slow rotation — pinwheel logo becomes a living vortex
			globalRot += 0.00038;

			// Smooth mouse
			smoothX += (mouseX - smoothX) * 0.04;
			smoothY += (mouseY - smoothY) * 0.04;
			const nx = (smoothX / W - 0.5) * PARALLAX;
			const ny = (smoothY / H - 0.5) * PARALLAX;

			// Parallax: bg moves slower, logo faster
			bgContainer.x = nx * -14;
			bgContainer.y = ny * -9;
			logoContainer.x = nx * -36;
			logoContainer.y = ny * -24;

			// Ambient node pulse
			for (let i = 0; i < bgNodeSprites.length; i++) {
				const ns = bgNodeSprites[i];
				const pulse = (Math.sin(t * ns.pulseSpeed + ns.pulseOffset) + 1) * 0.5;
				ns.sprite.alpha = Math.max(0, ns.baseAlpha * (0.35 + pulse * 0.65));
			}

			// Logo particles: spring toward rotating target + cursor gravity
			for (let i = 0; i < logoParticles.length; i++) {
				const p = logoParticles[i];

				// Rotating rest position
				const ang = p.baseAngle + globalRot;
				const tx = logoCX + Math.cos(ang) * p.r;
				const ty = logoCY + Math.sin(ang) * p.r;

				// Spring force toward rotating target
				p.vx += (tx - p.x) * 0.02;
				p.vy += (ty - p.y) * 0.02;

				// Cursor gravitational pull
				const ddx = mouseX - p.x;
				const ddy = mouseY - p.y;
				const d = Math.sqrt(ddx * ddx + ddy * ddy) + 0.5;
				if (d < ATTR_R) {
					const force = 0.32 * (1 - d / ATTR_R);
					p.vx += (ddx / d) * force;
					p.vy += (ddy / d) * force;
				}

				p.vx *= 0.865;
				p.vy *= 0.865;
				p.x += p.vx;
				p.y += p.vy;
				p.sprite.x = p.x;
				p.sprite.y = p.y;
			}
		});

		const onResize = () => {
			if (app?.renderer && wrap) app.renderer.resize(wrap.clientWidth, wrap.clientHeight);
		};
		window.addEventListener('resize', onResize);

		return () => {
			wrap?.removeEventListener('mousemove', onMove);
			wrap?.removeEventListener('touchmove', onTouch);
			window.removeEventListener('resize', onResize);
			app.destroy(true, { children: true, texture: true, baseTexture: true });
		};
	});
</script>

<div bind:this={wrap} class="hero-canvas-wrap">
	<canvas bind:this={pixiCanvas}></canvas>
</div>

<style>
	.hero-canvas-wrap {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: all;
	}

	.hero-canvas-wrap :global(canvas) {
		display: block;
		position: absolute;
		inset: 0;
		width: 100% !important;
		height: 100% !important;
	}
</style>
