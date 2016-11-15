/*globals chrome */

function save() {
    chrome.storage.local.set({
        token: document.querySelector("#token").value,
        word_wrap: document.querySelector("#word_wrap").checked
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

    chrome.storage.local.get('word_wrap', function (storage_obj) {
        var word_wrap;
        if (storage_obj.word_wrap === undefined) {
            word_wrap = false;
        } else {
            word_wrap = storage_obj.word_wrap;
        }
        document.querySelector("#word_wrap").checked = word_wrap;
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