
(function () {
    const baseUrl = manifest.baseUrl;

    

async function getHome(cb) {
  const dramas = [
    {
      title: "Make Me Tingle (2026)",
      slug: "make-me-tingle-2026-s01-hindi",
      poster: "e4MlbtE02So4D5DJy197DbiAxqs.jpg",
      year: 2026
    },
    {
      title: "Search: WWW (2019)",
      slug: "search-www-2019-s01-hindi",
      poster: "3En58LrzOXg9b3Hlq0sC1uZE4iW.jpg",
      year: 2019
    },
    {
      title: "Reply 1994 (2013)",
      slug: "reply-1994-season-1-hindi",
      poster: "yuSE368pNeTREW5M1duDUUnoQ8i.jpg",
      year: 2013
    }
  ];

  const items = dramas.map(d => new MultimediaItem({
    title: d.title,
    url: `${baseUrl}/${d.slug}/`,
    posterUrl: `https://image.tmdb.org/t/p/w500/${d.poster}`,
    type: "series",
    year: d.year
  }));

  cb({
    success: true,
    data: {
      "Latest Dramas": items
    }
  });
}



    async function search(query, cb) {
        cb({
            success: true,
            data: []
        });
    }

    


async function load(url, cb) {
  const dramas = {
    "make-me-tingle-2026-s01-hindi": {
      title: "Make Me Tingle (2026)",
      poster: "e4MlbtE02So4D5DJy197DbiAxqs.jpg",
      year: 2026
    },
    "search-www-2019-s01-hindi": {
      title: "Search: WWW (2019)",
      poster: "3En58LrzOXg9b3Hlq0sC1uZE4iW.jpg",
      year: 2019
    },
    "reply-1994-season-1-hindi": {
      title: "Reply 1994 (2013)",
      poster: "yuSE368pNeTREW5M1duDUUnoQ8i.jpg",
      year: 2013
    }
  };

  const slug = url.split("/").filter(Boolean).pop();
  const info = dramas[slug];

  if (!info) {
    cb({ success: false, data: null });
    return;
  }

  const drama = new MultimediaItem({
    title: info.title,
    url: url,
    posterUrl: `https://image.tmdb.org/t/p/w500/${info.poster}`,
    type: "series",
    year: info.year,
    description: info.title,
    
episodes: Array.from(
  { length: slug === "make-me-tingle-2026-s01-hindi" ? 6 : 1 },
  (_, i) => new Episode({
    name: `Episode ${i + 1} (Test)`,
    url: `${url}#episode-${i + 1}`,
    season: 1,
    episode: i + 1
  })
)

  });

  cb({
    success: true,
    data: drama
  });
}



async function loadStreams(url, cb) {
  const stream = new StreamResult({
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    source: "Test Video",
    quality: "720p"
  });

  cb({
    success: true,
    data: [stream]
  });
}


    globalThis.getHome = getHome;
    globalThis.search = search;
    globalThis.load = load;
    globalThis.loadStreams = loadStreams;
})();
