const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ===== CONFIG =====
const ANNIVERSARY = new Date('2026-04-15T00:00:00');
const MILESTONE = new Date(ANNIVERSARY.getTime() + 100 * 86400000);
const PHOTOS = [
    './assets/IMG_20260501_011509.jpg', './assets/IMG_20260501_105512.jpg',
    './assets/im1.jpg', './assets/im10.jpg', './assets/im11.jpg', './assets/im12.jpg',
    './assets/im13.jpg', './assets/im14.jpg', './assets/im15.jpg', './assets/im16.jpg',
    './assets/im17.jpg', './assets/im18.jpg', './assets/im19.jpg', './assets/im2.jpg',
    './assets/im20.jpg', './assets/im21.jpg', './assets/im22.jpg', './assets/im23.jpg',
    './assets/im24.jpg', './assets/im25.jpg', './assets/im26.jpg', './assets/im28.jpg',
    './assets/im29.jpg', './assets/im3.jpg', './assets/im30.jpg', './assets/im31.jpg',
    './assets/im32.jpg', './assets/im33.jpg', './assets/im34.jpg', './assets/im35.jpg',
    './assets/im36.jpg', './assets/im37.jpg', './assets/im38.jpg', './assets/im39.jpg',
    './assets/im4.jpg', './assets/im40.jpg', './assets/im41.jpg', './assets/im5.jpg',
    './assets/im6.jpg', './assets/im7.jpg', './assets/im8.jpg', './assets/im9.jpg'
];

