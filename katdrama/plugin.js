
(function () {
    const baseUrl = manifest.baseUrl;

    
async function getHome(cb) {
    const drama = new MultimediaItem({
        title: "Make Me Tingle (2026)",
        url: `${manifest.baseUrl}/make-me-tingle-2026-s01-hindi/`,
        
posterUrl: "https://m.media-amazon.com/images/M/MV5BOTc0MDcwNDYtYWQwOS00YmY0LWIxOTMtZWMxYjQwOTJmNDQ1XkEyXkFqcGc@._V1_QL75_UY562_CR9,0,380,562_.jpg",

        type: "series",
        year: 2026
    });

    cb({
        success: true,
        data: {
            "Latest Dramas": [drama]
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
  const drama = new MultimediaItem({
    title: "Make Me Tingle (2026)",
    url: url,
    posterUrl: "https://m.media-amazon.com/images/M/MV5BOTc0MDcwNDYtYWQwOS00YmY0LWIxOTMtZWMxYjQwOTJmNDQ1XkEyXkFqcGc@._V1_QL75_UY562_CR9,0,380,562_.jpg",
    type: "series",
    year: 2026,
    description: "KatDrama details page test.",
    episodes: [
      new Episode({
        name: "Episode 1 (Test)",
        url: url + "#episode-1",
        season: 1,
        episode: 1
      })
    ]
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
