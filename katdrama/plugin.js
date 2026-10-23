
(function () {
    const baseUrl = manifest.baseUrl;

    
async function getHome(cb) {
    const drama = new MultimediaItem({
        title: "Make Me Tingle (2026)",
        url: `${manifest.baseUrl}/make-me-tingle-2026-s01-hindi/`,
        posterUrl: "",
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
        cb({
            success: false,
            errorCode: "NOT_FOUND",
            message: "Details not implemented yet"
        });
    }

    async function loadStreams(url, cb) {
        cb({
            success: true,
            data: []
        });
    }

    globalThis.getHome = getHome;
    globalThis.search = search;
    globalThis.load = load;
    globalThis.loadStreams = loadStreams;
})();