// ===== INFINITE GALLERY BACKGROUND =====
function InfiniteGallery() {
    const vpRef = useRef(null);
    const rafRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const scrollRef = useRef({ x: 0, y: 0 });
    const [photos, setPhotos] = useState([]);
    const dimsRef = useRef({ w: 840, h: 1000 });


    useEffect(() => {
        const count = PHOTOS.length;
        // Force a block size larger than most screens so we only need a 3x3 grid
        const cols = 10;
        const rows = 7;
        const cellW = 200, cellH = 250, pad = 40;
        const blockW = cols * (cellW + pad);
        const blockH = rows * (cellH + pad);
        dimsRef.current = { w: blockW, h: blockH };

        const baseTiles = [];
        let idx = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                baseTiles.push({
                    src: PHOTOS[idx % count],
                    bx: c * (cellW + pad) + (Math.random() - 0.5) * 20,
                    by: r * (cellH + pad) + (Math.random() - 0.5) * 20,
                    w: cellW + (Math.random() - 0.5) * 40,
                    h: cellH - 40 + (Math.random() - 0.5) * 30,
                    rot: (Math.random() - 0.5) * 24,
                    z: (Math.random() - 0.5) * 60,
                });
                idx++;
            }
        }

        const tiles = [];
        // A 3x3 grid of blocks is enough to cover parallax and smooth resetting
        for (let gy = -1; gy <= 1; gy++) {
            for (let gx = -1; gx <= 1; gx++) {
                baseTiles.forEach((t, i) => {
                    tiles.push({
                        id: `${gy}_${gx}_${i}`,
                        src: t.src,
                        x: gx * blockW + t.bx,
                        y: gy * blockH + t.by,
                        w: t.w,
                        h: t.h,
                        rot: t.rot,
                        z: t.z,
                    });
                });
            }
        }
        setPhotos(tiles);
    }, []);

    useEffect(() => {
        const onMove = (e) => {
            mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const onOrientation = (e) => {
            if (e.gamma != null && e.beta != null) {
                // Map gamma (-30 to 30) and beta (15 to 75, neutral ~45) to -1..1
                const x = Math.max(-1, Math.min(1, e.gamma / 30));
                const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
                mouseRef.current.x = x;
                mouseRef.current.y = y;
            }
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('deviceorientation', onOrientation);

        const animate = () => {
            scrollRef.current.x -= 0.7;
            scrollRef.current.y -= 0.5;

            const { w, h } = dimsRef.current;
            if (scrollRef.current.x <= -w) scrollRef.current.x += w;
            if (scrollRef.current.y <= -h) scrollRef.current.y += h;

            const mx = mouseRef.current.x * 30;
            const my = mouseRef.current.y * 20;
            const rx = mouseRef.current.y * 3;
            const ry = -mouseRef.current.x * 3;

            if (vpRef.current) {
                vpRef.current.style.transform =
                    `translate3d(${scrollRef.current.x + mx}px, ${scrollRef.current.y + my}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
            }
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('deviceorientation', onOrientation);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div className="gallery-bg">
            <div className="gallery-viewport" ref={vpRef}>
                {photos.map(p => (
                    <div key={p.id} className="gallery-photo" style={{
                        left: p.x, top: p.y, width: p.w,
                        transform: `rotate(${p.rot}deg) translateZ(${p.z}px)`,
                    }}>
                        <img src={p.src} alt="" loading="lazy" style={{ height: p.h }} />
                    </div>
                ))}
            </div>
            <div className="gallery-overlay" />
        </div>
    );
}

// ===== LOADER =====
function Loader({ onEnter }) {
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hiding, setHiding] = useState(false);

    useEffect(() => {
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p >= 100) {
                p = 100;
                setReady(true);
                clearInterval(interval);
            }
            setProgress(p);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const handleEnter = () => {
        setHiding(true);
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }
        setTimeout(onEnter, 800); // Wait for CSS transition
    };

    return (
        <div id="loader" className={hiding ? 'hidden' : ''}>
            {!ready ? (
                <>
                    <div className="loader-heart">💖</div>
                    <div className="loader-text">Loading our love story...</div>
                    <div className="loader-bar"><div className="loader-fill" style={{ width: `${progress}%` }} /></div>
                </>
            ) : (
                <button className="enter-ring" onClick={handleEnter}>
                    <div className="ring-pulse"></div>
                    <span>ENTER</span>
                </button>
            )}
        </div>
    );
}

// ===== SCROLL HOOK =====
function useReveal(threshold = 0.15) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, vis];
}

// ===== HERO PARTICLES =====
function HeroParticles() {
    const particles = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            dur: Math.random() * 5 + 3,
            del: Math.random() * 5
        }));
    }, []);

    return (
        <div className="hero-particles">
            {particles.map(p => (
                <div key={p.id} className="hero-particle" style={{
                    left: `${p.x}%`, top: `${p.y}%`,
                    width: p.size, height: p.size,
                    animationDuration: `${p.dur}s`,
                    animationDelay: `${p.del}s`
                }} />
            ))}
        </div>
    );
}

// ===== HERO =====
function Hero({ scrollOpacity = 1 }) {
    const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
    useEffect(() => {
        const tick = () => {
            const diff = Date.now() - ANNIVERSARY.getTime();
            if (diff > 0) setCd({
                d: Math.floor(diff / 864e5),
                h: Math.floor((diff % 864e5) / 36e5),
                m: Math.floor((diff % 36e5) / 6e4),
                s: Math.floor((diff % 6e4) / 1e3),
            });
        };
        tick(); const i = setInterval(tick, 1000);
        return () => clearInterval(i);
    }, []);

    return (
        <section className="section hero" id="hero" style={{ padding: 0 }}>
            <HeroParticles />
            {/* Background Text */}
            <div className="hero-bg-text-split">
                <span className="hero-bg-left">ADE</span>
                <span className="hero-bg-right">EBA</span>
            </div>

            {/* Top Subtitle */}
            <div className="hero-subtitle-top">
                ONE AND ONLY MIGHTY
            </div>

            {/* Center Image */}
            <div className="hero-image-wrap">
                <img src="./photos/adeeba.png" alt="Adeeba" className="hero-image" />
                <div className="hero-image-fade" />
            </div>

            {/* Bottom Left Corner: Small Words & Butterfly */}
            <div className="hero-bottom-left">
                <span className="hero-red-dot">💕</span>
                <p>For My Dear</p>
                <p className="hero-sub-text">Konjolu</p>
            </div>

            {/* Bottom Right Corner: Countdown */}
            <div className="hero-bottom-right">
                <div className="corner-countdown">
                    {[['d', 'Days'], ['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([k, l]) => (
                        <div key={k} className="cc-item">
                            <span className="cc-num">{String(cd[k]).padStart(2, '0')}</span>
                            <span className="cc-label">{l}</span>
                        </div>
                    ))}
                </div>
                <button className="pill-btn" onClick={() => document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' })}>
                    OUR STORY <span className="arrow">&rarr;</span>
                </button>
            </div>

            {/* Scroll Indicator */}
            <div className="scroll-indicator" style={{ opacity: scrollOpacity }}>
                <div className="scroll-line"></div>
                <span>SCROLL</span>
            </div>
        </section>
    );
}

// ===== TIMELINE =====
const MILESTONES = [
    { emoji: '🏕️', step: 'Step 1', title: 'Go Somewhere You Absolutely Hate', text: 'Get forced into a 7-day camp in a desert-like factory area. Spot a girl acting all innocent in a white and violet salwar. Warning: Do not fall for the calm aesthetic.', img: './photos/img34.jpg' },
    { emoji: '🛍️', step: 'Step 2', title: 'Get Completely Ignored and Ditched', text: 'Notice she barely even acknowledges your existence—this is a perfect sign! Endure a traumatic mall trip where her gang completely ditches you. After a painfully silent goodbye at the railway station, make your ultimate mistake: sending that very first random text.', img: './photos/her.jpg' },
    { emoji: '✌️', step: 'Step 3', title: 'Sacrifice Your Sleep Schedule', text: 'Allow her to invade your phone. Stay up until 2 AM listening to endless, non-stop yapping about Korean dramas, her imaginary dream guys, and absolutely nothing at all. Your peace is now officially gone.', img: './photos/img54.jpg' },
    { emoji: '🤡', step: 'Step 4', title: 'Experience Morning Amnesia', text: 'Have a highly mature, logical "breakup" at 1 AM because of hurdles and "no hope." Wake up the very next morning to her calling and saying, "Happy 1-Month Anniversary!" like nothing happened. You are now officially trapped.', img: './photos/img53.jpeg' },
];

function TimelineItem({ m, i }) {
    const [ref, vis] = useReveal(0.2);
    return (
        <div ref={ref} className={`tl-item${vis ? ' vis' : ''}`} style={{ transitionDelay: `${i * 0.12}s` }}>
            <div className="tl-card glass">
                <div className="tl-img"><img src={m.img} alt={m.title} /></div>
                <div className="tl-info">
                    <div className="tl-date" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))', lineHeight: '1' }}>{m.emoji}</span>
                        <span>{m.step}</span>
                    </div>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                </div>
            </div>
        </div>
    );
}

function Timeline() {
    const [ref, vis] = useReveal();
    return (
        <section className="section" id="timeline">
            <div className="section-inner">
                <div ref={ref} className={`reveal${vis ? ' vis' : ''}`}>
                    <div className="section-badge">📖 How to Find a "Useless" Person</div>
                    <h2 className="section-title">Our Story Timeline</h2>
                    <p className="section-sub">A highly unrecommended 4-step procedure to ruin your peace of mind.</p>
                </div>
                <div className="tl-wrap" style={{ marginTop: 40 }}>
                    {MILESTONES.map((m, i) => <TimelineItem key={i} m={m} i={i} />)}
                </div>
            </div>
        </section>
    );
}

// ===== LOVE LETTERS =====
const LETTERS = [
    { emoji: '🌸', text: "You make my heart skip a beat every time you text... mostly because I immediately assume we are about to start another argument. I didn't know someone could be this consistently annoying and still stick around.", from: '— With all my remaining tolerance 💗' },
    { emoji: '🌙', text: "Every night before I sleep, my last thought is always, \"Please don't let her start another random midnight argument over nothing.\" Your endless voice notes are basically my daily alarm clock of chaos and my favorite migraine.", from: '— Still surviving you 💫' },
    { emoji: '☀️', text: "Waking up knowing I have to deal with your daily mood swings makes every morning an absolute survival mission. You are my daily headache and my reason to sigh very loudly.", from: "— Your favorite punching bag ☀️" },
    { emoji: '🦋', text: "I promise to never be your safe place, to always make fun of your Korean dramas, and to be the one who never, ever stops calling you a buffalo.", from: '— Yours unfortunately 🦋' },
    { emoji: '💎', text: "Some people search their whole lives for peace and quiet. I found a highly demanding, \"useless\" person at an NSS camp instead. I'm still trying to figure out what I did to the universe to deserve this kind of karma.", from: '— Officially trapped 💎' },
];

function LoveLetters() {
    const [ref, vis] = useReveal();
    return (
        <section className="section" id="letters">
            <div className="section-inner">
                <div ref={ref} className={`reveal${vis ? ' vis' : ''}`} style={{ textAlign: 'center' }}>
                    <div className="section-badge">💌 "Hate" Notes</div>
                    <h2 className="section-title">Complaints From My Heart</h2>
                    <p className="section-sub" style={{ margin: '0 auto 28px' }}>Words I wish I could scream every second</p>
                </div>
                <div className="letters-row">
                    {LETTERS.map((l, i) => (
                        <div key={i} className="l-card glass">
                            <span className="l-emoji" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3.4rem',
                                marginBottom: '16px',
                                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.18))',
                                width: 'auto',
                                height: 'auto'
                            }}>
                                {l.emoji}
                            </span>
                            <p className="l-text">{l.text}</p>
                            <span className="l-from">{l.from}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ===== REASONS =====
const REASONS = [
    { icon: '🤡', title: 'Your "Peratta Mondha"', text: "The way you smile right before you start an absolutely baseless argument is truly terrifying, but somehow I'm used to it." },
    { icon: '📢', title: 'Your Voice', text: "Whether you are actually singing Mappila songs or faking a \"throat problem\" just to show off your *jaada*, your voice is my favorite daily noise pollution." },
    { icon: '🌋', title: 'Your "Warmth"', text: 'By warmth, I mean your pure, unadulterated anger. The way you effortlessly pick fights over literally nothing is a rare, terrifying talent.' },
    { icon: '📉', title: 'Your Flawed Logic', text: 'The way your brain calculates highly mature 1 AM breakups and then completely forgets them by morning is an absolute medical mystery that inspires me every day.' },
    { icon: '📱', title: 'Your Thumb Stamina', text: "You handle a 24/7 Instagram reel-spamming schedule with such grace. You have stronger thumbs to scroll and ignore my messages than anyone I know." },
    { icon: '🦬', title: "You're Just... You", text: "You don't try to be anyone else, mostly because no one else could possibly be this much of a \"buffalo.\" And somehow, I'm still stuck here." },
];

function ReasonCard({ r, i }) {
    const [ref, vis] = useReveal(0.2);
    return (
        <div ref={ref} className={`r-card glass${vis ? ' vis' : ''}`} style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="r-icon" style={{
                fontSize: '3.6rem',
                width: 'auto',
                height: 'auto',
                background: 'none',
                border: 'none',
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.18))',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {r.icon}
            </div>
            <h3>{r.title}</h3>
            <p>{r.text}</p>
        </div>
    );
}

function Reasons() {
    const [ref, vis] = useReveal();
    return (
        <section className="section" id="reasons">
            <div className="section-inner">
                <div ref={ref} className={`reveal${vis ? ' vis' : ''}`} style={{ textAlign: 'center' }}>
                    <div className="section-badge">🙄 Reasons</div>
                    <h2 className="section-title">Why I Tolerate You</h2>
                    <p className="section-sub" style={{ margin: '0 auto 36px' }}>A million headaches, and counting...</p>
                </div>
                <div className="reasons-grid">{REASONS.map((r, i) => <ReasonCard key={i} r={r} i={i} />)}</div>
            </div>
        </section>
    );
}

// ===== LOVE METER =====
function LoveMeter() {
    const [ref, vis] = useReveal(0.3);
    const [pct, setPct] = useState(0);
    const [stats, setStats] = useState([0, 0, 0, 0]);

    const daysSince = useMemo(() => {
        return Math.floor((Date.now() - ANNIVERSARY.getTime()) / 864e5);
    }, []);

    const targets = useMemo(() => [daysSince, 720, 999, 1000000], [daysSince]);

    const statsData = [
        { label: 'Days', desc: 'Of me successfully surviving your absolute nonsense.' },
        { label: 'Hours', desc: 'Of getting left on "Like" when I actually want a reply.' },
        { label: 'Arguments', desc: 'Over completely illogical things, ending in fake breakups.' },
        { label: 'Random Texts', desc: "Sent at 2 AM about absolute nonsense while I am literally just trying to sleep." }
    ];

    useEffect(() => {
        if (!vis) return;
        const dur = 2000;
        const start = performance.now();
        const step = (now) => {
            const t = Math.min((now - start) / dur, 1);
            const e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            setPct(Math.round(e * 100));
            setStats(targets.map(tgt => Math.round(e * tgt)));
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [vis, targets]);

    const fmt = (v) => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? v.toLocaleString() : v;

    return (
        <section className="section" id="lovemeter">
            <div className="section-inner">
                <div ref={ref} className={`meter-wrap reveal${vis ? ' vis' : ''}`}>
                    <div className="section-badge">📉 Tolerance Status 🙄</div>
                    <div className="meter-heart">❤️</div>
                    <h2 className="section-title" style={{ textAlign: 'center' }}>The Useless Meter</h2>
                    <div className="meter-bar glass"><div className="meter-fill" style={{ width: pct + '%' }} /></div>
                    <div className="meter-pct">{pct}%</div>
                    <p className="meter-label">Overflowing with jaada and mood swings since day one</p>
                    <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                        {stats.map((s, i) => (
                            <div key={i} className="stat glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px', minWidth: '0' }}>
                                <span className="stat-n">{fmt(s)}</span>
                                <span className="stat-l" style={{ fontWeight: 'bold', color: 'var(--pink-l)' }}>{statsData[i].label}</span>
                                <span className="stat-d" style={{ fontSize: '0.8rem', color: 'var(--dim)', marginTop: '8px', lineHeight: '1.4' }}>{statsData[i].desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}


// ===== AUDIO CONFIG =====
const MUSIC_PLAYER_PLAYLIST = [
    './songs/s1.opus',
    './songs/s2.opus',
    './songs/s3.opus',
    './songs/s4.opus',
    './songs/s5.opus',
    './songs/s6.opus',
    './songs/s7.opus',
    './songs/s8.ogg',
    './songs/s9.m4a'
];
const GLOBAL_AUDIO_PLAYLIST = [
    './musics/song1.mp3',
    './musics/song2.mp3',
    './musics/song3.mp3'
];

// ===== MUSIC =====
function MusicPlayer() {
    const [ref, vis] = useReveal();
    const [playing, setPlaying] = useState(false);
    const [trackIdx, setTrackIdx] = useState(() => Math.floor(Math.random() * MUSIC_PLAYER_PLAYLIST.length));
    const audioRef = useRef(null);

    useEffect(() => {
        let raf;
        const anim = () => {
            const el = document.getElementById('viz');
            if (el) {
                const bars = el.children;
                for (let i = 0; i < bars.length; i++) {
                    const h = 5 + Math.random() * 28 * (0.5 + 0.5 * Math.sin(Date.now() * .003 + i * .5));
                    bars[i].style.height = h + 'px';
                }
            }
            raf = requestAnimationFrame(anim);
        };
        raf = requestAnimationFrame(anim);
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(MUSIC_PLAYER_PLAYLIST[trackIdx]);
            audioRef.current.loop = true;
        } else {
            audioRef.current.src = MUSIC_PLAYER_PLAYLIST[trackIdx];
            if (playing) audioRef.current.play().catch(() => { });
        }
    }, [trackIdx]);

    const toggle = () => {
        if (playing) {
            audioRef.current.pause();
            window.dispatchEvent(new Event('resume-global-audio'));
        } else {
            window.dispatchEvent(new Event('stop-global-audio'));
            audioRef.current.play().catch(() => { });
        }
        setPlaying(!playing);
    };

    const nextTrack = () => {
        setTrackIdx((prev) => (prev + 1) % MUSIC_PLAYER_PLAYLIST.length);
        if (!playing) window.dispatchEvent(new Event('stop-global-audio'));
        setPlaying(true);
    };

    const prevTrack = () => {
        setTrackIdx((prev) => (prev - 1 + MUSIC_PLAYER_PLAYLIST.length) % MUSIC_PLAYER_PLAYLIST.length);
        if (!playing) window.dispatchEvent(new Event('stop-global-audio'));
        setPlaying(true);
    };

    return (
        <section className="section" id="music">
            <div className="section-inner">
                <div ref={ref} className={`reveal${vis ? ' vis' : ''}`} style={{ textAlign: 'center' }}>
                    <div className="section-badge">🎵 Our Song</div>
                    <h2 className="section-title">The Soundtrack of Us</h2>
                    <p className="section-sub" style={{ margin: '0 auto 36px' }}>every avarathm story has a sound</p>
                </div>
                <div className="player glass">
                    <div className={`player-art${playing ? ' spin' : ''}`}><img src="./photos/img34.jpg" alt="" /></div>
                    <h3 className="p-title">My Love Song</h3>
                    <p className="p-artist">kunjoolu</p>
                    <div className="viz" id="viz">
                        {Array.from({ length: 28 }).map((_, i) => <div key={i} className="vbar" />)}
                    </div>
                    <div className="play-controls">
                        <button className="skip-btn" onClick={prevTrack}>⏮</button>
                        <button className="play-btn" onClick={toggle}>{playing ? '⏸' : '▶'}</button>
                        <button className="skip-btn" onClick={nextTrack}>⏭</button>
                    </div>
                    <div className="progress"><div className="progress-fill" /></div>
                </div>
            </div>
        </section>
    );
}

// ===== CASTLE PORTAL =====
const CASTLE_SPARKLES = [
    { top: '8%', left: '7%', size: '1.1rem', delay: '0s' },
    { top: '14%', right: '9%', size: '0.9rem', delay: '1.2s' },
    { top: '28%', left: '3%', size: '0.75rem', delay: '0.9s' },
    { top: '38%', right: '5%', size: '0.85rem', delay: '0.3s' },
    { top: '55%', left: '5%', size: '0.8rem', delay: '1.6s' },
    { top: '62%', right: '7%', size: '1rem', delay: '0.6s' },
    { top: '74%', left: '11%', size: '0.7rem', delay: '2.1s' },
    { top: '80%', right: '12%', size: '0.9rem', delay: '0.15s' },
    { top: '22%', left: '20%', size: '0.65rem', delay: '1.8s' },
    { top: '82%', right: '20%', size: '0.7rem', delay: '0.75s' },
];

function CastlePortal() {
    const [ref, vis] = useReveal(0.15);
    const [ref2, vis2] = useReveal(0.2);
    const [ref3, vis3] = useReveal(0.2);

    const handleExplore = () => {
        window.open('https://sadathali26.github.io/confidential/castle.html', '_blank');
    };

    return (
        <section className="section" id="castle" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* ✦ Stars — always stay while on this page */}
            {CASTLE_SPARKLES.map((s, i) => (
                <span key={i} className="castle-sparkle" style={{
                    position: 'absolute',
                    top: s.top, left: s.left, right: s.right,
                    fontSize: s.size,
                    animationDelay: s.delay,
                    pointerEvents: 'none',
                }} >✦</span>
            ))}

            {/* Ambient orbs */}
            <div className="castle-orb castle-orb-1" />
            <div className="castle-orb castle-orb-2" />

            <div className="section-inner">

                {/* Header — same pattern as all other sections */}
                <div ref={ref} className={`reveal${vis ? ' vis' : ''}`} style={{ textAlign: 'center' }}>
                    <div className="section-badge">👑 A Royal Surprise</div>
                    <h2 className="section-title">Her Kingdom Awaits</h2>
                    <p className="section-sub" style={{ margin: '0 auto 48px' }}>Every queen deserves her castle. Yours is ready.</p>
                </div>

                {/* Castle Image + tagline — centered open layout */}
                <div ref={ref2} className={`reveal${vis2 ? ' vis' : ''}`} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>

                    <div className="castle-image-wrap">
                        <img src="./photos/castle.png" alt="Castle" className="castle-image" />
                    </div>

                    <div className="castle-divider" style={{ maxWidth: '280px', marginTop: '-20px', position: 'relative', zIndex: 4 }}>
                        <div className="castle-divider-line" />
                        <span className="castle-divider-gem">◆</span>
                        <div className="castle-divider-line" />
                    </div>

                    <p className="castle-tagline" style={{ marginTop: '8px' }}>
                        "Built from a million pixels,<br />dedicated to the one who rules my chaos."
                    </p>
                </div>

                {/* Button area — glass card like the music player */}
                <div ref={ref3} className={`reveal${vis3 ? ' vis' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                    <button className="castle-portal-btn" onClick={handleExplore}>
                        <div className="castle-portal-btn-glow" />
                        <span className="cpb-icon">🚪</span>
                        <span className="cpb-text">Welcome to Castle</span>
                    </button>
                    <p className="castle-hint">Her royal kingdom, built just for her 👑</p>
                </div>

            </div>
        </section>
    );
}


// ===== WISHES =====
function Wishes() {
    const [ref, vis] = useReveal();
    const [note, setNote] = useState('');
    const [sent, setSent] = useState(false);
    const [showFinale, setShowFinale] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async () => {
        if (!note.trim() || isSubmitting) return;
        setIsSubmitting(true);

        try {
            const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6CfJpV4jhdN-TS2a4_yDkF5Seb9CzI48KnWjjnhnRcuv4zieeKdsJFvkI4fLRWMY1/exec";

            const formData = new URLSearchParams();
            formData.append("message", note);

            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body: formData,
                mode: 'no-cors'
            });

            setSent(true);
            setNote('');
            fireConfetti();
            setTimeout(() => setShowFinale(true), 800);
            setTimeout(() => setSent(false), 3000);
        } catch (error) {
            console.error("Failed to send:", error);
            alert("Oops, couldn't send the roast right now!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <section className="section" id="wishes">
                <div className="section-inner">
                    <div ref={ref} className={`wishes-wrap reveal${vis ? ' vis' : ''}`}>
                        <div className="section-badge">😈 Roast Session</div>
                        <h2 className="section-title">The Complaint Box</h2>
                        <p className="section-sub" style={{ margin: '0 auto' }}>Korch Cringe aaayi thonnindlleee...</p>

                        <h3 style={{ fontFamily: "'Dancing Script',cursive", fontSize: '1.4rem', color: 'var(--pink-l)', marginBottom: 16, marginTop: 32 }}>Drop Your Complaints Here 🙄</h3>
                        <div>
                            <textarea className="wish-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Write your complaints, teasing, or roasts here..." disabled={isSubmitting} />
                            <br />
                            <button className="wish-btn" onClick={submit} disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : (sent ? '🔥 Roasted!' : 'Send')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <div className={`finale${showFinale ? ' on' : ''}`}>
                <div className="finale-img"><img src="./photos/img53.jpeg" alt="" /></div>
                <h2 className="finale-title" style={{ marginTop: 28 }}>Message Received!</h2>
                <p className="finale-sub">I guess I'll read your complaints... 💕</p>
                <button
                    onClick={() => setShowFinale(false)}
                    style={{
                        marginTop: 32,
                        padding: '12px 36px',
                        borderRadius: 50,
                        background: 'linear-gradient(135deg, rgba(255,77,109,0.15), rgba(201,24,74,0.05))',
                        border: '1px solid rgba(255,77,109,0.4)',
                        color: '#FF8FA3',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(12px)',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontFamily: "'Poppins', sans-serif"
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,77,109,0.35), rgba(201,24,74,0.25))';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 16px 40px rgba(255,77,109,0.3)';
                        e.currentTarget.style.borderColor = 'rgba(255,77,109,0.8)';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,77,109,0.15), rgba(201,24,74,0.05))';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                        e.currentTarget.style.borderColor = 'rgba(255,77,109,0.4)';
                        e.currentTarget.style.color = '#FF8FA3';
                    }}
                >
                    💖 Close
                </button>
            </div>
        </>
    );
}

// ===== CONFETTI =====
function fireConfetti() {
    const c = document.getElementById('confetti');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const COLORS = ['#FF4D6D', '#FF8FA3', '#FFD700', '#FFAB91', '#FF6B6B', '#fff', '#FFC0CB'];
    const P = [];
    for (let i = 0; i < 120; i++) P.push({
        x: c.width / 2 + (Math.random() - .5) * 200, y: c.height / 2,
        vx: (Math.random() - .5) * 14, vy: -(Math.random() * 12 + 4),
        w: Math.random() * 8 + 3, h: Math.random() * 5 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * 360, rs: (Math.random() - .5) * 10,
        g: .25 + Math.random() * .12, o: 1,
    });
    let f = 0;
    const draw = () => {
        ctx.clearRect(0, 0, c.width, c.height);
        let alive = false;
        P.forEach(p => {
            p.x += p.vx; p.vy += p.g; p.y += p.vy; p.vx *= .99; p.rot += p.rs; p.o = Math.max(0, p.o - .005);
            if (p.o > 0 && p.y < c.height + 50) { alive = true; ctx.save(); ctx.globalAlpha = p.o; ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore() }
        });
        f++;
        if (alive && f < 250) requestAnimationFrame(draw); else ctx.clearRect(0, 0, c.width, c.height);
    };
    draw();
}

// ===== NAV =====
function NavDots() {
    const ids = ['hero', 'timeline', 'letters', 'reasons', 'lovemeter', 'music', 'castle', 'friendship', 'confessions', 'wishes'];
    const [active, setActive] = useState('hero');

    useEffect(() => {
        const secs = ids.map(id => document.getElementById(id)).filter(Boolean);
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
        }, { threshold: 0.35 });
        secs.forEach(s => obs.observe(s));
        return () => obs.disconnect();
    }, []);

    return (
        <nav className="nav-dots">
            {ids.map(id => (
                <div key={id} className={`ndot${active === id ? ' on' : ''}`}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} />
            ))}
        </nav>
    );
}

