var baseArtistUrl = 'https://www.beatport.com/artist';
var botRunning = false;
var currentArtistIndex = null;
var currentTab = null;
var artistsToFollow = [];

function followArtist(artist) {
    chrome.tabs.create({
        url: baseArtistUrl + '/' + artist.slug + '/' + artist.id
    }, function(tab) {
        chrome.tabs.executeScript(tab.ib, {
            file: 'src/beatportTab.js'
        });
        currentTab = tab.id;
    });
}

function followNext() {
    if (currentArtistIndex < artistsToFollow.length - 1) {
        currentArtistIndex++;
        followArtist(artistsToFollow[currentArtistIndex]);
    }
    else {
        botRunning = false;
        alert('All artists have been followed')
    }
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.artistsToFollow && request.artistsToFollow.length) {

        artistsToFollow = request.artistsToFollow;
        currentArtistIndex = 0;
        botRunning = true;

        followArtist(artistsToFollow[0]);
    }

    else if (request.nextArtist) {
        chrome.tabs.remove(currentTab, function() {
            followNext();
        });
    }
});
