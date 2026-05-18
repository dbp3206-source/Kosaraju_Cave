/* vfx.js — Canvas particle systems for Kosaraju Caves */

// ── Background particle loop ──────────────────────────────────────────────────
let bgAnimId = null;

function initBackgroundCanvas(elementId) {
    if (bgAnimId) { cancelAnimationFrame(bgAnimId); bgAnimId = null; }
    if (window._bgResizeListener) {
        window.removeEventListener("resize", window._bgResizeListener);
        window._bgResizeListener = null;
    }
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window._bgResizeListener = resize;
    window.addEventListener("resize", resize);

    const systems = {
        metal: buildMetalSystem,
        wood:  buildWoodSystem,
        water: buildWaterSystem,
        fire:  buildFireSystem,
        earth: buildEarthSystem
    };
    const build = systems[elementId];
    if (!build) return;
    const state = build(canvas);

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        state.update(ctx, canvas);
        bgAnimId = requestAnimationFrame(loop);
    }
    loop();
}

// ── Metal: falling silver shards ──
function buildMetalSystem(canvas) {
    const shards = Array.from({length: 40}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        w: 4 + Math.random() * 10,
        h: 1.5 + Math.random() * 3,
        angle: (Math.random() - 0.5) * 0.6,
        vy: 0.5 + Math.random() * 1.2,
        alpha: 0.2 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? "#ffd700" : "#c8ced1"
    }));
    return {
        update(ctx, cv) {
            shards.forEach(s => {
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.angle);
                ctx.globalAlpha = s.alpha;
                ctx.fillStyle = s.color;
                ctx.shadowColor = s.color;
                ctx.shadowBlur = 6;
                ctx.fillRect(-s.w/2, -s.h/2, s.w, s.h);
                ctx.restore();
                s.y += s.vy;
                s.x += Math.sin(s.y * 0.02) * 0.4;
                if (s.y > cv.height + 10) { s.y = -10; s.x = Math.random() * cv.width; }
            });
        }
    };
}

// ── Wood: falling leaves + spores ──
function buildWoodSystem(canvas) {
    const leaves = Array.from({length: 30}, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: 6 + Math.random() * 8, vy: 0.4 + Math.random() * 0.8,
        vx: (Math.random() - 0.5) * 0.6, angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04, alpha: 0.3 + Math.random() * 0.5,
        color: ["#4e7c48","#72b66f","#3f2e19","#c48a42"][Math.floor(Math.random()*4)]
    }));
    const spores = Array.from({length: 20}, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: 2 + Math.random() * 3, vy: -0.3 - Math.random() * 0.6,
        alpha: 0.4 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2
    }));
    return {
        update(ctx, cv) {
            leaves.forEach(l => {
                ctx.save();
                ctx.translate(l.x, l.y); ctx.rotate(l.angle);
                ctx.globalAlpha = l.alpha;
                ctx.fillStyle = l.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, l.size, l.size * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                l.y += l.vy; l.x += l.vx + Math.sin(l.y * 0.03) * 0.5; l.angle += l.spin;
                if (l.y > cv.height + 10) { l.y = -10; l.x = Math.random() * cv.width; }
            });
            spores.forEach(s => {
                s.phase += 0.03;
                ctx.globalAlpha = s.alpha * (0.5 + 0.5 * Math.sin(s.phase));
                ctx.fillStyle = "#72d987";
                ctx.shadowColor = "#72d987"; ctx.shadowBlur = 8;
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                s.y += s.vy; s.x += Math.sin(s.phase) * 0.5;
                if (s.y < -10) { s.y = cv.height + 10; s.x = Math.random() * cv.width; }
            });
            ctx.globalAlpha = 1;
        }
    };
}

