/*globals chrome */

function save() {
    chrome.storage.local.set({
        token: document.querySelector("#token").value,
        word_wrap: document.querySelector("#word_wrap").checked
    });
}

function load() {
    chrome.storage.local.get(["token", "word_wrap"], function (storage_obj) {
        document.querySelector("#token").value = storage_obj.token ? storage_obj.token : "";
        document.querySelector("#word_wrap").checked = storage_obj.word_wrap ? true : false;
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