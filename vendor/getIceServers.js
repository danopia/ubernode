function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}
var url = 'https://service.xirsys.com/ice';
var xhr = createCORSRequest('POST', url);
xhr.onload = function () {
    window.parent.postMessage({
        iceServers: JSON.parse(xhr.responseText).d.iceServers
    }, '*');
};
xhr.onerror = function () {
    console.error('Woops, there was an error making xhr request.');
};
xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
window.addEventListener('message', function (event) {
    if (!event.data || typeof event.data !== 'string') return;
    if(event.data == 'get-ice-servers') {
        xhr.send('ident=danopia&secret=af24fd00-8467-11e6-8895-e8373b47af14&domain=uber.danopia.net&application=default&room=default&secure=1');
    }
});