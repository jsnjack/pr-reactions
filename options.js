var OPTIONS = [
    "token", "word_wrap", "assigned_issues", "organization",
    "pending_pull_requests", "hide_not_ready", "remove_marketplace", "slack_notify", "slack_url"
];

var TOGGLE_ON = "icon-toggle-on";
var TOGGLE_OFF = "icon-toggle-off";


function save() {
    chrome.storage.local.set({
        assigned_issues: is_toggled(document.querySelector("#assigned_issues")),
        hide_not_ready: is_toggled(document.querySelector("#hide_not_ready")),
        slack_notify: is_toggled(document.querySelector("#slack_notify")),
        slack_url: document.querySelector("#slack_url").value,
        organization: document.querySelector("#organization").value,
        pending_pull_requests: is_toggled(document.querySelector("#pending_pull_requests")),
        remove_marketplace: is_toggled(document.querySelector("#remove_marketplace")),
        token: document.querySelector("#token").value,
        word_wrap: is_toggled(document.querySelector("#word_wrap"))
    });
}

function load() {
    chrome.storage.local.get(OPTIONS, function (storage_obj) {
        document.querySelector("#token").value = storage_obj.token ? storage_obj.token : "";
        toggle_icon(document.querySelector("#word_wrap"), storage_obj.word_wrap ? true : false);
        toggle_icon(document.querySelector("#assigned_issues"), storage_obj.assigned_issues ? true : false);
        toggle_icon(document.querySelector("#pending_pull_requests"), storage_obj.pending_pull_requests ? true : false);
        document.querySelector("#organization").value = storage_obj.organization ? storage_obj.organization : "";
        document.querySelector("#slack_url").value = storage_obj.slack_url ? storage_obj.slack_url : "";
        toggle_icon(document.querySelector("#slack_notify"), storage_obj.slack_notify ? true : false);
        toggle_icon(document.querySelector("#hide_not_ready"), storage_obj.hide_not_ready ? true : false);
        toggle_icon(document.querySelector("#remove_marketplace"), storage_obj.remove_marketplace ? true : false);
    });
}

function toggle_icon(element, status) {
    // Set proper icon class to reflect status
    var class_string = element.className;
    var cleaned = class_string.replace(TOGGLE_ON, "").replace(TOGGLE_OFF, "") + " ";
    if (status) {
        cleaned = cleaned + TOGGLE_ON;
    } else {
        cleaned = cleaned + TOGGLE_OFF;
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
        item.addEventListener("click", function (event) {
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
