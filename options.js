/*globals chrome */

function save() {
    chrome.storage.local.set({
        token: document.querySelector("#token").value
    });
}

function load() {
    chrome.storage.local.get('token', function (storage_obj) {
        document.querySelector("#token").value = storage_obj.token;
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