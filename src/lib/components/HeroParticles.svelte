<script>
	import { onMount } from 'svelte';

	let wrap;
	let logoImg;
	let pixiCanvas;

	onMount(async () => {
		if (typeof window === 'undefined' || !wrap) return;

		const PIXI = await import('pixi.js');

		const W = wrap.clientWidth;
		const H = wrap.clientHeight;

		const app = new PIXI.Application({
			width: W,
			height: H,
			view: pixiCanvas,
			backgroundAlpha: 0,
			resolution: Math.min(window.devicePixelRatio || 1, 2),
			autoDensity: true,
			antialias: true,
			powerPreference: 'high-performance'
		});

		// ── Logo PNG overlay ──────────────────────────────────
		const logoSize = Math.min(W, H) * 0.42;
		const logoCX = W * 0.68;
		const logoCY = H * 0.38;
		if (logoImg) {
			logoImg.style.left = `${logoCX}px`;
			logoImg.style.top = `${logoCY}px`;
			logoImg.style.width = `${logoSize}px`;
			logoImg.style.height = `${logoSize}px`;
			logoImg.style.opacity = '1';
		}

		// ── Green dot texture ─────────────────────────────────
		const dotC = document.createElement('canvas');
		dotC.width = 6;
		dotC.height = 6;
		const dctx = dotC.getContext('2d');
		dctx.fillStyle = '#ffffff';
		dctx.beginPath();
		dctx.arc(3, 3, 2.2, 0, Math.PI * 2);
		dctx.fill();
		const dotTex = PIXI.Texture.from(dotC);

		// ── Binary digit pool ─────────────────────────────────
		const binStyle = new PIXI.TextStyle({
			fontFamily: '"Courier New", Courier, monospace',
			fontSize: 9,
			fill: '#3d6b3d'
		});
		const textLayer = new PIXI.Container();
		app.stage.addChild(textLayer);
		const textPool = [];
		const activeTexts = [];
		for (let i = 0; i < 40; i++) {
			const t = new PIXI.Text('0', binStyle);
			t.anchor.set(0.5);
			t.alpha = 0;
			textLayer.addChild(t);
			textPool.push(t);
		}

		// ── Sample logo pixels ────────────────────────────────
		const SAMPLE_RES = 360;
		const STEP = 3;
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
						const i = (y * SAMPLE_RES + x) * 4;
						if (px[i + 3] > 55) {
							logoSrcList.push({
								x: lx + (x / SAMPLE_RES) * logoSize,
								y: ly + (y / SAMPLE_RES) * logoSize,
								color: (px[i] << 16) | (px[i + 1] << 8) | px[i + 2]
							});
						}
					}
				}
				resolve();
			};
			img.onerror = resolve;
			img.src = '/img/geminislabs-nobg.png';
		});

		// ── Logo particle layer ───────────────────────────────
		const logoPC = new PIXI.ParticleContainer(logoSrcList.length + 4, {
			position: true,
			tint: true,
			alpha: false,
			scale: false,
			rotation: false
		});
		logoPC.alpha = 0;
		app.stage.addChild(logoPC);

		const greenParticles = [];
		for (let i = 0; i < logoSrcList.length; i++) {
			const s = logoSrcList[i];
			const sprite = new PIXI.Sprite(dotTex);
			sprite.anchor.set(0.5);
			sprite.x = s.x;
			sprite.y = s.y;
			sprite.tint = s.color;
			logoPC.addChild(sprite);
			greenParticles.push({
				id: i,
				ox: s.x,
				oy: s.y,
				x: s.x,
				y: s.y,
				vx: 0,
				vy: 0,
				sprite,
				settled: false
			});
		}

		// ── State ─────────────────────────────────────────────
		// States: 'idle' | 'forming' | 'active' | 'returning'
		let state = 'idle';
		let cursorX = logoCX,
			cursorY = logoCY;
		let lastMove = 0;
		let formingStart = 0;
		let returnStart = 0;

		const IDLE_MS = 50;
		const FORM_HOLD_MS = 50; // particles hold logo shape before burst
		const RETURN_SHOW_DELAY = 1000;
		const PARTICLES_HIDE_DELAY = 1100;

		const setLogoOpacity = (v, dur = '0.5s') => {
			if (logoImg) {
				logoImg.style.transition = `opacity ${dur} ease`;
				logoImg.style.opacity = String(v);
			}
		};

		const burstParticles = () => {
			for (const p of greenParticles) {
				const dx = p.ox - logoCX,
					dy = p.oy - logoCY;
				const len = Math.sqrt(dx * dx + dy * dy) || 1;
				const burst = 1.5 + Math.random() * 2.5;
				p.vx += (dx / len) * burst + (Math.random() - 0.5) * 4;
				p.vy += (dy / len) * burst + (Math.random() - 0.5) * 4;
				p.settled = false;
			}
		};

		// ── Pointer ───────────────────────────────────────────
		const onMove = (e) => {
			const r = wrap.getBoundingClientRect();
			cursorX = e.clientX - r.left;
			cursorY = e.clientY - r.top;
			lastMove = performance.now();
		};
		const onTouch = (e) => {
			const touch = e.touches[0];
			const r = wrap.getBoundingClientRect();
			cursorX = touch.clientX - r.left;
			cursorY = touch.clientY - r.top;
			lastMove = performance.now();
		};
		wrap.addEventListener('mousemove', onMove);
		wrap.addEventListener('touchmove', onTouch, { passive: true });
		window.addEventListener('resize', () => {
			if (app && wrap) app.renderer.resize(wrap.clientWidth, wrap.clientHeight);
		});

		// ── Main ticker ───────────────────────────────────────
		app.ticker.add(() => {
			const now = performance.now();
			const t = now * 0.001;
			const dt = app.ticker.deltaMS;
			const idle = lastMove === 0 || now - lastMove > IDLE_MS;

			// ── State machine transitions ──────────────────────
			if (state === 'idle' && !idle) {
				// Cursor just started moving → show logo as particles, hold briefly
				state = 'forming';
				formingStart = now;
				setLogoOpacity(0, '0.3s');
				// Reset particles to exact logo positions, no velocity
				for (const p of greenParticles) {
					p.x = p.ox;
					p.y = p.oy;
					p.vx = 0;
					p.vy = 0;
					p.sprite.x = p.ox;
					p.sprite.y = p.oy;
					p.settled = false;
				}
				logoPC.alpha = 1;
			}

			if (state === 'forming') {
				if (now - formingStart >= FORM_HOLD_MS) {
					// Hold time elapsed → burst and switch to active
					state = 'active';
					burstParticles();
				}
				// During forming: just hold particles in place (no physics applied below)
			}

			if (state === 'active' && idle) {
				state = 'returning';
				returnStart = now;
			}

			if (state === 'returning') {
				if (!idle) {
					// Cursor moved again mid-return
					state = 'active';
					returnStart = 0;
				} else {
					const el = now - returnStart;
					if (el > RETURN_SHOW_DELAY) {
						setLogoOpacity(1, '0.55s');
					}
					if (el > PARTICLES_HIDE_DELAY) {
						logoPC.alpha = 0;
						state = 'idle';
						for (const p of greenParticles) {
							p.x = p.ox;
							p.y = p.oy;
							p.vx = 0;
							p.vy = 0;
							p.sprite.x = p.ox;
							p.sprite.y = p.oy;
						}
					}
				}
			}

			// ── Logo particle physics ──────────────────────────
			if (logoPC.alpha > 0 && state === 'active') {
				for (let i = 0; i < greenParticles.length; i++) {
					const p = greenParticles[i];

					const dx = cursorX - p.x,
						dy = cursorY - p.y;
					const d = Math.sqrt(dx * dx + dy * dy);
					const safe = Math.max(d, 32);
					const invD = 1 / safe;
					const ux = dx * invD,
						uy = dy * invD;

					const radial = d > 110 ? 1.2 : 0.28;
					const tang = 1.5;
					const repel = d < 46 ? (46 - d) * 0.06 : 0;
					const nx = Math.sin(t * 0.88 + p.id * 1.71) * 0.16;
					const ny = Math.cos(t * 0.88 + p.id * 2.39) * 0.16;

					p.vx += ux * radial - uy * tang - ux * repel + nx;
					p.vy += uy * radial + ux * tang - uy * repel + ny;
					p.vx *= 0.88;
					p.vy *= 0.88;

					p.x += p.vx;
					p.y += p.vy;
					p.sprite.x = p.x;
					p.sprite.y = p.y;
				}
			}

			if (logoPC.alpha > 0 && state === 'returning') {
				for (let i = 0; i < greenParticles.length; i++) {
					const p = greenParticles[i];

					p.vx += (p.ox - p.x) * 0.065;
					p.vy += (p.oy - p.y) * 0.065;
					p.vx *= 0.845;
					p.vy *= 0.845;

					if (!p.settled) {
						const dox = p.ox - p.x,
							doy = p.oy - p.y;
						if (dox * dox + doy * doy < 4 && Math.abs(p.vx) < 0.22) {
							p.settled = true;
							if (Math.random() < 0.18 && textPool.length > 0) {
								const txt = textPool.pop();
								txt.text = Math.random() > 0.5 ? '1' : '0';
								txt.x = p.ox;
								txt.y = p.oy;
								txt.alpha = 0;
								activeTexts.push({ txt, age: 0, life: 500 + Math.random() * 440 });
							}
						}
					}

					p.x += p.vx;
					p.y += p.vy;
					p.sprite.x = p.x;
					p.sprite.y = p.y;
				}
			}

			// ── Binary digit settle animation ──────────────────
			for (let i = activeTexts.length - 1; i >= 0; i--) {
				const b = activeTexts[i];
				b.age += dt;
				const prog = b.age / b.life;
				if (prog < 0.28) b.txt.alpha = (prog / 0.28) * 0.58;
				else if (prog < 0.72) b.txt.alpha = 0.58;
				else if (prog < 1) b.txt.alpha = ((1 - prog) / 0.28) * 0.58;
				else {
					b.txt.alpha = 0;
					textPool.push(b.txt);
					activeTexts.splice(i, 1);
				}
			}
		});

		return () => {
			wrap?.removeEventListener('mousemove', onMove);
			wrap?.removeEventListener('touchmove', onTouch);
			app.destroy(true, { children: true, texture: true, baseTexture: true });
		};
	});
</script>

<div bind:this={wrap} class="hero-canvas-wrap">
	<canvas bind:this={pixiCanvas}></canvas>
	<img
		bind:this={logoImg}
		src="/img/geminislabs-nobg.png"
		alt="Geminis Labs"
		class="hero-logo-crisp"
	/>
</div>

<style>
	.hero-canvas-wrap {
		position: absolute;
		inset: 0;
		z-index: 3;
	}

	.hero-canvas-wrap :global(canvas) {
		display: block;
		position: absolute;
		inset: 0;
		width: 100% !important;
		height: 100% !important;
	}

	.hero-logo-crisp {
		position: absolute;
		transform: translate(-50%, -50%);
		object-fit: contain;
		pointer-events: none;
		z-index: 2;
		opacity: 0;
	}
</style>
