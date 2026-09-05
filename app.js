(() => {
  const CLIP_STEPS = [1, 2, 4, 7, 11, 16];
  const CLIP_START = 5;
  const SONG_MAX = 1000;
  const SEC_COST = 100;
  const MISS_COST = 100;
  const DAILY_SONGS = 5;
  // Public YouTube / YouTube Music playlists. Add more IDs anytime.
  const DAILY_PLAYLISTS = [
    "PLR1_K9rGe2t0"
  ];

  const $ = (id) => document.getElementById(id);
  const player = $("player");
  let ytPlayer = null;
  let ytApiReady = null;
  const previewCache = new Map();
  let stopTimer = 0;
  let suggestIndex = 0;
  let pickedGuess = null;
  let lastRun = null;
  let clockTimer = 0;

  const state = {
    kind: "daily",
    practice: false,
    mode: "start",
    rounds: 5,
    tracks: [],
    guessPool: [],
    queue: [],
    reserve: [],
    qi: 0,
    attempt: 0,
    misses: 0,
    score: 0,
    log: [],
    current: null,
    busy: false,
    wanted: 5
  };

  function art(url) {
    return String(url || "").replace("100x100bb", "400x400bb");
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  const CATALOG = (window.SONGMORE_CATALOG || []).map((t, i) => ({
    id: t.id || ("c" + i),
    title: t.title,
    artist: t.artist
  }));

  function ytId(track) {
    if (!track) return "";
    if (track.videoId && String(track.videoId).length === 11) return track.videoId;
    const raw = String(track.id || "");
    if (raw.startsWith("yt") && raw.length === 13) return raw.slice(2);
    return "";
  }

  function canPlay(track) {
    return !!(ytId(track) || (track && track.preview));
  }

  function stopClip() {
    clearTimeout(stopTimer);
    player.pause();
    try {
      if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    } catch {
      /* player not ready */
    }
    setSpin(false);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function utcDateKey(d) {
    return (d || new Date()).toISOString().slice(0, 10);
  }

  function utcDayIndex(key) {
    const [y, m, d] = String(key || utcDateKey()).split("-").map(Number);
    return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / 86400000);
  }

  function pickDailySongs(tracks, dateKey) {
    const ordered = seededShuffle(
      tracks.slice().sort((a, b) => ytId(a).localeCompare(ytId(b))),
      "cycle:" + DAILY_PLAYLISTS.join(",")
    );
    const n = ordered.length;
    const offset = n ? ((utcDayIndex(dateKey) * DAILY_SONGS) % n + n) % n : 0;
    const queue = [];
    for (let i = 0; i < DAILY_SONGS && i < n; i++) {
      queue.push({ ...ordered[(offset + i) % n] });
    }
    const used = new Set(queue.map(ytId));
    const reserve = ordered.filter((t) => !used.has(ytId(t))).map((t) => ({ ...t }));
    return { queue, reserve };
  }

  function prettyDate(key) {
    const [y, m, day] = key.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, seed) {
    const a = arr.slice();
    const rng = mulberry32(hashString(String(seed)));
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function shuffle(arr) {
    const a = arr.slice();
    const buf = new Uint32Array(1);
    for (let i = a.length - 1; i > 0; i--) {
      crypto.getRandomValues(buf);
      const j = buf[0] % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function songKey(t) {
    return norm(t.title) + "|" + norm(t.artist);
  }

  function loadRecent() {
    try {
      return JSON.parse(localStorage.getItem("songmore_recent") || "[]");
    } catch {
      return [];
    }
  }

  function rememberPlayed(tracks) {
    const prev = loadRecent();
    const keys = tracks.map(songKey).filter(Boolean);
    const next = keys.concat(prev.filter((k) => !keys.includes(k))).slice(0, 80);
    localStorage.setItem("songmore_recent", JSON.stringify(next));
  }

  function clipLen() {
    return CLIP_STEPS[Math.min(state.attempt, CLIP_STEPS.length - 1)];
  }

  function songValue() {
    return Math.max(0, SONG_MAX - clipLen() * SEC_COST - state.misses * MISS_COST);
  }

  function maxScore() {
    return state.queue.length * SONG_MAX;
  }

  function dailyKey() {
    return "songmore_daily_" + utcDateKey();
  }

  function readDaily() {
    try {
      return JSON.parse(localStorage.getItem(dailyKey()) || "null");
    } catch {
      return null;
    }
  }

  function writeDaily(rec) {
    localStorage.setItem(dailyKey(), JSON.stringify(rec));
  }

  function show(id) {
    ["home", "custom", "game", "results"].forEach((name) => {
      const el = $("view-" + name);
      if (el) el.hidden = name !== id;
    });
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      const go = btn.dataset.go;
      btn.classList.toggle("is-on", (id === "game" || id === "results") ? go === state.kind : go === id);
    });
  }

  function setHash(path) {
    const next = "#" + path;
    if (location.hash !== next) history.replaceState({}, "", next);
  }

  function setSpin(on) {
    $("disc").classList.toggle("is-spin", on);
    $("bars").classList.toggle("is-on", on);
  }

  function parseList(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const header = lines[0].toLowerCase();
    if (header.includes("track name") && header.includes("artist")) {
      const cols = lines[0].split(",").map((c) => c.trim().toLowerCase());
      const ti = cols.findIndex((c) => c === "track name" || c === "title" || c === "song");
      const ai = cols.findIndex((c) => c === "artist name" || c === "artist");
      return lines.slice(1).map((line, i) => {
        const parts = line.split(",").map((p) => p.replace(/^"|"$/g, "").trim());
        return { id: "p" + i, title: parts[ti] || "", artist: parts[ai] || "" };
      }).filter((t) => t.title);
    }
    return lines.map((line, i) => {
      const parts = line.split(/\s[-–—]\s/);
      if (parts.length >= 2) {
        return { id: "p" + i, title: parts[0].trim(), artist: parts.slice(1).join(" - ").trim() };
      }
      return { id: "p" + i, title: line, artist: "" };
    });
  }

  function extractYtPlaylistId(text) {
    const raw = String(text || "").trim();
    const urlLine = raw.split(/\s+/).find((w) => /youtube\.com|youtu\.be|music\.youtube\.com/i.test(w)) || raw;
    let id = null;
    const list = urlLine.match(/[?&]list=([^&\s#]+)/i);
    if (list) id = decodeURIComponent(list[1]);
    else if (/^(PL|OL|RD|UU|FL)[\w-]+$/i.test(urlLine)) id = urlLine;
    if (!id) return null;
    if (id.startsWith("VL")) id = id.slice(2);
    return id;
  }

  function cleanYtTitle(title, author) {
    let artist = String(author || "").replace(/\s*-\s*topic$/i, "").trim();
    let name = String(title || "").trim();
    const pipe = name.split(/\s+\|\s+/);
    if (pipe.length === 2 && pipe[1].length < 48) {
      name = pipe[0].trim();
      if (!artist || norm(pipe[1]).includes(norm(artist)) || norm(artist).includes(norm(pipe[1]))) {
        artist = pipe[1].replace(/\s*-\s*topic$/i, "").trim();
      }
    }
    name = name
      .replace(/\s*\[[^\]]*\]/g, "")
      .replace(/\s*\((?:official|lyric|lyrics|audio|visualizer|video|mv|4k|hd|remaster|slowed|reverb)[^)]*\)/gi, "")
      .replace(/\s*official\s+(music\s+)?video/gi, "")
      .trim();
    const parts = name.split(/\s+[-–—]\s+/);
    if (parts.length >= 2) {
      const left = parts[0].trim();
      const right = parts.slice(1).join(" - ").trim();
      if (!artist || norm(left) === norm(artist) || norm(artist).includes(norm(left))) {
        artist = artist || left;
        name = right;
      }
    }
    return { title: name || title, artist: artist || "Unknown" };
  }

  function videoKey(v) {
    return v.videoId
      || (String(v.url || "").match(/[?&]v=([\w-]{11})/) || [])[1]
      || (String(v.url || "").split("/watch?v=")[1] || "").slice(0, 11)
      || "";
  }

  function pushVideos(merged, seen, vids) {
    let added = 0;
    (vids || []).forEach((v) => {
      const vid = videoKey(v) || v.title;
      if (!vid || seen.has(vid)) return;
      seen.add(vid);
      if (!v.videoId && vid.length === 11) v.videoId = vid;
      merged.push(v);
      added += 1;
    });
    return added;
  }

  async function fetchInvidiousPlaylist(base, id, seen, merged, onPage) {
    let title = "";
    let videoCount = 0;
    for (let page = 1; page <= 30; page++) {
      onPage("Reading playlist… page " + page + " · " + merged.length + " songs");
      const res = await fetch(base + id + "?page=" + page);
      if (!res.ok) break;
      const data = await res.json();
      title = data.title || data.name || title;
      videoCount = data.videoCount || videoCount;
      const added = pushVideos(merged, seen, data.videos || []);
      if (!added) break;
      if (videoCount && merged.length >= videoCount) break;
    }
    return { title, videoCount };
  }

  async function fetchPipedPlaylist(origin, id, seen, merged, onPage) {
    let title = "";
    let videoCount = 0;
    let next = null;
    for (let i = 0; i < 30; i++) {
      onPage("Reading playlist… " + merged.length + " songs");
      const url = i === 0
        ? origin + "/playlists/" + id
        : origin + "/nextpage/playlists/" + id + "?nextpage=" + encodeURIComponent(next);
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();
      title = data.name || data.title || title;
      videoCount = data.videos || data.videoCount || videoCount;
      const added = pushVideos(merged, seen, data.relatedStreams || data.videos || []);
      next = data.nextpage;
      if (!next || !added) break;
    }
    return { title, videoCount };
  }

  async function fetchPlaylistJson(id) {
    const seen = new Set();
    const merged = [];
    let title = "";
    let videoCount = 0;
    let lastErr = null;
    const onPage = (msg) => {
      if ($("paste-status")) $("paste-status").textContent = msg;
      if ($("setup-status")) $("setup-status").textContent = msg;
      if ($("home-status")) $("home-status").textContent = msg;
    };
    const sources = [
      () => fetchInvidiousPlaylist("https://inv.nadeko.net/api/v1/playlists/", id, seen, merged, onPage),
      () => fetchPipedPlaylist("https://api.piped.private.coffee", id, seen, merged, onPage),
      () => fetchInvidiousPlaylist("https://invidious.nerdvpn.de/api/v1/playlists/", id, seen, merged, onPage),
      () => fetchPipedPlaylist("https://pipedapi.kavin.rocks", id, seen, merged, onPage)
    ];
    for (const src of sources) {
      try {
        const meta = await src();
        title = title || meta.title;
        videoCount = Math.max(videoCount, Number(meta.videoCount) || 0);
        onPage("Reading playlist… " + merged.length + (videoCount ? " / " + videoCount : "") + " songs");
        if (videoCount && merged.length >= videoCount) break;
      } catch (err) {
        lastErr = err;
      }
    }
    if (!merged.length) throw lastErr || new Error("Could not read that playlist.");
    return { title, videos: merged, videoCount };
  }

  function videosFromPlaylist(data) {
    const vids = data.videos || data.relatedStreams || [];
    const tracks = [];
    const seen = new Set();
    vids.forEach((v) => {
      const rawTitle = v.title || "";
      const rawArtist = v.author || v.uploaderName || "";
      if (!rawTitle) return;
      const t = cleanYtTitle(rawTitle, rawArtist);
      const vid = videoKey(v);
      if (!vid || vid.length !== 11) return;
      if (seen.has(vid)) return;
      seen.add(vid);
      tracks.push({ id: "yt" + vid, videoId: vid, title: t.title, artist: t.artist });
    });
    return tracks;
  }

  async function tracksFromYtLink(text) {
    const id = extractYtPlaylistId(text);
    if (!id) return null;
    if (id === "LM" || id === "WL" || id === "LL") {
      throw new Error("Liked Music / Watch Later are private. Make a public playlist, or paste the songs as text.");
    }
    $("paste-status").textContent = "Reading playlist…";
    const data = await fetchPlaylistJson(id);
    const tracks = videosFromPlaylist(data);
    const name = data.title || data.name || "playlist";
    const total = data.videoCount && data.videoCount > tracks.length
      ? `${tracks.length} of ${data.videoCount}`
      : String(tracks.length);
    $("paste-status").textContent = `Loaded ${total} songs from “${name}”.`;
    if ($("setup-status")) $("setup-status").textContent = $("paste-status").textContent;
    return tracks;
  }

  async function loadDailyPlaylist() {
    const cacheKey = "songmore_ytlist_" + DAILY_PLAYLISTS.join(",");
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && Array.isArray(cached.tracks) && cached.tracks.length >= DAILY_SONGS && Date.now() - cached.at < 6 * 3600 * 1000) {
        return cached.tracks;
      }
    } catch {
      /* reload */
    }
    const seen = new Set();
    const tracks = [];
    let lastErr = null;
    for (const id of DAILY_PLAYLISTS) {
      try {
        const data = await fetchPlaylistJson(id);
        videosFromPlaylist(data).forEach((t) => {
          if (!t.videoId || seen.has(t.videoId)) return;
          seen.add(t.videoId);
          tracks.push(t);
        });
      } catch (err) {
        lastErr = err;
      }
    }
    if (tracks.length < DAILY_SONGS) {
      throw lastErr || new Error("Daily playlists are too short or couldn’t be read. They have to be public.");
    }
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), tracks }));
    } catch {
      /* quota */
    }
    return tracks;
  }

  const TITLE_NOISE = new Set([
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with",
    "feat", "ft", "featuring", "official", "video", "audio", "lyric", "lyrics",
    "remix", "remaster", "remastered", "live", "version", "edit", "radio",
    "extended", "deluxe", "bonus", "track", "mono", "stereo", "acoustic",
    "session", "cover", "from", "original", "motion", "picture", "soundtrack",
    "theme", "intro", "outro", "mix", "vol", "volume", "part", "pt"
  ]);

  function stripTitleJunk(s) {
    return norm(s)
      .replace(/\b(feat|ft|featuring)\b.+$/, " ")
      .replace(/\b(remaster(?:ed)?|live|remix|mix|version|edit|radio|acoustic|deluxe|bonus|mono|stereo|extended)\b.+$/, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function contentWords(s) {
    return stripTitleJunk(s).split(" ").filter((w) => w && !TITLE_NOISE.has(w));
  }

  function wordEq(a, b) {
    if (a === b) return true;
    const short = a.length < b.length ? a : b;
    const long = a.length < b.length ? b : a;
    return long.startsWith(short) && long.length - short.length <= 2;
  }

  function wordsCovered(need, have) {
    return need.every((w) => have.some((h) => wordEq(w, h)));
  }

  function stripArtistFromTitle(title, artist) {
    const artistWords = contentWords(artist);
    if (!artistWords.length) return stripTitleJunk(title);
    const kept = stripTitleJunk(title).split(" ").filter((w) => w && !artistWords.some((a) => wordEq(w, a)));
    return (kept.join(" ") || stripTitleJunk(title)).trim();
  }

  function titlesAlign(want, got, artist) {
    const a = stripArtistFromTitle(want, artist);
    const b = stripTitleJunk(got);
    if (!a || !b) return 0;
    if (a === b) return 8;
    const ta = contentWords(a);
    const tb = contentWords(b);
    if (!ta.length || !tb.length) return 0;
    const playlistExtra = ta.filter((w) => !tb.some((h) => wordEq(w, h)));
    const itunesExtra = tb.filter((w) => !ta.some((h) => wordEq(w, h)));
    if (playlistExtra.length) return 0;
    if (!itunesExtra.length) return 6;
    if (itunesExtra.length <= 2) return 5;
    return 0;
  }

  function artistsAlign(want, got) {
    const a = norm(want).replace(/\s*-\s*topic$/, "");
    const b = norm(got);
    if (!a) return 0;
    if (a === b) return 4;
    if (Math.min(a.length, b.length) >= 4 && (a.includes(b) || b.includes(a))) return 3;
    const ta = contentWords(want);
    const tb = contentWords(got);
    if (ta.length && tb.length && wordsCovered(ta, tb)) return 3;
    if (ta.length >= 2 && ta.some((w) => w.length >= 4 && tb.some((h) => wordEq(w, h)))) return 1;
    return 0;
  }

  function previewAcceptable(track, result) {
    const tScore = titlesAlign(track.title, result.trackName, track.artist);
    if (!tScore) return 0;
    const aScore = artistsAlign(track.artist, result.artistName);
    const words = contentWords(stripArtistFromTitle(track.title, track.artist));
    const hasArtist = !!norm(track.artist) && norm(track.artist) !== "unknown";
    if (hasArtist && aScore < 2) return 0;
    if (words.length <= 2 && aScore < 3) return 0;
    if (!hasArtist && words.length < 3) return 0;
    return tScore * 10 + aScore;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function loadYtApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytApiReady) return ytApiReady;
    ytApiReady = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        resolve();
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => reject(new Error("YouTube player failed to load."));
      document.head.appendChild(s);
    });
    return ytApiReady;
  }

  function ensureYtPlayer() {
    return loadYtApi().then(() => new Promise((resolve) => {
      if (ytPlayer && ytPlayer.playVideo) {
        resolve(ytPlayer);
        return;
      }
      ytPlayer = new window.YT.Player("yt-player", {
        width: "200",
        height: "200",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: location.origin
        },
        events: {
          onReady: () => resolve(ytPlayer)
        }
      });
    }));
  }

  function playYtClipNow(videoId) {
    if (!ytPlayer || !ytPlayer.loadVideoById) return false;
    const len = clipLen();
    let start = CLIP_START;
    if (state.mode === "mid") {
      const dur = ytPlayer.getDuration && ytPlayer.getDuration();
      start = dur && dur > CLIP_START + len + 4 ? Math.max(CLIP_START, dur * 0.45) : 45;
    }
    try { ytPlayer.unMute(); ytPlayer.setVolume(100); } catch { /* ignore */ }
    ytPlayer.loadVideoById({
      videoId,
      startSeconds: start,
      endSeconds: start + len
    });
    try { ytPlayer.playVideo(); } catch { /* ignore */ }
    setSpin(true);
    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      try { ytPlayer.pauseVideo(); } catch { /* ignore */ }
      setSpin(false);
    }, len * 1000 + 120);
    return true;
  }

  function resolvePreview(track) {
    if (ytId(track)) return Promise.resolve(track);
    return Promise.reject(new Error("no preview"));
  }

  function startOffset() {
    const dur = Number.isFinite(player.duration) ? player.duration : 30;
    const len = clipLen();
    if (state.mode === "start") return 0;
    return Math.max(0, Math.min(dur - len - 0.15, dur * 0.45));
  }

  function loadAudio(url) {
    return new Promise((resolve, reject) => {
      const onReady = () => {
        player.removeEventListener("canplay", onReady);
        player.removeEventListener("error", onErr);
        resolve();
      };
      const onErr = () => {
        player.removeEventListener("canplay", onReady);
        player.removeEventListener("error", onErr);
        reject(new Error("audio"));
      };
      player.addEventListener("canplay", onReady);
      player.addEventListener("error", onErr);
      if (player.src === url && player.readyState >= 3) {
        player.removeEventListener("canplay", onReady);
        player.removeEventListener("error", onErr);
        resolve();
        return;
      }
      player.src = url;
      player.load();
    });
  }

  function playClip() {
    const id = ytId(state.current);
    if (!id) {
      $("game-hint").textContent = "This track has no YouTube clip.";
      return;
    }
    player.pause();
    clearTimeout(stopTimer);
    if (playYtClipNow(id)) {
      $("game-hint").textContent = "Each extra second costs 100. A miss costs 100 and unlocks more.";
      return;
    }
    $("game-hint").textContent = "Starting player… tap Play again.";
    ensureYtPlayer().then(() => {
      if (ytId(state.current) === id) playYtClipNow(id);
    }).catch(() => {
      $("game-hint").textContent = "YouTube player failed to load. Refresh and try again.";
    });
  }

  function paintClipMeta() {
    const len = clipLen();
    const worth = songValue();
    $("clip-meta").textContent = `${len.toFixed(1)}s · worth ${worth}`;
    $("play-label").textContent = `Play ${len} second${len === 1 ? "" : "s"}`;
    $("stat-kind").textContent = state.practice ? "practice" : state.kind;
    $("stat-round").textContent = `${state.qi + 1} / ${state.queue.length}`;
    $("stat-score").textContent = `${state.score}`;
    $("skip").disabled = state.attempt >= CLIP_STEPS.length - 1;
    const nextLen = CLIP_STEPS[Math.min(state.attempt + 1, CLIP_STEPS.length - 1)];
    const extra = (nextLen - len) * SEC_COST;
    $("skip").textContent = state.attempt >= CLIP_STEPS.length - 1 ? "Max clip" : `Hear more −${extra}`;
  }

  function fillBars() {
    const el = $("bars");
    el.innerHTML = "";
    for (let i = 0; i < 18; i++) el.appendChild(document.createElement("i"));
  }

  function filterTracks(q) {
    const n = norm(q);
    const pool = state.guessPool.length ? state.guessPool : state.tracks;
    if (!n) return pool.slice(0, 8);
    return pool
      .map((t) => {
        const hay = norm(t.title + " " + t.artist);
        let score = 0;
        if (hay.startsWith(n) || norm(t.title).startsWith(n)) score += 5;
        if (hay.includes(n)) score += 2;
        n.split(" ").forEach((w) => { if (w && hay.includes(w)) score += 1; });
        return { t, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.t);
  }

  function renderSuggest(items) {
    const box = $("suggest");
    if (!items.length) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    box.hidden = false;
    box.innerHTML = items.map((t, i) =>
      `<li><button type="button" data-id="${t.id}" class="${i === suggestIndex ? "is-active" : ""}">${escapeHtml(t.title)} <small>${escapeHtml(t.artist)}</small></button></li>`
    ).join("");
  }

  function sameTrack(a, b) {
    if (!a || !b) return false;
    if (a.id && b.id && a.id === b.id) return true;
    if (titlesAlign(a.title, b.title, a.artist) < 6) return false;
    if (!a.artist || !b.artist) return titlesAlign(a.title, b.title) >= 8;
    return artistsAlign(a.artist, b.artist) >= 1;
  }

  function findInPool(id) {
    return (state.guessPool.length ? state.guessPool : state.tracks).find((x) => x.id === id) || null;
  }

  async function dealRound() {
    stopClip();
    pickedGuess = null;
    $("guess").value = "";
    $("suggest").hidden = true;
    $("suggest").innerHTML = "";
    $("reveal").hidden = true;
    $("game-hint").textContent = "Each extra second costs 100. A miss costs 100 and unlocks more.";
    if (!state.queue.length || state.qi >= state.queue.length) {
      finishRun();
      return;
    }
    let tries = 0;
    while (tries < 24 && state.qi < state.queue.length) {
      const track = state.queue[state.qi];
      try {
        await resolvePreview(track);
        state.current = track;
        break;
      } catch {
        const swap = (state.reserve || []).shift();
        if (swap) state.queue[state.qi] = swap;
        else state.queue.splice(state.qi, 1);
        tries += 1;
      }
    }
    if (!canPlay(state.current)) {
      alert("Could not find playable clips for this list. Try another playlist.");
      goHome();
      return;
    }
    state.attempt = 0;
    state.misses = 0;
    $("disc-art").style.backgroundImage = state.current.art ? `url("${state.current.art}")` : "";
    $("disc-art").style.filter = "blur(14px) saturate(0.5)";
    $("disc-art").style.opacity = "0.55";
    $("reveal-art").hidden = true;
    paintClipMeta();
    const nxt = state.queue[state.qi + 1];
    if (nxt) resolvePreview(nxt).catch(() => {});
  }

  function recordSong(ok) {
    const pts = ok ? songValue() : 0;
    if (ok) state.score += pts;
    state.log.push({
      title: state.current.title,
      artist: state.current.artist,
      ok,
      pts,
      seconds: clipLen(),
      misses: state.misses
    });
    if (state.kind === "daily" && !state.practice) {
      const rec = readDaily() || { date: utcDateKey() };
      rec.queue = state.queue.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        videoId: ytId(t)
      }));
      rec.score = state.score;
      rec.log = state.log;
      rec.qi = state.qi + 1;
      rec.finished = rec.qi >= state.queue.length;
      rec.practice = false;
      writeDaily(rec);
    }
    return pts;
  }

  function openReveal(ok) {
    stopClip();
    const pts = recordSong(ok);
    const card = $("reveal").querySelector(".reveal-card");
    card.classList.toggle("ok", ok);
    card.classList.toggle("bad", !ok);
    $("reveal-kicker").textContent = ok ? "Nailed it" : "It was";
    $("reveal-title").textContent = state.current.title;
    $("reveal-artist").textContent = state.current.artist;
    $("reveal-score").textContent = ok ? `+${pts} · ${state.score} total` : `0 · ${state.score} total`;
    $("disc-art").style.filter = "blur(0) saturate(1)";
    $("disc-art").style.opacity = "1";
    const artEl = $("reveal-art");
    if (state.current.art) {
      artEl.src = state.current.art;
      artEl.hidden = false;
    } else {
      artEl.removeAttribute("src");
      artEl.hidden = true;
    }
    const last = state.qi + 1 >= state.queue.length;
    $("next-btn").textContent = last ? "See score" : "Next track";
    $("reveal").hidden = false;
    paintClipMeta();
  }

  function submitGuess() {
    if (!state.current) return;
    const g = pickedGuess || matchTyped($("guess").value);
    if (!g) {
      $("game-hint").textContent = "Pick a suggestion from the list.";
      $("guess").focus();
      return;
    }
    if (sameTrack(g, state.current)) openReveal(true);
    else {
      state.misses += 1;
      state.attempt = Math.min(state.attempt + 1, CLIP_STEPS.length - 1);
      paintClipMeta();
      $("game-hint").textContent = `Nope (−${MISS_COST}). Clip got longer — hit play.`;
      $("guess").value = "";
      pickedGuess = null;
      $("suggest").hidden = true;
    }
  }

  function matchTyped(q) {
    const n = norm(q);
    if (!n) return null;
    const pool = state.guessPool.length ? state.guessPool : state.tracks;
    return pool.find((t) => norm(t.title + " " + t.artist) === n || norm(t.title) === n) || null;
  }

  function setupStatus(msg) {
    const a = $("setup-status");
    const b = $("paste-status");
    if (a) a.textContent = msg || "";
    if (b && msg) b.textContent = msg;
  }

  function homeStatus(msg) {
    const el = $("home-status");
    if (el) el.textContent = msg || "";
    if ($("daily-card-meta") && msg) $("daily-card-meta").textContent = msg;
  }

  async function collectPlayable(pool, want, onProgress, opts) {
    const explore = !!(opts && opts.explore);
    const recent = new Set(loadRecent());
    const yt = pool.filter((t) => ytId(t));
    const fresh = [];
    const seen = [];
    yt.forEach((t) => (recent.has(songKey(t)) ? seen : fresh).push(t));
    const ordered = explore ? shuffle(fresh).concat(shuffle(seen)) : yt.slice();
    if (onProgress) onProgress(Math.min(ordered.length, want), want, yt.length);
    return ordered.slice(0, want);
  }

  async function beginGame(tracks, opts) {
    const options = opts || {};
    state.kind = options.kind || "custom";
    state.practice = !!options.practice;
    state.mode = options.mode || state.mode;
    state.tracks = tracks;
    state.guessPool = options.guessPool || tracks;
    const want = options.want
      || (options.queue && options.queue.length)
      || (state.rounds === "all" ? tracks.length : Number(state.rounds) || 5);
    let queue = options.queue;
    let reserve = options.reserve || [];
    if (!queue) {
      const ordered = shuffle(tracks);
      queue = await collectPlayable(ordered, want, (have, need, total) => {
        setupStatus(`Shuffling the list… ${have} ready · ${total || ordered.length} songs`);
      }, { explore: options.kind !== "daily" });
      reserve = shuffle(ordered.filter((t) => !queue.includes(t)));
      if (options.kind !== "daily") rememberPlayed(queue);
    }
    if (!queue.length) {
      setupStatus("None of those songs could be played. Use a public YouTube playlist.");
      return false;
    }
    state.queue = queue;
    state.reserve = reserve;
    state.wanted = want;
    state.qi = options.qi || 0;
    state.score = options.score || 0;
    state.log = options.log ? options.log.slice() : [];
    state.current = null;
    state.attempt = 0;
    state.misses = 0;
    const banner = $("game-banner");
    if (state.practice) {
      banner.hidden = false;
      banner.textContent = "Practice — today’s official score is already locked.";
    } else if (queue.length < want && state.rounds !== "all") {
      banner.hidden = false;
      banner.textContent = `Only ${queue.length} of ${want} had a matching preview. Playing those.`;
    } else {
      banner.hidden = true;
    }
    setupStatus("");
    show("game");
    setHash("/play");
    if (queue.some((t) => ytId(t))) ensureYtPlayer().catch(() => {});
    dealRound();
    return true;
  }

  function finishRun() {
    lastRun = {
      kind: state.kind,
      practice: state.practice,
      date: utcDateKey(),
      score: state.score,
      max: maxScore(),
      log: state.log.slice(),
      queue: state.queue.slice()
    };
    if (state.kind === "daily" && !state.practice) {
      writeDaily({
        date: lastRun.date,
        score: lastRun.score,
        log: lastRun.log,
        queue: lastRun.queue.map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          videoId: ytId(t)
        })),
        finished: true,
        practice: false
      });
    } else if (state.kind !== "daily") {
      rememberPlayed(state.queue);
    }
    paintResults(lastRun);
    show("results");
    setHash("/results");
    paintHome();
  }

  function paintResults(run) {
    const official = run.kind === "daily" && !run.practice;
    $("results-kicker").textContent = run.practice ? "practice" : run.kind;
    $("results-date").textContent = run.kind === "daily" ? prettyDate(run.date) : `${run.log.length} songs`;
    $("results-score").innerHTML = `${run.score}<span>/${run.max}</span>`;
    if (run.kind === "daily") {
      $("results-blurb").textContent = official
        ? "That’s your official run for today. Same five songs for everyone. Come back tomorrow."
        : "Practice doesn’t overwrite today’s official score.";
    } else {
      $("results-blurb").textContent = "Custom run. Paste another list or play the vault again.";
    }
    $("score-list").innerHTML = run.log.map((row) => `
      <li class="${row.ok ? "" : "is-miss"}">
        <span class="score-mark">${row.ok ? "●" : "○"}</span>
        <span><strong>${escapeHtml(row.title)}</strong><small>${escapeHtml(row.artist)} · ${row.seconds}s</small></span>
        <span class="score-pts">${row.pts}</span>
      </li>
    `).join("");
    $("results-again").textContent = run.kind === "daily" ? "Practice today" : "Play again";
    $("share-status").textContent = "";
    paintCountdown($("results-countdown"));
  }

  function shareText(run) {
    const lines = run.log.map((row) => {
      if (!row.ok) return "🟥 " + row.pts;
      if (row.pts >= 800) return "🟩 " + row.pts;
      return "🟨 " + row.pts;
    });
    const title = run.kind === "daily"
      ? `songmore daily — ${prettyDate(run.date)}`
      : `songmore custom — ${run.log.length} songs`;
    return [title, `${run.score}/${run.max}`, ...lines, "https://talaldev07.github.io/songmore/"].join("\n");
  }

  function msUntilNextUtcDay() {
    const now = new Date();
    const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    return Math.max(0, next - now.getTime());
  }

  function formatCountdown() {
    const ms = msUntilNextUtcDay();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `Next daily in ${h}h ${m}m`;
  }

  function paintCountdown(el) {
    if (!el) return;
    el.textContent = formatCountdown();
  }

  function paintHome() {
    const rec = readDaily();
    $("top-date").textContent = prettyDate(utcDateKey());
    $("daily-kicker").textContent = rec?.finished ? "played" : "today";
    $("daily-card-meta").textContent = rec?.finished
      ? `${rec.score}/5000 · see score`
      : `Play · /5000`;
    paintCountdown($("daily-countdown"));
  }

  function goHome() {
    stopClip();
    $("reveal").hidden = true;
    show("home");
    setHash("/");
    paintHome();
  }

  async function startDaily(practice) {
    if (state.busy) return;
    state.busy = true;
    const card = $("go-daily");
    if (card) {
      card.classList.add("is-busy");
      card.blur();
    }
    try {
      homeStatus("Loading today’s playlist…");
      const rec = readDaily();
      if (rec?.finished && !practice) {
        lastRun = {
          kind: "daily",
          practice: false,
          date: rec.date || utcDateKey(),
          score: rec.score || 0,
          max: DAILY_SONGS * SONG_MAX,
          log: rec.log || [],
          queue: rec.queue || []
        };
        homeStatus("");
        paintResults(lastRun);
        show("results");
        setHash("/results");
        return;
      }
      const tracks = await loadDailyPlaylist();
      loadYtApi().catch(() => {});
      let queue = [];
      let reserve = [];
      if (rec?.queue?.length && !practice && !rec.finished) {
        queue = rec.queue;
        reserve = tracks.filter((t) => !queue.some((q) => q.id === t.id));
      }
      if (queue.length < DAILY_SONGS) {
        const picked = pickDailySongs(tracks, utcDateKey());
        queue = picked.queue;
        reserve = picked.reserve;
      }
      const ok = await beginGame(tracks, {
        kind: "daily",
        practice: !!practice || !!rec?.finished,
        mode: "start",
        guessPool: tracks,
        queue,
        reserve,
        want: DAILY_SONGS,
        qi: !practice && rec && !rec.finished ? (rec.qi || 0) : 0,
        score: !practice && rec && !rec.finished ? (rec.score || 0) : 0,
        log: !practice && rec && !rec.finished ? (rec.log || []) : []
      });
      if (!ok) throw new Error("Could not start today’s daily. Try again.");
      homeStatus("");
      if (!practice && !rec?.finished) {
        writeDaily({
          date: utcDateKey(),
          queue: state.queue.map((t) => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            videoId: ytId(t)
          })),
          score: state.score,
          log: state.log,
          qi: state.qi,
          finished: false,
          practice: false
        });
      }
    } catch (err) {
      show("home");
      setHash("/");
      paintHome();
      homeStatus(err.message || "Could not start daily.");
    } finally {
      state.busy = false;
      if (card) card.classList.remove("is-busy");
    }
  }

  function go(target) {
    if (target === "daily") startDaily(false);
    else if (target === "custom") {
      show("custom");
      setHash("/custom");
    } else {
      goHome();
    }
  }

  /* ---------- wiring ---------- */
  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.mode = btn.dataset.mode;
      document.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-on", b === btn));
      $("mode-hint").textContent = state.mode === "start"
        ? "Starts 5 seconds in, so you skip the silent intro."
        : "Drops you into the middle of the track.";
    });
  });

  document.querySelectorAll("[data-rounds]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.rounds = btn.dataset.rounds === "all" ? "all" : Number(btn.dataset.rounds);
      document.querySelectorAll("[data-rounds]").forEach((b) => b.classList.toggle("is-on", b === btn));
    });
  });

  document.querySelectorAll("[data-source]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll("[data-source]").forEach((b) => b.classList.toggle("is-on", b === btn));
      const src = btn.dataset.source;
      $("paste-box").hidden = src !== "paste";
      if (src === "vault") {
        setupStatus("Loading the YouTube list…");
        const tracks = await loadDailyPlaylist();
        await beginGame(tracks, { kind: "custom", guessPool: tracks });
      }
    });
  });

  $("paste-go").addEventListener("click", async () => {
    const raw = $("paste-input").value.trim();
    const status = $("paste-status");
    const btn = $("paste-go");
    if (!raw) {
      status.textContent = "Paste a playlist link or a list of songs.";
      return;
    }
    btn.disabled = true;
    status.textContent = "";
    try {
      let tracks = null;
      if (extractYtPlaylistId(raw)) tracks = await tracksFromYtLink(raw);
      if (!tracks) tracks = parseList(raw);
      const need = state.rounds === "all" ? 1 : Number(state.rounds);
      if (tracks.length < need) {
        status.textContent = `Need at least ${need} songs. If you pasted a link, the playlist may be private or empty.`;
        return;
      }
      status.textContent = "Finding playable clips…";
      await beginGame(tracks, { kind: "custom" });
    } catch (err) {
      status.textContent = err.message || "Could not read that playlist. It has to be public.";
    } finally {
      btn.disabled = false;
    }
  });

  $("play-btn").addEventListener("click", () => playClip());
  $("submit").addEventListener("click", submitGuess);
  $("skip").addEventListener("click", () => {
    if (state.attempt < CLIP_STEPS.length - 1) state.attempt += 1;
    paintClipMeta();
    playClip();
  });
  $("giveup").addEventListener("click", () => openReveal(false));
  $("next-btn").addEventListener("click", () => {
    state.qi += 1;
    dealRound();
  });
  $("quit").addEventListener("click", () => {
    stopClip();
    $("reveal").hidden = true;
    if (state.kind === "custom") {
      show("custom");
      setHash("/custom");
    } else goHome();
  });
  $("home-link").addEventListener("click", (e) => {
    e.preventDefault();
    goHome();
  });
  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.go));
  });
  $("go-daily").addEventListener("click", () => startDaily(false));
  $("go-custom").addEventListener("click", () => go("custom"));
  $("results-home").addEventListener("click", goHome);
  $("results-again").addEventListener("click", () => {
    if (state.kind === "daily" || lastRun?.kind === "daily") startDaily(true);
    else go("custom");
  });
  $("share-btn").addEventListener("click", async () => {
    if (!lastRun) return;
    const text = shareText(lastRun);
    try {
      await navigator.clipboard.writeText(text);
      $("share-status").textContent = "Copied.";
    } catch {
      $("share-status").textContent = text;
    }
  });

  $("guess").addEventListener("input", () => {
    pickedGuess = null;
    const items = filterTracks($("guess").value);
    suggestIndex = 0;
    renderSuggest(items);
  });
  $("guess").addEventListener("keydown", (e) => {
    const buttons = [...$("suggest").querySelectorAll("button")];
    if (e.key === "ArrowDown" && buttons.length) {
      e.preventDefault();
      suggestIndex = (suggestIndex + 1) % buttons.length;
      renderSuggest(filterTracks($("guess").value));
    } else if (e.key === "ArrowUp" && buttons.length) {
      e.preventDefault();
      suggestIndex = (suggestIndex - 1 + buttons.length) % buttons.length;
      renderSuggest(filterTracks($("guess").value));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!$("suggest").hidden && buttons[suggestIndex]) buttons[suggestIndex].click();
      else submitGuess();
    } else if (e.key === "Escape") {
      $("suggest").hidden = true;
    }
  });
  $("suggest").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const t = findInPool(btn.dataset.id);
    if (!t) return;
    pickedGuess = t;
    $("guess").value = `${t.title} – ${t.artist}`;
    $("suggest").hidden = true;
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".guess-wrap")) $("suggest").hidden = true;
  });

  window.addEventListener("hashchange", () => {
    const h = (location.hash || "#/").replace(/^#/, "") || "/";
    if (h.startsWith("/custom")) go("custom");
    else if (h.startsWith("/daily")) startDaily(false);
    else if (h.startsWith("/results") && lastRun) {
      paintResults(lastRun);
      show("results");
    } else if (h.startsWith("/play") && state.current) show("game");
    else goHome();
  });

  fillBars();
  paintHome();
  loadYtApi().catch(() => {});
  clockTimer = setInterval(() => {
    paintCountdown($("daily-countdown"));
    paintCountdown($("results-countdown"));
  }, 30000);

  const h = (location.hash || "#/").replace(/^#/, "") || "/";
  if (h.startsWith("/custom")) go("custom");
  else if (h.startsWith("/daily")) startDaily(false);
  else goHome();
})();