// ── Water: bubbles + light rays ──
function buildWaterSystem(canvas) {
    const bubbles = Array.from({length: 35}, () => ({
        x: Math.random() * canvas.width, y: canvas.height + Math.random() * canvas.height,
        r: 2 + Math.random() * 5, vy: 0.5 + Math.random() * 0.8,
        alpha: 0.15 + Math.random() * 0.3, vx: (Math.random() - 0.5) * 0.3
    }));
    const rays = Array.from({length: 5}, (_, i) => ({
        x: (canvas.width / 6) * (i + 0.5), width: 30 + Math.random() * 60,
        alpha: 0.04 + Math.random() * 0.06, phase: Math.random() * Math.PI * 2
    }));
    return {
        update(ctx, cv) {
            rays.forEach(r => {
                r.phase += 0.008;
                const a = r.alpha * (0.6 + 0.4 * Math.sin(r.phase));
                const g = ctx.createLinearGradient(r.x, 0, r.x + r.width, cv.height);
                g.addColorStop(0, `rgba(158,231,255,${a})`);
                g.addColorStop(1, "rgba(158,231,255,0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.moveTo(r.x, 0); ctx.lineTo(r.x + r.width, 0);
                ctx.lineTo(r.x + r.width * 0.6, cv.height); ctx.lineTo(r.x - r.width * 0.4, cv.height);
                ctx.fill();
            });
            bubbles.forEach(b => {
                ctx.globalAlpha = b.alpha;
                ctx.strokeStyle = "rgba(158,231,255,0.8)";
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
                b.y -= b.vy; b.x += b.vx;
                if (b.y < -10) { b.y = cv.height + 10; b.x = Math.random() * cv.width; }
            });
            ctx.globalAlpha = 1;
        }
    };
}

// ── Fire: rising embers ──
function buildFireSystem(canvas) {
    const embers = Array.from({length: 50}, () => ({
        x: Math.random() * canvas.width, y: canvas.height + Math.random() * 100,
        r: 1 + Math.random() * 2.5, vy: 0.8 + Math.random() * 1.5,
        life: Math.random(), decay: 0.005 + Math.random() * 0.01,
        color: ["#ff4500","#ff6a00","#ffbd66","#ff2200"][Math.floor(Math.random()*4)]
    }));
    return {
        update(ctx, cv) {
            embers.forEach(e => {
                e.life -= e.decay;
                if (e.life <= 0) {
                    e.x = Math.random() * cv.width; e.y = cv.height + 5;
                    e.life = 0.8 + Math.random() * 0.2; e.vy = 0.8 + Math.random() * 1.5;
                }
                ctx.globalAlpha = e.life * 0.8;
                ctx.fillStyle = e.color;
                ctx.shadowColor = e.color; ctx.shadowBlur = 8;
                ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                e.y -= e.vy; e.x += Math.sin(e.y * 0.05) * 0.6;
            });
            ctx.globalAlpha = 1;
        }
    };
}

// ── Earth: dust motes + falling pebbles ──
function buildEarthSystem(canvas) {
    const dust = Array.from({length: 40}, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2, vy: 0.1 + Math.random() * 0.3,
        vx: 0.2 + Math.random() * 0.5, alpha: 0.1 + Math.random() * 0.3
    }));
    const pebbles = Array.from({length: 12}, () => ({
        x: Math.random() * canvas.width, y: -Math.random() * 200,
        r: 3 + Math.random() * 5, vy: 0.6 + Math.random() * 1.2, alpha: 0.4 + Math.random() * 0.4
    }));
    return {
        update(ctx, cv) {
            dust.forEach(d => {
                ctx.globalAlpha = d.alpha;
                ctx.fillStyle = "#c49b62";
                ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
                d.x += d.vx; d.y += d.vy;
                if (d.x > cv.width + 5) { d.x = -5; d.y = Math.random() * cv.height; }
                if (d.y > cv.height + 5) { d.y = -5; }
            });
            pebbles.forEach(p => {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = "#6f5638";
                ctx.shadowColor = "#3b2b1f"; ctx.shadowBlur = 4;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                p.y += p.vy;
                if (p.y > cv.height + 10) { p.y = -10; p.x = Math.random() * cv.width; }
            });
            ctx.globalAlpha = 1;
        }
    };
}

