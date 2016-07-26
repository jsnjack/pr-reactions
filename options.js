/*globals chrome */

function save() {
    chrome.storage.local.set({
        token: document.querySelector("#token").value
    });
}

function load() {
    chrome.storage.local.get('token', function (storage_obj) {
        var token;
        if (storage_obj.token === undefined) {
            token = "";
        } else {
            token = storage_obj.token;
        }
        document.querySelector("#token").value = token;
    });
}

function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function start() {
    load();
    document.querySelector("#form").addEventListener("submit", save);
}

ready(start);