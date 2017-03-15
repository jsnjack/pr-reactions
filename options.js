var OPTIONS = [
    "token", "word_wrap", "assigned_issues", "hipchat_url", "hipchat_notify", "organization",
    "pending_pull_requests"
];

var TOGGLE_ON = "icon-toggle-on";
var TOFFLE_OFF = "icon-toggle-off";


function save() {
    chrome.storage.local.set({
        token: document.querySelector("#token").value,
        word_wrap: is_toggled(document.querySelector("#word_wrap")),
        assigned_issues: is_toggled(document.querySelector("#assigned_issues")),
        pending_pull_requests: is_toggled(document.querySelector("#pending_pull_requests")),
        hipchat_url: document.querySelector("#hipchat_url").value,
        organization: document.querySelector("#organization").value,
        hipchat_notify: is_toggled(document.querySelector("#hipchat_notify"))
    });
}

function load() {
    chrome.storage.local.get(OPTIONS, function (storage_obj) {
        document.querySelector("#token").value = storage_obj.token ? storage_obj.token : "";
        toggle_icon(document.querySelector("#word_wrap"), storage_obj.word_wrap ? true : false);
        toggle_icon(document.querySelector("#assigned_issues"), storage_obj.assigned_issues ? true : false);
        toggle_icon(document.querySelector("#pending_pull_requests"), storage_obj.pending_pull_requests ? true : false);
        document.querySelector("#organization").value = storage_obj.organization ? storage_obj.organization : "";
        document.querySelector("#hipchat_url").value = storage_obj.hipchat_url ? storage_obj.hipchat_url : "";
        toggle_icon(document.querySelector("#hipchat_notify"), storage_obj.hipchat_notify ? true : false);
    });
}

function toggle_icon(element, status) {
    // Set proper icon class to reflect status
    var class_string = element.className;
    var cleaned = class_string.replace(TOGGLE_ON, "").replace(TOFFLE_OFF, "") + " ";
    if (status) {
        cleaned = cleaned + TOGGLE_ON;
    } else {
        cleaned = cleaned + TOFFLE_OFF;
    }
    element.className = cleaned;
}

function is_toggled(element){
    // Checks if element is toggled
    var result = false;
    if (element.className.indexOf(TOGGLE_ON) > -1) {
        result = true;
    }
    return result;
}

function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function start() {
    var icons = document.querySelectorAll("div.icon");
    for (var item of icons) {
        item.addEventListener("click", function () {
            toggle_icon(event.target, !is_toggled(event.target));
        });
    }

    document.querySelector("#save_button").addEventListener("click", function () {
        save();
        window.close();
    });
    load();
}

ready(start);