// ── Cave Collapse: falling rocks on canvas ────────────────────────────────────
function triggerCollapseCanvas(canvas, onComplete) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    canvas.style.display = "block";

    const rocks = Array.from({length: 28}, () => ({
        x: Math.random() * canvas.width,
        y: -30 - Math.random() * 120,
        r: 10 + Math.random() * 22,
        vy: 4 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 3,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.12,
        color: ["#4a3728","#5c4033","#2d1f16"][Math.floor(Math.random()*3)]
    }));

    let startTime = null;
    const duration = 1600;

    // Body shake
    document.body.style.animation = "caveShake 0.12s infinite";

    function drawRock(ctx, rock) {
        ctx.save();
        ctx.translate(rock.x, rock.y); ctx.rotate(rock.rot);
        ctx.fillStyle = rock.color;
        ctx.shadowColor = "#000"; ctx.shadowBlur = 12;
        ctx.beginPath();
        const pts = 6;
        for (let i = 0; i < pts; i++) {
            const a = (i / pts) * Math.PI * 2;
            const rr = rock.r * (0.7 + 0.3 * Math.sin(a * 3));
            i === 0 ? ctx.moveTo(Math.cos(a)*rr, Math.sin(a)*rr)
                    : ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }

    function frame(ts) {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(0,0,0,${Math.min(progress * 0.7, 0.65)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        rocks.forEach(rock => {
            rock.y += rock.vy; rock.x += rock.vx; rock.rot += rock.spin;
            rock.vy += 0.18; // gravity
            if (rock.y < canvas.height + 40) drawRock(ctx, rock);
        });

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            document.body.style.animation = "";
            canvas.style.display = "none";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(frame);
}

// ── Victory VFX Canvas ────────────────────────────────────────────────────────
function triggerVictoryCanvasVFX(elementId, canvas, onComplete) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const configs = {
        fire: {
            particles: Array.from({length: 80}, () => ({
                x: canvas.width/2, y: canvas.height/2,
                vx: (Math.random()-0.5)*18, vy: (Math.random()-0.5)*18,
                r: 4+Math.random()*8, life: 1, decay: 0.012+Math.random()*0.018,
                color: ["#ff4500","#ff6a00","#ff2200","#ffbd66"][Math.floor(Math.random()*4)]
            })),
            bg: (ctx, cv, p) => {
                const g = ctx.createRadialGradient(cv.width/2,cv.height/2,0,cv.width/2,cv.height/2,cv.width*0.8);
                g.addColorStop(0, `rgba(255,69,0,${p*0.6})`);
                g.addColorStop(0.5, `rgba(139,0,0,${p*0.4})`);
                g.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle=g; ctx.fillRect(0,0,cv.width,cv.height);
            }
        },
        water: {
            particles: Array.from({length: 60}, () => ({
                x: Math.random()*canvas.width, y: canvas.height+20,
                vx: (Math.random()-0.5)*4, vy: -(5+Math.random()*8),
                r: 3+Math.random()*9, life: 1, decay: 0.008+Math.random()*0.012,
                color: ["#9ee7ff","#1aa4c8","#ffffff","#bef4ff"][Math.floor(Math.random()*4)]
            })),
            bg: (ctx, cv, p) => {
                const g = ctx.createLinearGradient(0,cv.height,0,0);
                g.addColorStop(0,`rgba(26,164,200,${p*0.7})`);
                g.addColorStop(1,"rgba(7,19,26,0)");
                ctx.fillStyle=g; ctx.fillRect(0,0,cv.width,cv.height);
            }
        },
        metal: {
            particles: Array.from({length: 60}, () => {
                const a = Math.random()*Math.PI*2, s=6+Math.random()*12;
                return {x:canvas.width/2, y:canvas.height/2, vx:Math.cos(a)*s, vy:Math.sin(a)*s,
                    r:2+Math.random()*4, life:1, decay:0.01+Math.random()*0.015,
                    color:["#ffd700","#c8ced1","#ffffff"][Math.floor(Math.random()*3)]};
            }),
            bg: (ctx, cv, p) => {
                ctx.fillStyle=`rgba(255,215,0,${p*0.15})`; ctx.fillRect(0,0,cv.width,cv.height);
            }
        },
        wood: {
            particles: Array.from({length: 70}, () => ({
                x: Math.random()*canvas.width, y: -10,
                vx: (Math.random()-0.5)*3, vy: 2+Math.random()*5,
                r: 4+Math.random()*8, life: 1, decay: 0.007+Math.random()*0.01,
                color: ["#72b66f","#4e7c48","#72d987","#c48a42"][Math.floor(Math.random()*4)]
            })),
            bg: (ctx, cv, p) => {
                const g = ctx.createRadialGradient(cv.width/2,0,0,cv.width/2,0,cv.height);
                g.addColorStop(0,`rgba(114,182,111,${p*0.5})`);
                g.addColorStop(1,"rgba(16,23,15,0)");
                ctx.fillStyle=g; ctx.fillRect(0,0,cv.width,cv.height);
            }
        },
        earth: {
            particles: Array.from({length: 55}, () => ({
                x: Math.random()*canvas.width, y: -10,
                vx: (Math.random()-0.5)*5, vy: 3+Math.random()*6,
                r: 5+Math.random()*12, life: 1, decay: 0.009+Math.random()*0.013,
                color: ["#c49b62","#6f5638","#d5a76b","#3b2b1f"][Math.floor(Math.random()*4)]
            })),
            bg: (ctx, cv, p) => {
                ctx.fillStyle=`rgba(196,155,98,${p*0.3})`; ctx.fillRect(0,0,cv.width,cv.height);
            }
        }
    };

    const cfg = configs[elementId] || configs.fire;
    let startTime = null;
    const duration = 2400;

    function frame(ts) {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cfg.bg(ctx, canvas, fadeOut);

        cfg.particles.forEach(p => {
            if (p.life <= 0) return;
            ctx.globalAlpha = p.life * fadeOut;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
            p.x += p.vx; p.y += p.vy; p.life -= p.decay;
            p.vy += 0.06; // gravity
        });
        ctx.globalAlpha = 1;

        if (progress < 1) { requestAnimationFrame(frame); }
        else { ctx.clearRect(0,0,canvas.width,canvas.height); if(onComplete) onComplete(); }
    }
    requestAnimationFrame(frame);
}

// ── Ultimate Win: rainbow fireworks ──────────────────────────────────────────
function triggerUltimateFireworks(canvas, duration = 5000) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    canvas.style.display = "block";

    const fireworks = [];
    const colors = ["#ff4136","#ff851b","#ffdc00","#2ecc40","#0074d9","#b10dc9","#ff69b4","#ffffff"];

    function spawnFirework() {
        const x = 0.15*canvas.width + Math.random()*0.7*canvas.width;
        const y = 0.1*canvas.height + Math.random()*0.5*canvas.height;
        const color = colors[Math.floor(Math.random()*colors.length)];
        const count = 30 + Math.floor(Math.random()*20);
        for (let i = 0; i < count; i++) {
            const a = (i/count)*Math.PI*2, s = 4+Math.random()*8;
            fireworks.push({x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, r:2+Math.random()*3,
                life:1, decay:0.014+Math.random()*0.012, color});
        }
    }

    let startTime = null; let lastSpawn = -999;
    function frame(ts) {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        if (elapsed > duration) { canvas.style.display="none"; ctx.clearRect(0,0,canvas.width,canvas.height); return; }
        if (elapsed - lastSpawn > 400) { spawnFirework(); lastSpawn = elapsed; }

        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        fireworks.forEach(f => {
            if (f.life <= 0) return;
            ctx.globalAlpha = f.life;
            ctx.fillStyle = f.color; ctx.shadowColor = f.color; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
            f.x+=f.vx; f.y+=f.vy; f.vy+=0.1; f.life-=f.decay;
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// ── Dragon Transform: 5-trophy ultimate ending ───────────────────────────────
function triggerDragonTransform(canvas, onComplete) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "block";

    const cx = canvas.width / 2, cy = canvas.height / 2;
    const TOTAL_DURATION = 4200;
    let startTime = null;

    // Rune symbols orbiting the center
    const RUNES = ["☯","✦","⚡","◈","✧","⎊","⟁","✺"];
    const runeCount = 12;
    const runes = Array.from({length: runeCount}, (_, i) => ({
        symbol: RUNES[i % RUNES.length],
        angle: (i / runeCount) * Math.PI * 2,
        orbitR: 140,
        speed: 0.022 + (i % 3) * 0.008
    }));

    // Fire breath particles from dragon mouth
    const flames = Array.from({length: 120}, () => ({
        x: cx + 40, y: cy - 10,
        vx: 4 + Math.random() * 10,
        vy: (Math.random() - 0.5) * 5,
        r: 6 + Math.random() * 12,
        life: 1,
        decay: 0.016 + Math.random() * 0.02,
        color: ["#ff4500","#ff6a00","#ffbd66","#ff2200","#fff200"][Math.floor(Math.random() * 5)]
    }));

    function frame(ts) {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const t = Math.min(elapsed / TOTAL_DURATION, 1);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Phase 1 (0–0.25): dark backdrop fades in
        const bgAlpha = Math.min(t / 0.25, 1) * 0.88;
        ctx.fillStyle = `rgba(5,3,15,${bgAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Phase 1–2 (0–0.45): magic hexagon + runes appear
        if (t < 0.55) {
            const ringAlpha = Math.min(t / 0.3, 1);
            // Outer ring
            ctx.save();
            ctx.globalAlpha = ringAlpha * 0.7;
            ctx.strokeStyle = "#ffd700";
            ctx.shadowColor = "#ffd700";
            ctx.shadowBlur = 24;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 160, 0, Math.PI * 2);
            ctx.stroke();
            // Inner ring
            ctx.strokeStyle = "#ff4500";
            ctx.shadowColor = "#ff4500";
            ctx.beginPath();
            ctx.arc(cx, cy, 110, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Hexagon
            ctx.save();
            ctx.globalAlpha = ringAlpha * 0.5;
            ctx.strokeStyle = "#ce93d8";
            ctx.shadowColor = "#ce93d8";
            ctx.shadowBlur = 16;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + elapsed * 0.001;
                const rx = cx + 160 * Math.cos(a), ry = cy + 160 * Math.sin(a);
                i === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        // Orbiting runes (0.05 – 0.6)
        if (t > 0.05 && t < 0.65) {
            const runeAlpha = Math.min((t - 0.05) / 0.15, 1) * Math.min((0.65 - t) / 0.1, 1);
            runes.forEach(r => {
                r.angle += r.speed;
                const rx = cx + r.orbitR * Math.cos(r.angle);
                const ry = cy + r.orbitR * Math.sin(r.angle);
                ctx.save();
                ctx.globalAlpha = runeAlpha * 0.9;
                ctx.font = "bold 18px Georgia";
                ctx.fillStyle = "#ffd700";
                ctx.shadowColor = "#ff8800";
                ctx.shadowBlur = 14;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(r.symbol, rx, ry);
                ctx.restore();
            });
        }

        // Phase 2 (0.3–0.55): white-gold burst
        if (t >= 0.3 && t < 0.65) {
            const burstProgress = (t - 0.3) / 0.35;
            const burstAlpha = burstProgress < 0.5
                ? burstProgress / 0.5
                : 1 - (burstProgress - 0.5) / 0.5;
            const burstR = 20 + burstProgress * 420;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstR);
            grad.addColorStop(0, `rgba(255,255,220,${burstAlpha * 0.9})`);
            grad.addColorStop(0.3, `rgba(255,200,50,${burstAlpha * 0.5})`);
            grad.addColorStop(0.7, `rgba(255,100,0,${burstAlpha * 0.15})`);
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, burstR, 0, Math.PI * 2);
            ctx.fill();
        }

        // Phase 3 (0.5–1.0): DRAGON appears
        if (t >= 0.5) {
            const dragonProgress = (t - 0.5) / 0.5;
            const scaleVal = dragonProgress < 0.35
                ? 0.1 + (dragonProgress / 0.35) * 1.15
                : dragonProgress < 0.55
                    ? 1.25 - ((dragonProgress - 0.35) / 0.2) * 0.25
                    : 1.0;
            const dragonAlpha = Math.min(dragonProgress / 0.2, 1);

            ctx.save();
            ctx.globalAlpha = dragonAlpha;
            ctx.translate(cx, cy - 30);
            ctx.scale(scaleVal, scaleVal);
            ctx.font = "160px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // Layered glow
            ctx.shadowColor = "#ff4500";
            ctx.shadowBlur = 60 + Math.sin(elapsed * 0.005) * 20;
            ctx.fillText("🐉", 0, 0);
            ctx.shadowColor = "#ffd700";
            ctx.shadowBlur = 30 + Math.sin(elapsed * 0.007) * 10;
            ctx.fillText("🐉", 0, 0);
            ctx.restore();
        }

        // Phase 4 (0.72–1.0): Fire breath particles
        if (t >= 0.72) {
            const fireAlpha = Math.min((t - 0.72) / 0.1, 1) * (t > 0.93 ? (1 - t) / 0.07 : 1);
            flames.forEach(f => {
                if (f.life <= 0) {
                    f.x = cx + 40; f.y = cy - 10;
                    f.vx = 4 + Math.random() * 10;
                    f.vy = (Math.random() - 0.5) * 5;
                    f.life = 0.7 + Math.random() * 0.3;
                }
                ctx.globalAlpha = f.life * fireAlpha;
                ctx.fillStyle = f.color;
                ctx.shadowColor = f.color;
                ctx.shadowBlur = 16;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r * f.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                f.x += f.vx; f.y += f.vy; f.life -= f.decay;
                f.vy += 0.08;
            });
            ctx.globalAlpha = 1;
        }

        // Bottom text "THIÊN LONG GIÁC NGỘ" fade in at t > 0.6
        if (t > 0.6) {
            const textAlpha = Math.min((t - 0.6) / 0.15, 1) * (t > 0.9 ? (1 - t) / 0.1 : 1);
            ctx.save();
            ctx.globalAlpha = textAlpha;
            ctx.font = "bold 28px 'Cinzel', Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffd700";
            ctx.shadowColor = "#ff6600";
            ctx.shadowBlur = 20;
            ctx.fillText("THIÊN LONG GIÁC NGỘ", cx, cy + 140);
            ctx.font = "16px 'Cinzel', Georgia, serif";
            ctx.fillStyle = "#fff3aa";
            ctx.shadowBlur = 10;
            ctx.fillText("Ng\u0169 H\u00e0nh \u0111\u00e3 \u0111\u1ee7. S\u1ee9c m\u1ea1nh c\u1ed5 x\u01b0a th\u1ee9c t\u1ec9nh.", cx, cy + 175);
            ctx.restore();
        }

        if (t < 1) {
            requestAnimationFrame(frame);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = "none";
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(frame);
}
