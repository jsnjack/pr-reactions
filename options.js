/*globals chrome */

function animation_event (event) {
    switch(event.type) {
        case "animationstart":
            event.target.style.opacity = 1;
            break;
        case "animationend":
            event.target.classList.remove("animate-save");
            setTimeout(function () {
                event.target.style.opacity = 0;
            }, 1000);
            break;
    }
}

function save(event) {
    event.preventDefault();
    var indicator = document.querySelector("div.indicator");
    indicator.classList.add("animate-save");
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
    var indicator = document.querySelector("div.indicator");
    indicator.addEventListener("animationstart", animation_event, false);
    indicator.addEventListener("animationend", animation_event, false);
    document.querySelector("#form").addEventListener("submit", save);

    load();
}

ready(start);