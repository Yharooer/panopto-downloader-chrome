// Scraper function to get the id's of all videos on the page.
export const scraper: ((uuid: string) => void) = (uuid: string) => {

    // Gets the id and name of the video on the page. Otherwise returns null.
    function getOneVideo() {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Gets all the videos on the page.
    // If this page does not contain a list of videos, returns null.
    function getVideoSeries(): string[] {
        var idSet: Set<string> = new Set();

        // Helper function for processing a cell and getting the video id and name from it.
        // detailName is the class name of the div containing the titles.
        function processCell(cell: HTMLElement, detailName: string) {
            // Get hyperlinks
            const atagsUnflattened: HTMLAnchorElement[][] = Array.from(cell.getElementsByClassName(detailName)).map(dc => Array.from(dc.getElementsByTagName('a')));
            const atags: HTMLAnchorElement[] = flatten(atagsUnflattened);

            // From each hyperlink process to see if url contains video id. If it does, add to list.
            for (let j = 0; j < atags.length; j++) {
                const url = atags[j].href;
                var urlParams = new URLSearchParams(url.split('?')[1]);
                var id = urlParams.get('id');
                if (id != null) {
                    if (id.startsWith('listViewHeader')) return // TODO need to redo this so it doesn't get this.
                    idSet.add(id)
                }
            }
        }

        // First parse detail view.
        var detailsTable = document.getElementById('detailsTable');
        if (detailsTable != null) {
            var trs = detailsTable.getElementsByTagName('tr');
            for (let i = 0; i < trs.length; i++) {
                processCell(trs[i], 'detail-cell');
            }
        }

        // Second parse grid view.
        const thumbnailGrid = document.getElementById('thumbnailGrid');
        if (thumbnailGrid != null) {
            const lis = thumbnailGrid.getElementsByTagName('li');
            for (let i = 0; i < lis.length; i++) {
                processCell(lis[i], 'title-link');
            }
        }

        // Third parse list view.
        const listTable = document.getElementById('listTable');
        if (listTable != null) {
            const trs = listTable.getElementsByTagName('tr');
            for (let i = 0; i < trs.length; i++) {
                processCell(trs[i], 'title-link');
            }
        }

        return Array.from(idSet);
    }

    // Gets the videos on the homepage.
    // If this page does not contain any videos in the homepage-like layout
    function getHomeVideos() : string[]{
        return Array.from(document.getElementsByClassName('item')).map(e => {
            try {
                return e.id
            } catch (e) {
                return '';
            }
        }).filter(id => id !== null && id !== '');
    }

    // Helper function
    function flatten<Type>(arr: Type[][]): Type[] {
        return arr.reduce(function (flat, toFlatten) {
            return flat.concat(toFlatten);
        }, []);
    }

    try {
        var singleDetails: string | null = getOneVideo();
        var bulkDetails: string[] = getVideoSeries() || [];
        var homeDetails: string[] = (singleDetails == null && bulkDetails.length === 0) ? getHomeVideos() || [] : [];

        // Avoid using spread ... operator or Babel polyfill will break stuff in production.
        const combined = ([] as string[]).concat(bulkDetails, homeDetails);
        if (singleDetails) combined.push(singleDetails);
        const fullDetails = Array.from(new Set(combined));

        chrome.runtime.sendMessage({
            uuid: uuid,
            data: fullDetails,
            error: false
        });
    }
    catch (e: any) {
        chrome.runtime.sendMessage({
            uuid: uuid,
            data: e.message,
            error: true
        })
    }
}