// ===== GLOBAL AUDIO =====
function GlobalAudio({ triggerPlay }) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);
    const wasPlayingRef = useRef(false);
    const currentTrackIndexRef = useRef(0);
    const clickTimeoutRef = useRef(null);
    const clickCountRef = useRef(0);

    const getRandomTrackIndex = (excludeIdx) => {
        if (GLOBAL_AUDIO_PLAYLIST.length <= 1) return 0;
        let nextIdx;
        do {
            nextIdx = Math.floor(Math.random() * GLOBAL_AUDIO_PLAYLIST.length);
        } while (nextIdx === excludeIdx);
        return nextIdx;
    };

    const playTrack = (idx) => {
        if (!audioRef.current) return;
        currentTrackIndexRef.current = idx;
        audioRef.current.src = GLOBAL_AUDIO_PLAYLIST[idx];
        audioRef.current.load();
        if (playing || triggerPlay) {
            audioRef.current.play().catch(e => console.log("Playback error:", e));
        }
    };

    useEffect(() => {
        if (!audioRef.current) {
            const startIdx = Math.floor(Math.random() * GLOBAL_AUDIO_PLAYLIST.length);
            currentTrackIndexRef.current = startIdx;
            audioRef.current = new Audio(GLOBAL_AUDIO_PLAYLIST[startIdx]);
            audioRef.current.loop = false;
        }

        const handleEnded = () => {
            const nextIdx = getRandomTrackIndex(currentTrackIndexRef.current);
            playTrack(nextIdx);
            setPlaying(true);
        };

        audioRef.current.addEventListener('ended', handleEnded);
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleEnded);
            }
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (triggerPlay && !playing && !wasPlayingRef.current) {
            setPlaying(true);
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
            }
        }
    }, [triggerPlay]);

    useEffect(() => {
        const handleStopGlobal = () => {
            if (playing && audioRef.current) {
                wasPlayingRef.current = true;
                audioRef.current.pause();
                setPlaying(false);
            }
        };

        const handleResumeGlobal = () => {
            if (wasPlayingRef.current && audioRef.current) {
                audioRef.current.play().catch(() => { });
                setPlaying(true);
                wasPlayingRef.current = false;
            }
        };

        window.addEventListener('stop-global-audio', handleStopGlobal);
        window.addEventListener('resume-global-audio', handleResumeGlobal);
        return () => {
            window.removeEventListener('stop-global-audio', handleStopGlobal);
            window.removeEventListener('resume-global-audio', handleResumeGlobal);
        };
    }, [playing]);

    const handleIconClick = (e) => {
        e.stopPropagation();
        clickCountRef.current += 1;

        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }

        clickTimeoutRef.current = setTimeout(() => {
            const count = clickCountRef.current;
            clickCountRef.current = 0;
            clickTimeoutRef.current = null;

            if (count === 1) {
                // Single Click: Toggle Play/Pause
                if (playing) {
                    wasPlayingRef.current = false;
                    audioRef.current.pause();
                    setPlaying(false);
                } else {
                    wasPlayingRef.current = false;
                    audioRef.current.play().catch(() => { });
                    setPlaying(true);
                }
            } else if (count === 2) {
                // Double Click: Skip to Next Music
                const nextIdx = (currentTrackIndexRef.current + 1) % GLOBAL_AUDIO_PLAYLIST.length;
                playTrack(nextIdx);
                setPlaying(true);
            } else if (count >= 3) {
                // Triple Click: Skip to Previous Music
                const prevIdx = (currentTrackIndexRef.current - 1 + GLOBAL_AUDIO_PLAYLIST.length) % GLOBAL_AUDIO_PLAYLIST.length;
                playTrack(prevIdx);
                setPlaying(true);
            }
        }, 250);
    };

    return (
        <div className={`global-audio-icon ${playing ? 'playing' : ''}`} onClick={handleIconClick} title="Play/Pause Background Music">
            <div className="audio-bars">
                <span className="abar"></span>
                <span className="abar"></span>
                <span className="abar"></span>
            </div>
            <div className="audio-note" style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--pink-l)' }}>
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            </div>
        </div>
    );
}

