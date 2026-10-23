
(function () {
    const baseUrl = manifest.baseUrl;

    async function getHome(cb) {
        cb({
            success: true,
            data: {
                "KatDrama": []
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
