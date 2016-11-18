/* globals chrome */
chrome.webRequest.onHeadersReceived.addListener(function (details) {
    for (var i = 0; i < details.responseHeaders.length; i++) {

        if (isCSPHeader(details.responseHeaders[i].name.toUpperCase())) {
            var csp = details.responseHeaders[i].value;
            csp = csp.replace("media-src 'none'", "media-src 'self' blob:");
            csp = csp.replace("connect-src 'self' uploads.github.com status.github.com api.github.com www.google-analytics.com github-cloud.s3.amazonaws.com wss://live.github.com",
                "connect-src 'self' uploads.github.com status.github.com api.github.com www.google-analytics.com github-cloud.s3.amazonaws.com wss://live.github.com hipchat.com");

            details.responseHeaders[i].value = csp;
        }
    }

    return { // Return the new HTTP header
        responseHeaders: details.responseHeaders
    };
}, {
        urls: ["*://github.com/*"],
        types: ["main_frame"]
    }, ["blocking", "responseHeaders"]);


function isCSPHeader(headerName) {
    return (headerName === 'CONTENT-SECURITY-POLICY') || (headerName === 'X-WEBKIT-CSP');
}