// ===== FULL SCREEN BUTTON =====
function FullScreenButton() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => { });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => { });
            }
        }
    };

    if (isFullscreen) return null;

    return (
        <div className="fullscreen-icon" onClick={toggleFullScreen} title="Toggle Fullscreen">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--pink-l)' }}>
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
        </div>
    );
}

// ===== FRIENDSHIP LETTER =====
function FriendshipLetter() {
    const [ref, vis] = useReveal(0.12);
    const [phase, setPhase] = useState('closed'); // 'closed' | 'opening' | 'open'
    const [particles, setParticles] = useState([]);
    const sealRef = useRef(null);

    const handleOpen = () => {
        if (phase !== 'closed') return;

        // Spawn particle burst from seal center
        const sealEl = sealRef.current;
        const rect = sealEl ? sealEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;

        const emojis = ['💖', '💝', '🌸', '✨', '💕', '💌', '🌺', '⭐', '💗', '🎀'];
        const newParticles = Array.from({ length: 18 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.6;
            const dist = 120 + Math.random() * 180;
            return {
                id: Date.now() + i,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                x: originX,
                y: originY,
                tx: Math.cos(angle) * dist,
                ty: Math.sin(angle) * dist - 60,
                rot: (Math.random() - 0.5) * 360,
                dur: 1.8 + Math.random() * 1.0,
                delay: Math.random() * 0.25,
            };
        });
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 3500);

        // Phase 1: start opening (flap rotates, seal cracks)
        setPhase('opening');
        // Phase 2: letter slides up
        setTimeout(() => setPhase('open'), 850);
    };

    const handleClose = () => {
        setPhase('closed');
    };

    return (
        <section className="section" id="friendship" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Ambient glows */}
            <div style={{ position: 'absolute', top: '10%', right: '3%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,143,163,0.07) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(50px)' }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '3%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(50px)' }} />

            {/* Particle burst — rendered at fixed viewport position */}
            {particles.map(p => (
                <div key={p.id} className="fl-particle" style={{
                    left: p.x, top: p.y,
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                    '--rot': `${p.rot}deg`,
                    '--dur': `${p.dur}s`,
                    '--delay': `${p.delay}s`,
                }}>
                    {p.emoji}
                </div>
            ))}

            <div className="section-inner">
                {/* Section header */}
                <div ref={ref} className={`reveal${vis ? ' vis' : ''}`} style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div className="section-badge">💝 A Heartfelt Message</div>
                    <h2 className="section-title">Friendship &amp; Forgiveness</h2>
                    <p className="section-sub" style={{ margin: '0 auto' }}>
                        A sincere note for all the beautiful moments and the headaches.
                    </p>
                </div>

                <div className="fl-scene">
                    <div className="fl-root">

                        {/* ── THE 3D ENVELOPE ── */}
                        {phase !== 'open' && (
                            <div className="fl-envelope" onClick={handleOpen}>

                                {/* Layers */}
                                <div className="fl-env-back" />
                                <div className="fl-env-left" />
                                <div className="fl-env-right" />
                                <div className="fl-env-pocket" />

                                {/* Top flap — rotates open */}
                                <div className={`fl-env-flap${phase === 'opening' ? ' open' : ''}`}>
                                    <div className="fl-env-flap-face" />
                                    <div className="fl-env-flap-back" />
                                </div>

                                {/* Postage stamp */}
                                <div className="fl-stamp">💌</div>

                                {/* Wax seal — cracks on open */}
                                <div ref={sealRef} className={`fl-seal${phase === 'opening' ? ' cracked' : ''}`}>
                                    🌹
                                </div>

                                {/* Decorative address lines */}
                                <div className="fl-address">
                                    To: My Dear Konjolu ✦<br />
                                    From: Sadath, with love 💕
                                </div>

                                {/* Bottom prompt */}
                                {phase === 'closed' && (
                                    <div className="fl-env-prompt">
                                        ✦ Tap the seal to open ✦
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── PARCHMENT PAPER ── */}
                        {phase === 'open' && (
                            <div className="fl-paper-scene">
                                <div className="fl-paper">
                                    {/* Corner ornaments */}
                                    <span className="fl-corner fl-corner-tl">❧</span>
                                    <span className="fl-corner fl-corner-tr">❧</span>
                                    <span className="fl-corner fl-corner-bl">❧</span>
                                    <span className="fl-corner fl-corner-br">❧</span>

                                    <div className="fl-letter-greeting">My Dear Buffalo / Konjolu,</div>

                                    <div className="fl-divider" />

                                    <p className="fl-letter-para fl-para-1">
                                        I know I can be an absolute nightmare. Between my stubbornness, our midnight arguments over completely illogical things, and the countless times I've tested your infinite (or very limited) patience, I know I am a handful.
                                    </p>
                                    <p className="fl-letter-para fl-para-2">
                                        I want to say a real, heartfelt sorry. Sorry for all the headaches I cause, for the silly fights we fall into, and for every time I've made you sigh in frustration. Behind all the teasing, the daily bickering, and the constant banter, you are the most precious part of my life.
                                    </p>
                                    <p className="fl-letter-para fl-para-3">
                                        Our friendship and this beautiful bond we share are the anchoring force in all my chaos. Thank you for never giving up on me, even when I am at my absolute worst. I promise to hold onto us, to cherish every laugh, and to love you even through our loudest arguments.
                                    </p>

                                    <div className="fl-letter-sig fl-sig">
                                        With love &amp; apologies,<br />
                                        Sadath 💕
                                    </div>

                                    <button className="fl-close-btn" onClick={handleClose}>
                                        ✉️ Fold Back
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
}

// ===== CONFESSIONS PORTAL =====
function ConfessionsPortal() {
    const [ref, vis] = useReveal(0.15);
    const [ref2, vis2] = useReveal(0.2);

    useEffect(() => {
        const handlePageShow = () => {
            document.body.style.transition = 'none';
            document.body.style.transform = 'scale(1)';
            document.body.style.opacity = '1';
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    const handleOpenMessages = () => {
        document.body.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s';
        document.body.style.transform = 'scale(1.2)';
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = 'msg.html';
        }, 400);
    };

    return (
        <section className="section" id="confessions" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* Ambient glow orbs */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,109,0.12) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,171,145,0.10) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />

            {/* Breathing particles */}
            {['💌', '💗', '✨', '💞', '🌙', '💖'].map((em, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    fontSize: `${1 + (i % 3) * 0.4}rem`,
                    top: `${10 + i * 14}%`,
                    left: i % 2 === 0 ? `${4 + i * 3}%` : 'auto',
                    right: i % 2 !== 0 ? `${4 + i * 3}%` : 'auto',
                    animation: `particle-breathe ${4 + i * 1.2}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.3}s`,
                    pointerEvents: 'none', userSelect: 'none',
                }} aria-hidden="true">{em}</div>
            ))}

            <div className="section-inner" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>

                {/* HEADER */}
                <div ref={ref} className={`reveal${vis ? ' vis' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'linear-gradient(135deg, rgba(255,77,109,0.15), rgba(255,171,145,0.08))',
                        border: '1px solid rgba(255,77,109,0.3)', borderRadius: '100px', padding: '8px 20px',
                        fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em',
                        textTransform: 'uppercase', color: '#FF8FA3',
                        backdropFilter: 'blur(10px)', boxShadow: '0 0 20px rgba(255,77,109,0.1)',
                    }}>
                        <span>💌</span> Secret Archives
                    </div>
                    <h2 style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 800,
                        lineHeight: 1.05, letterSpacing: '-0.03em',
                        background: 'linear-gradient(135deg, #fff 0%, #FFB3C6 35%, #FF4D6D 70%, #C9184A 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0,
                    }}>
                        How I Trapped You
                    </h2>
                    <p style={{ maxWidth: 480, margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7, color: 'rgba(240,230,239,0.55)', fontWeight: 300 }}>
                        The exact words and confessions that started it all.
                    </p>
                </div>

                {/* CARD */}
                <div ref={ref2} className={`reveal${vis2 ? ' vis' : ''}`} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        position: 'relative', maxWidth: 560, width: '100%',
                        borderRadius: 32, padding: '2px',
                        background: 'linear-gradient(135deg, rgba(255,77,109,0.7), rgba(201,24,74,0.5), rgba(163,10,57,0.3))',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(255,77,109,0.12)',
                    }}>

                        {/* Inner card */}
                        <div style={{
                            borderRadius: 30,
                            padding: '48px 40px 44px',
                            background: 'linear-gradient(160deg, rgba(18,10,20,0.95) 0%, rgba(10,8,18,0.98) 100%)',
                            backdropFilter: 'blur(30px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '32px',
                        }}>
                            {/* Locket icon */}
                            <div style={{
                                width: 88, height: 88, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(255,77,109,0.25), rgba(201,24,74,0.15))',
                                border: '1px solid rgba(255,77,109,0.4)',
                                boxShadow: '0 0 40px rgba(255,77,109,0.25), inset 0 0 20px rgba(201,24,74,0.08)',
                                fontSize: '2.6rem',
                                animation: 'heartbeat 2.4s ease-in-out infinite',
                            }}>
                                📜
                            </div>

                            {/* Quote text */}
                            <div style={{ position: 'relative', textAlign: 'center' }}>
                                <div style={{
                                    position: 'absolute', top: -12, left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '3rem', lineHeight: 1,
                                    color: 'rgba(255,77,109,0.2)',
                                    fontFamily: 'Georgia, serif',
                                    pointerEvents: 'none',
                                }}>"</div>
                                <p style={{
                                    fontSize: '1.1rem',
                                    lineHeight: 1.85,
                                    fontWeight: 300,
                                    color: 'rgba(240,230,239,0.75)',
                                    letterSpacing: '0.01em',
                                    fontFamily: "'Poppins', sans-serif",
                                    margin: 0,
                                    paddingTop: '8px',
                                }}>
                                    Looking back at these messages feels surreal. From our first awkward texts to the moment we confessed everything... Here is the evidence of how i fell.
                                </p>
                            </div>

                            {/* Divider */}
                            <div style={{
                                width: '100%', height: 1,
                                background: 'linear-gradient(90deg, transparent, rgba(255,77,109,0.4), rgba(201,24,74,0.3), transparent)',
                            }} />

                            {/* CTA button */}
                            <button
                                onClick={handleOpenMessages}
                                className="castle-portal-btn"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '18px 44px',
                                    borderRadius: 100,
                                    background: 'linear-gradient(135deg, #FF4D6D 0%, #E8285A 50%, #C9184A 100%)',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 30px rgba(255,77,109,0.45), 0 2px 8px rgba(0,0,0,0.3)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    fontFamily: "'Poppins', sans-serif",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 14px 40px rgba(201,24,74,0.55), 0 4px 12px rgba(0,0,0,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,77,109,0.45), 0 2px 8px rgba(0,0,0,0.3)';
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>💌</span>
                                <span>Unlock Memories</span>
                            </button>

                            {/* Hint text */}
                            <p style={{
                                fontSize: '0.72rem', color: 'rgba(240,230,239,0.3)',
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                margin: '-16px 0 0',
                                fontFamily: "'Poppins', sans-serif",
                            }}>
                                ✨ Our first messages, preserved forever
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}


// ===== APP =====
function App() {
    const [entered, setEntered] = useState(false);
    const [scrollOpacity, setScrollOpacity] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const opacity = Math.max(0, 1 - window.scrollY / 600);
            setScrollOpacity(opacity);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {!entered && <Loader onEnter={() => setEntered(true)} />}
            {entered && <GlobalAudio triggerPlay={entered} />}
            {entered && <FullScreenButton />}
            <div id="hero-dark-overlay" style={{ opacity: scrollOpacity }}></div>
            <InfiniteGallery />
            <NavDots />
            <div className={`content${!entered ? ' hidden' : ''}`}>
                <Hero scrollOpacity={scrollOpacity} />
                <Timeline />
                <LoveLetters />
                <Reasons />
                <LoveMeter />
                <MusicPlayer />
                <CastlePortal />
                <FriendshipLetter />
                <ConfessionsPortal />
                <Wishes />
            </div>
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
