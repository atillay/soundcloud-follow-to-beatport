var getCookie = function (name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
};

var urlParts = window.location.pathname.split('/');

var item = {
    type: urlParts[1],
    id: parseInt(urlParts[3])
};

fetch('https://www.beatport.com/api/my-beatport', {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': getCookie('_csrf_token')
    },
    method: 'POST',
    credentials: 'same-origin',
    body: JSON.stringify([item])
}).then(function (res) {
    if (!res.ok) {
        alert('Could not follow artist, maybe you are not logged in on Beatport');
    }
    else {
        chrome.runtime.sendMessage({
            nextArtist: true
        });
    }
});
