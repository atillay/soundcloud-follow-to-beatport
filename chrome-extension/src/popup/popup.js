var formDom = document.querySelector('.js-mainForm');
var artistsToFollowDom = formDom.querySelector('textarea[name="artists_to_follow"]');

artistsToFollowDom.placeholder = '[{"id":"208","name":"D&#39;Julz","slug":"djulz"},{"id":"165920","name":"Janeret","slug":"janeret"}]';

function validateArtistsToFollow() {
    try {
        var artistsToFollow = JSON.parse(artistsToFollowDom.value);
        if (!artistsToFollow.length) artistsToFollowDom.classList.add('error');
        else artistsToFollowDom.classList.remove('error');
    } catch (e) {
        artistsToFollowDom.classList.add('error');
    }
}
artistsToFollowDom.addEventListener('keyup', validateArtistsToFollow);
artistsToFollowDom.addEventListener('paste', validateArtistsToFollow);

formDom.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!artistsToFollowDom.classList.contains('error')) {
        chrome.runtime.sendMessage({
            artistsToFollow: JSON.parse(artistsToFollowDom.value)
        });
    }
});