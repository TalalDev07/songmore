(() => {
  const CLIP_STEPS = [1, 2, 4, 7, 11, 16];
  const DEMO = [
    { title: "Levitating", artist: "Dua Lipa", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/100x100bb.jpg") },
    { title: "As It Was", artist: "Harry Styles", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/10/16/67101606-3869-ca44-6c03-e13d6322cb51/mzaf_1135399237022217274.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/100x100bb.jpg") },
    { title: "bad guy", artist: "Billie Eilish", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/87/1f/c3871f7e-3260-d615-1c66-5fdca2c3a48f/mzaf_10721331211699880949.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/37/d1/1a37d1b1-8508-54f2-f541-bf4e437dda76/19UMGIM05028.rgb.jpg/100x100bb.jpg") },
    { title: "Shape of You", artist: "Ed Sheeran", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c7/4f/44c74f0d-72dc-6143-d4d0-ba14d661ca0d/mzaf_9566898362556366703.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg") },
    { title: "Heat Waves", artist: "Glass Animals", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a3/4c/b9/a34cb911-40fc-5f0c-e862-14bd171a77aa/mzaf_384792072030970151.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/da/8b/77/da8b7731-6f4f-eacf-5e74-8b23389eefa1/20UMGIM03371.rgb.jpg/100x100bb.jpg") },
    { title: "Anti-Hero", artist: "Taylor Swift", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/56/2a/1d562a07-dc5f-a9c0-1f36-2051a8c14eb7/mzaf_7214829135431340590.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3d/01/f2/3d01f2e5-5a08-835f-3d30-d031720b2b80/22UM1IM07364.rgb.jpg/100x100bb.jpg") },
    { title: "Cruel Summer", artist: "Taylor Swift", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf3/mzaf_1341699644335558812.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/100x100bb.jpg") },
    { title: "Flowers", artist: "Miley Cyrus", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/9e/f7/689ef7fe-14fe-a846-c87f-7d3b2d6344b1/mzaf_4167137058064023087.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/196589946874.jpg/100x100bb.jpg") },
    { title: "Sunflower", artist: "Post Malone & Swae Lee", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/98/f0/d6/98f0d67e-f8bf-762d-cac7-1c6b3b6b35dd/mzaf_4543283896248560946.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/100x100bb.jpg") },
    { title: "Someone You Loved", artist: "Lewis Capaldi", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e5/c8/17/e5c817e2-7830-091f-8686-d6276d5beaeb/mzaf_5586826958480073790.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/92/d7/8f/92d78fb1-df3d-049e-c81d-7022808b151f/19UMGIM02973.rgb.jpg/100x100bb.jpg") },
    { title: "Uptown Funk", artist: "Mark Ronson", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b9/96/2c/b9962c79-3662-235c-e55d-6c4b41457499/mzaf_18075623088273148288.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7e/30/c5/7e30c572-aa47-5f7b-c6fd-42d50cd2c56d/886444959797.jpg/100x100bb.jpg") },
    { title: "Rolling in the Deep", artist: "Adele", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4c/4f/03/4c4f032a-3d2b-853d-da81-996602355b42/mzaf_11625850023134180491.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/100x100bb.jpg") },
    { title: "Take On Me", artist: "a-ha", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/03/4f/f2034f41-707f-7111-bc63-e5d3cf7f2240/mzaf_17215043934336702540.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music/c6/e1/c8/mzi.ixgzfcmc.jpg/100x100bb.jpg") },
    { title: "Billie Jean", artist: "Michael Jackson", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/dc/bc/8a/dcbc8a3e-4ce1-c00d-cc02-eda2212053c7/mzaf_8347559338388601510.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/100x100bb.jpg") },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/a6/53/1e/a6531efa-397c-eb73-ecab-9b2790c1471e/mzaf_16440344883389407474.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/95/fd/b9/95fdb9b2-6d2b-92a6-97f2-51c1a6d477f1a/00602527874609.rgb.jpg/100x100bb.jpg") },
    { title: "Wonderwall", artist: "Oasis", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ab/16/93/ab16933c-6203-3db9-9da9-513ff1c8496d/mzaf_16993612140334549994.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/04/92/e0/0492e08b-cbcc-9969-9ad6-8f5a0888068c/5051961007107.jpg/100x100bb.jpg") },
    { title: "Mr. Brightside", artist: "The Killers", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/a0/30/c3a03008-17c5-aa29-6c6a-5e757ccdbaa5/mzaf_6073120660767081787.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/64/9c/11649c80-2066-dba8-77a9-df7eecae26c1/17UM1IM06937.rgb.jpg/100x100bb.jpg") },
    { title: "Seven Nation Army", artist: "The White Stripes", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fe/2d/58/fe2d587f-6344-3fb3-43f7-d318a6253dcc/mzaf_16825320951570507954.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/07/25/09/0725098a-09f4-f240-e551-94384a590371/886448799009.jpg/100x100bb.jpg") },
    { title: "Bohemian Rhapsody", artist: "Queen", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8f/11/52/8f1152a9-fd5f-0021-f546-b97579c22ec3/mzaf_3962258993076347789.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4d/08/2a/4d082a9e-7898-1aa1-a02f-339810058d9e/14DMGIM05632.rgb.jpg/100x100bb.jpg") },
    { title: "Don't Stop Believin'", artist: "Journey", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0f/e9/54/0fe95410-dc38-8696-0259-f61d869e9fca/mzaf_13616088119456591905.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/71/2d/61/712d617d-f4a4-5904-1b11-d4b4b45c47c5/828768588925.jpg/100x100bb.jpg") },
    { title: "Lose Yourself", artist: "Eminem", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/13/5a/61/135a6154-8ca2-0523-1fa2-f4ac0ea9e1e7/mzaf_13242749689945681184.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/08/23/fc/0823fcd9-cb44-695b-32bf-b3bf51d9f800/00606949351229.rgb.jpg/100x100bb.jpg") },
    { title: "HUMBLE.", artist: "Kendrick Lamar", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1f/2e/37/1f2e37be-bdd0-d770-6ea4-091011a6aade/mzaf_2360827885900940865.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ab/16/ef/ab16efe9-e7f1-66ec-021c-5592a23f0f9e/17UMGIM88793.rgb.jpg/100x100bb.jpg") },
    { title: "One Dance", artist: "Drake", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/a8/bd/68/a8bd68a2-dcd2-9024-3859-3a9fd6d53576/mzaf_16864609147187531487.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f2/0d/8b/f20d8bff-a927-ae98-6784-20a1f51cb23e/16UMGIM27642.rgb.jpg/100x100bb.jpg") },
    { title: "Stayin' Alive", artist: "Bee Gees", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3f/26/77/3f2677d0-8077-c16a-7eea-7795fa614e0f/mzaf_14501202821130740263.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/6d/ed/e9/6dede96a-6c1b-c5bb-001b-e3039195bdbb/00602567067177.rgb.jpg/100x100bb.jpg") },
    { title: "September", artist: "Earth, Wind & Fire", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/49/2d/44/492d441e-f0ce-5c3a-dcc6-3a892d2600f2/mzaf_2765278844043228646.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5c/8e/19/5c8e191d-b458-fc29-54ef-bd9367835044/886447618547.jpg/100x100bb.jpg") },
    { title: "Superstition", artist: "Stevie Wonder", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/4b/88/594b880c-4744-0510-775c-73d8b06567e8/mzaf_14855748840810986812.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/62/61/61/626161c0-f4d7-e6ff-8586-768340ef278f/00602537002382.rgb.jpg/100x100bb.jpg") },
    { title: "Crazy in Love", artist: "Beyoncé", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/b5/2a/4f/b52a4fcd-0628-cb38-c8ab-a697c11a9175/mzaf_1541321636664021445.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music/03/c5/d4/mzi.ldvrmhxt.jpg/100x100bb.jpg") },
    { title: "Umbrella", artist: "Rihanna", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7b/45/22/7b452241-882c-409b-3a9b-23306b14286a/mzaf_8588243939716013218.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2b/c0/81/2bc081c8-25f0-ba43-d451-587a54613778/16UMGIM59202.rgb.jpg/100x100bb.jpg") },
    { title: "Old Town Road", artist: "Lil Nas X", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/32/9c/42/329c4214-8cce-5382-aa92-fe87e013f3d5/mzaf_14962210134357559640.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/07/d4/c3/07d4c33e-b793-d78f-bb1b-52f1e224da88/886447788264.jpg/100x100bb.jpg") },
    { title: "I Wanna Dance with Somebody", artist: "Whitney Houston", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7b/67/fd/7b67fd07-6a7a-0362-135c-878ac5799f2c/mzaf_11309521725869189721.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/86/b5/25/86b525b1-bff1-4bf6-6112-531251b3d672/dj.hthdmusj.jpg/100x100bb.jpg") },
    { title: "Somebody That I Used to Know", artist: "Gotye", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4a/63/85/4a6385ef-b80a-5e40-0bf2-245fa5b3dc52/mzaf_1146936378720252898.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b3/8a/98/b38a9867-2a9c-de2f-2d80-c624fb2200ec/11UMGIM19347.rgb.jpg/100x100bb.jpg") },
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0d/cb/f3/0dcbf381-7cbf-78b8-7f74-d5789adf65a1/mzaf_17081805577020235844.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/56/47/b7/5647b700-6b9d-9e72-ec9f-51140b6d4492/00602567673781.rgb.jpg/100x100bb.jpg") },
    { title: "God's Plan", artist: "Drake", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c6/4a/be/c64abe74-adb4-cff5-005d-0fab3d72a806/mzaf_10276154697254415719.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/6d/8f/bb6d8f67-6d04-10b5-dd62-eb5809ac54fc/00602567879152.rgb.jpg/100x100bb.jpg") },
    { title: "Dance Monkey", artist: "Tones And I", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/43/1a/32/431a3203-7e62-c7b1-0377-824aded16096/mzaf_7471896698419931094.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/87/ed/42/87ed4279-d8d7-840f-90b5-2bffe34699ef/075679839237.jpg/100x100bb.jpg") },
    { title: "Watermelon Sugar", artist: "Harry Styles", preview: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/16/86/f5/1686f50d-8b77-7e32-85f7-5f0e804d68fe/mzaf_14195633304344507287.plus.aac.p.m4a", art: art("https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2b/c4/c9/2bc4c9d4-3bc6-ab13-3f71-df0b89b173de/886448022213.jpg/100x100bb.jpg") },
    { title: "Blinding Lights", artist: "The Weeknd" },
    { title: "Poker Face", artist: "Lady Gaga" },
    { title: "good 4 u", artist: "Olivia Rodrigo" }
  ].map((t, i) => ({ id: "d" + i, ...t }));

  const $ = (id) => document.getElementById(id);
  const player = $("player");
  const previewCache = new Map();
  let stopTimer = 0;
  let suggestIndex = 0;
  let pickedGuess = null;

  const state = {
    mode: "start",
    tracks: [],
    queue: [],
    qi: 0,
    attempt: 0,
    score: 0,
    current: null,
    busy: false
  };

  function art(url) {
    return url.replace("100x100bb", "400x400bb");
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
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

  function clipLen() {
    return CLIP_STEPS[Math.min(state.attempt, CLIP_STEPS.length - 1)];
  }

  function show(id) {
    $("view-home").hidden = id !== "home";
    $("view-game").hidden = id !== "game";
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

  async function fetchPlaylistJson(id) {
    const hosts = [
      "https://inv.nadeko.net/api/v1/playlists/",
      "https://invidious.nerdvpn.de/api/v1/playlists/",
      "https://api.piped.private.coffee/playlists/"
    ];
    let lastErr = null;
    for (const host of hosts) {
      try {
        const merged = [];
        const seenVid = new Set();
        let title = "";
        let videoCount = 0;
        for (let page = 1; page <= 12; page++) {
          const url = host.includes("piped") ? host + id : host + id + "?page=" + page;
          $("paste-status").textContent = page === 1 ? "Reading playlist…" : "Reading playlist… page " + page;
          const res = await fetch(url);
          if (!res.ok) {
            lastErr = new Error("HTTP " + res.status);
            break;
          }
          const data = await res.json();
          const vids = data.videos || data.relatedStreams || [];
          title = data.title || data.name || title;
          videoCount = data.videoCount || data.videos?.length || videoCount;
          let added = 0;
          vids.forEach((v) => {
            const vid = v.videoId || v.url || v.title;
            if (!vid || seenVid.has(vid)) return;
            seenVid.add(vid);
            merged.push(v);
            added += 1;
          });
          if (!added) break;
          if (videoCount && merged.length >= videoCount) break;
          if (host.includes("piped")) break;
        }
        if (merged.length) return { title, videos: merged, videoCount };
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("Could not read that playlist.");
  }

  function videosFromPlaylist(data) {
    const vids = shuffle(data.videos || data.relatedStreams || []);
    const tracks = [];
    const seen = new Set();
    vids.forEach((v, i) => {
      const rawTitle = v.title || "";
      const rawArtist = v.author || v.uploaderName || "";
      if (!rawTitle) return;
      const t = cleanYtTitle(rawTitle, rawArtist);
      const key = norm(t.title) + "|" + norm(t.artist);
      if (seen.has(key)) return;
      seen.add(key);
      const vid = v.videoId || (v.url || "").replace(/^.*watch\?v=/, "").slice(0, 11) || String(i);
      tracks.push({ id: "yt" + vid, title: t.title, artist: t.artist });
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
    $("paste-status").textContent = `Loaded ${tracks.length} songs from “${name}”.`;
    return tracks;
  }

  async function resolvePreview(track) {
    if (track.preview) return track;
    const key = norm(track.title) + "|" + norm(track.artist);
    if (previewCache.has(key)) {
      Object.assign(track, previewCache.get(key));
      return track;
    }
    const q = encodeURIComponent([track.title, track.artist].filter(Boolean).join(" "));
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=5`);
    const data = await res.json();
    let best = null;
    let bestScore = -1;
    for (const r of data.results || []) {
      if (!r.previewUrl) continue;
      const nt = norm(track.title);
      const na = norm(track.artist);
      const rt = norm(r.trackName);
      const ra = norm(r.artistName);
      let s = 0;
      if (rt === nt) s += 4;
      else if (rt.includes(nt) || nt.includes(rt)) s += 2;
      if (!na || ra === na) s += 4;
      else if (ra.includes(na) || na.includes(ra)) s += 2;
      if (s > bestScore) {
        bestScore = s;
        best = r;
      }
    }
    if (!best || bestScore < 2) throw new Error("no preview");
    const extra = {
      preview: best.previewUrl,
      art: art(best.artworkUrl100 || ""),
      itunesTitle: best.trackName
    };
    previewCache.set(key, extra);
    Object.assign(track, extra);
    return track;
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

  async function playClip() {
    if (!state.current?.preview) return;
    clearTimeout(stopTimer);
    await loadAudio(state.current.preview);
    const start = startOffset();
    player.currentTime = start;
    const endAt = start + clipLen();
    const stopAtEnd = () => {
      if (player.currentTime >= endAt - 0.03) {
        player.pause();
        player.removeEventListener("timeupdate", stopAtEnd);
        setSpin(false);
      }
    };
    player.removeEventListener("timeupdate", stopAtEnd);
    player.addEventListener("timeupdate", stopAtEnd);
    const go = async () => {
      try {
        await player.play();
        setSpin(true);
      } catch {
        setSpin(false);
      }
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        player.pause();
        player.removeEventListener("timeupdate", stopAtEnd);
        setSpin(false);
      }, clipLen() * 1000 + 80);
    };
    if (Math.abs(player.currentTime - start) > 0.2) {
      player.addEventListener("seeked", go, { once: true });
    } else {
      go();
    }
  }

  function paintClipMeta() {
    const len = clipLen();
    $("clip-meta").textContent = `${len.toFixed(1)}s · ${state.mode}`;
    $("play-label").textContent = `Play ${len} second${len === 1 ? "" : "s"}`;
    $("stat-mode").textContent = state.mode;
    $("stat-round").textContent = `${state.qi + 1} / ${state.queue.length}`;
    $("stat-score").textContent = `${state.score} pts`;
    $("skip").disabled = state.attempt >= CLIP_STEPS.length - 1;
  }

  function fillBars() {
    const el = $("bars");
    el.innerHTML = "";
    for (let i = 0; i < 18; i++) el.appendChild(document.createElement("i"));
  }

  function filterTracks(q) {
    const n = norm(q);
    if (!n) return state.tracks.slice(0, 8);
    return state.tracks
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function dealRound() {
    player.pause();
    setSpin(false);
    pickedGuess = null;
    $("guess").value = "";
    $("suggest").hidden = true;
    $("suggest").innerHTML = "";
    $("reveal").hidden = true;
    $("game-hint").textContent = "Wrong guess or “hear more” unlocks a longer clip.";
    if (!state.queue.length) return;
    if (state.qi >= state.queue.length) {
      state.queue = shuffle(state.tracks);
      state.qi = 0;
    }
    let tries = 0;
    while (tries < 12) {
      const track = state.queue[state.qi];
      try {
        await resolvePreview(track);
        state.current = track;
        break;
      } catch {
        state.qi = (state.qi + 1) % state.queue.length;
        tries += 1;
      }
    }
    if (!state.current?.preview) {
      alert("Could not find playable clips for this list. Try another playlist.");
      show("home");
      return;
    }
    state.attempt = 0;
    $("disc-art").style.backgroundImage = state.current.art ? `url("${state.current.art}")` : "";
    $("disc-art").style.filter = "blur(14px) saturate(0.5)";
    $("disc-art").style.opacity = "0.55";
    $("reveal-art").hidden = true;
    paintClipMeta();
    const nxt = state.queue[(state.qi + 1) % state.queue.length];
    if (nxt) resolvePreview(nxt).catch(() => {});
  }

  function pointsFor() {
    return [6, 5, 4, 3, 2, 1][Math.min(state.attempt, 5)];
  }

  function openReveal(ok) {
    player.pause();
    setSpin(false);
    const card = $("reveal").querySelector(".reveal-card");
    card.classList.toggle("ok", ok);
    card.classList.toggle("bad", !ok);
    $("reveal-kicker").textContent = ok ? "Nailed it" : "It was";
    $("reveal-title").textContent = state.current.title;
    $("reveal-artist").textContent = state.current.artist;
    const pts = ok ? pointsFor() : 0;
    if (ok) state.score += pts;
    $("reveal-score").textContent = ok ? `+${pts} · ${state.score} total` : `${state.score} total`;
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
    $("reveal").hidden = false;
    paintClipMeta();
  }

  function submitGuess() {
    if (!state.current) return;
    const g = pickedGuess || matchTyped($("guess").value);
    if (!g) {
      $("game-hint").textContent = "Pick a suggestion from your playlist.";
      $("guess").focus();
      return;
    }
    if (g.id === state.current.id) openReveal(true);
    else {
      state.attempt = Math.min(state.attempt + 1, CLIP_STEPS.length - 1);
      paintClipMeta();
      $("game-hint").textContent = "Nope. Clip got longer — hit play.";
      $("guess").value = "";
      pickedGuess = null;
      $("suggest").hidden = true;
      if (state.attempt >= CLIP_STEPS.length - 1 && clipLen() === CLIP_STEPS.at(-1)) {
        /* last length already; another miss still stays here */
      }
    }
  }

  function matchTyped(q) {
    const n = norm(q);
    if (!n) return null;
    return state.tracks.find((t) => norm(t.title + " " + t.artist) === n || norm(t.title) === n) || null;
  }

  /* ---------- Spotify PKCE ---------- */
  function liveRedirect() {
    let path = location.pathname.replace(/index\.html$/i, "");
    if (!path.endsWith("/")) path += "/";
    return location.origin + path;
  }

  function redirectUri() {
    return sessionStorage.getItem("songmore_redirect") || liveRedirect();
  }

  function spotifyClientId() {
    const fromConfig = (window.SONGMORE && window.SONGMORE.spotifyClientId) || "";
    return fromConfig.trim() || localStorage.getItem("songmore_spotify_id") || ($("spotify-id") && $("spotify-id").value.trim()) || "";
  }

  function spotifyReady() {
    const hasId = !!spotifyClientId();
    const setup = $("spotify-setup");
    if (setup) setup.hidden = hasId && !location.search.includes("setup=1");
    return hasId;
  }

  function saveTokens(tok) {
    localStorage.setItem("songmore_spotify_tok", JSON.stringify({
      access: tok.access_token,
      refresh: tok.refresh_token || JSON.parse(localStorage.getItem("songmore_spotify_tok") || "{}").refresh,
      exp: Date.now() + (tok.expires_in - 30) * 1000
    }));
  }

  async function getAccess() {
    const raw = localStorage.getItem("songmore_spotify_tok");
    if (!raw) return null;
    const t = JSON.parse(raw);
    if (t.exp > Date.now()) return t.access;
    if (!t.refresh) return null;
    const body = new URLSearchParams({
      client_id: spotifyClientId(),
      grant_type: "refresh_token",
      refresh_token: t.refresh
    });
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!res.ok) return null;
    const json = await res.json();
    saveTokens(json);
    return json.access_token;
  }

  async function spotifyErrorMessage(res) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j.error?.message || j.error_description || j.error || "";
    } catch { /* ignore */ }
    const text = String(detail).toLowerCase();
    if (res.status === 403 || text.includes("not registered") || text.includes("user may not be registered")) {
      return "Spotify blocked this account. In the Developer Dashboard open User Management, add the email you log in with, then try again.";
    }
    if (res.status === 401 || text.includes("invalid")) {
      localStorage.removeItem("songmore_spotify_tok");
      return "Spotify session expired. Click Log in with Spotify again.";
    }
    if (text.includes("redirect")) {
      return "Redirect URI mismatch. In the Spotify app settings add exactly: " + redirectUri();
    }
    return detail ? String(detail) : "Spotify request failed (" + res.status + ").";
  }

  async function spFetch(path) {
    const token = await getAccess();
    if (!token) throw new Error("Not logged in.");
    const res = await fetch("https://api.spotify.com" + path, {
      headers: { Authorization: "Bearer " + token }
    });
    if (!res.ok) throw new Error(await spotifyErrorMessage(res));
    return res.json();
  }

  async function allPages(firstPath, cap) {
    let url = firstPath;
    const items = [];
    while (url && items.length < cap) {
      const data = url.startsWith("http")
        ? await (await fetch(url, { headers: { Authorization: "Bearer " + await getAccess() } })).json()
        : await spFetch(url);
      items.push(...(data.items || []));
      url = data.next;
    }
    return items.slice(0, cap);
  }

  function trackFromSpotify(item) {
    const t = item.track || item;
    if (!t || t.is_local || !t.name) return null;
    return {
      id: t.id || ("s" + t.name),
      title: t.name,
      artist: (t.artists || []).map((a) => a.name).join(", "),
      art: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || ""
    };
  }

  async function startSpotifyLogin() {
    const typed = $("spotify-id") && $("spotify-id").value.trim();
    if (typed) localStorage.setItem("songmore_spotify_id", typed);
    const id = spotifyClientId();
    if (!id) {
      $("spotify-status").textContent = "Add your Client ID in config.js first (one-time, you only).";
      return;
    }
    if (location.protocol === "file:") {
      $("spotify-status").textContent = "Spotify login needs a local server, not a file:// page. Run: python -m http.server 8080";
      return;
    }
    localStorage.setItem("songmore_spotify_id", id);
    const verifier = [...crypto.getRandomValues(new Uint8Array(64))].map((n) => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[n % 62]).join("");
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    const challenge = btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const redirect = liveRedirect();
    sessionStorage.setItem("songmore_verifier", verifier);
    sessionStorage.setItem("songmore_redirect", redirect);
    const params = new URLSearchParams({
      client_id: id,
      response_type: "code",
      redirect_uri: redirect,
      scope: "user-library-read playlist-read-private playlist-read-collaborative",
      code_challenge_method: "S256",
      code_challenge: challenge,
      state: "songmore"
    });
    location.href = "https://accounts.spotify.com/authorize?" + params.toString();
  }

  async function handleSpotifyReturn() {
    const q = new URLSearchParams(location.search);
    if (q.get("error")) {
      $("spotify-status").textContent = "Spotify login was cancelled or denied.";
      history.replaceState({}, "", location.pathname);
      document.querySelector('[data-source="spotify"]').click();
      return true;
    }
    const code = q.get("code");
    if (!code) return false;
    const verifier = sessionStorage.getItem("songmore_verifier");
    const id = spotifyClientId();
    const redirect = sessionStorage.getItem("songmore_redirect") || redirectUri();
    history.replaceState({}, "", location.pathname);
    document.querySelector('[data-source="spotify"]').click();
    if (!verifier || !id) {
      $("spotify-status").textContent = "Login expired. Click Log in with Spotify again.";
      return true;
    }
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: id,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirect,
        code_verifier: verifier
      })
    });
    if (!res.ok) {
      $("spotify-status").textContent = await spotifyErrorMessage(res);
      return true;
    }
    saveTokens(await res.json());
    sessionStorage.removeItem("songmore_verifier");
    await showSpotifyPlaylists();
    return true;
  }

  async function showSpotifyPlaylists() {
    const box = $("playlist-list");
    const status = $("spotify-status");
    status.textContent = "Loading your playlists…";
    try {
      const me = await spFetch("/v1/me");
      const playlists = await allPages("/v1/me/playlists?limit=50", 50);
      box.hidden = false;
      box.innerHTML = "";
      const liked = document.createElement("button");
      liked.type = "button";
      liked.innerHTML = `<strong>Liked Songs</strong><br><small>${me.display_name}</small>`;
      liked.onclick = () => loadSpotifySource("liked");
      box.appendChild(liked);
      playlists.forEach((p) => {
        if (!p) return;
        const b = document.createElement("button");
        b.type = "button";
        b.innerHTML = `<strong>${escapeHtml(p.name)}</strong><br><small>${p.tracks?.total ?? "?"} tracks</small>`;
        b.onclick = () => loadSpotifySource("playlist", p.id);
        box.appendChild(b);
      });
      status.textContent = "Pick Liked Songs or a playlist. We rotate through it.";
    } catch (err) {
      localStorage.removeItem("songmore_spotify_tok");
      status.textContent = err.message || "Could not load Spotify. Log in again.";
    }
  }

  async function loadSpotifySource(kind, id) {
    $("spotify-status").textContent = "Pulling tracks…";
    let items = [];
    if (kind === "liked") items = await allPages("/v1/me/tracks?limit=50", 500);
    else items = await allPages(`/v1/playlists/${id}/tracks?limit=50`, 500);
    const tracks = items.map(trackFromSpotify).filter(Boolean);
    const uniq = [];
    const seen = new Set();
    tracks.forEach((t) => {
      if (seen.has(t.id)) return;
      seen.add(t.id);
      uniq.push(t);
    });
    if (uniq.length < 5) {
      $("spotify-status").textContent = "Need at least 5 tracks on that playlist.";
      return;
    }
    beginGame(uniq);
  }

  function beginGame(tracks) {
    state.tracks = tracks;
    state.queue = shuffle(tracks);
    state.qi = 0;
    state.score = 0;
    state.current = null;
    show("game");
    dealRound();
  }

  /* ---------- wiring ---------- */
  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.mode = btn.dataset.mode;
      document.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("is-on", b === btn));
      $("mode-hint").textContent = state.mode === "start"
        ? "Plays from the beginning of the 30s preview clip."
        : "Drops you into the middle of the 30s preview clip.";
    });
  });

  document.querySelectorAll("[data-source]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll("[data-source]").forEach((b) => b.classList.toggle("is-on", b === btn));
      const src = btn.dataset.source;
      $("paste-box").hidden = src !== "paste";
      $("spotify-box").hidden = src !== "spotify";
      if (src === "demo") beginGame(DEMO.map((t) => ({ ...t })));
      if (src === "spotify") {
        spotifyReady();
        if ($("spotify-id") && !window.SONGMORE?.spotifyClientId) {
          $("spotify-id").value = localStorage.getItem("songmore_spotify_id") || "";
        }
        if (await getAccess()) {
          try {
            await showSpotifyPlaylists();
          } catch (err) {
            $("spotify-status").textContent = err.message || "";
          }
        }
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
      if (extractYtPlaylistId(raw)) {
        tracks = await tracksFromYtLink(raw);
      }
      if (!tracks) tracks = parseList(raw);
      if (tracks.length < 5) {
        status.textContent = "Need at least 5 songs. If you pasted a link, the playlist may be private or empty.";
        return;
      }
      status.textContent = "";
      beginGame(tracks);
    } catch (err) {
      status.textContent = err.message || "Could not read that playlist. It has to be public.";
    } finally {
      btn.disabled = false;
    }
  });

  $("spotify-login").addEventListener("click", startSpotifyLogin);
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
    player.pause();
    setSpin(false);
    $("reveal").hidden = true;
    show("home");
  });
  $("home-link").addEventListener("click", (e) => {
    e.preventDefault();
    $("quit").click();
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
    const t = state.tracks.find((x) => x.id === btn.dataset.id);
    if (!t) return;
    pickedGuess = t;
    $("guess").value = `${t.title} – ${t.artist}`;
    $("suggest").hidden = true;
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".guess-wrap")) $("suggest").hidden = true;
  });

  fillBars();
  $("redirect-uri").textContent = location.protocol === "file:"
    ? "http://127.0.0.1:8080/"
    : redirectUri();
  spotifyReady();

  handleSpotifyReturn().catch((err) => console.warn(err));
})();
