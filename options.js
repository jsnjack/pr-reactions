var OPTIONS = [
    "token", "word_wrap", "assigned_issues", "hipchat_url", "hipchat_notify", "hipchat_messages", "organization",
    "pending_pull_requests"
];

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

function get_hipchat_messages() {
    var elements = document.querySelectorAll("#messages_container ul li"),
        message_list = [];

    for (var i = 0; i < elements.length; i = i + 1) {
        message_list.push(elements[i].textContent);
    }

    return message_list;
}

function save(event) {
    event.preventDefault();
    var indicator = document.querySelector("div.indicator");
    indicator.classList.add("animate-save");
    chrome.storage.local.set({
        token: document.querySelector("#token").value,
        word_wrap: document.querySelector("#word_wrap").checked,
        assigned_issues: document.querySelector("#assigned_issues").checked,
        pending_pull_requests: document.querySelector("#pending_pull_requests").checked,
        hipchat_url: document.querySelector("#hipchat_url").value,
        organization: document.querySelector("#organization").value,
        hipchat_notify: document.querySelector("#hipchat_notify").checked,
        hipchat_messages: get_hipchat_messages()
    });
}

function load() {
    chrome.storage.local.get(OPTIONS, function (storage_obj) {
        document.querySelector("#token").value = storage_obj.token ? storage_obj.token : "";
        document.querySelector("#word_wrap").checked = storage_obj.word_wrap ? true : false;
        document.querySelector("#assigned_issues").checked = storage_obj.assigned_issues ? true : false;
        document.querySelector("#pending_pull_requests").checked = storage_obj.pending_pull_requests ? true : false;
        document.querySelector("#organization").value = storage_obj.organization ? storage_obj.organization : "";
        document.querySelector("#hipchat_url").value = storage_obj.hipchat_url ? storage_obj.hipchat_url : "";
        document.querySelector("#hipchat_notify").checked = storage_obj.hipchat_notify ? true : false;
        for (var i = 0; i < storage_obj.hipchat_messages.length; i = i + 1) {
            render_message(storage_obj.hipchat_messages[i]);
        }
    });
}

function on_message_click(event) {
    event.target.remove();
}

function render_message(message) {
    // Adds message to the container
    var container = document.querySelector("#messages_container ul"),
        element;

    element = document.createElement("li");
    element.textContent = message;
    container.appendChild(element);

    element.addEventListener("click", on_message_click);
}

function on_add_click () {
    var input = document.querySelector("#hipchat_message");

    render_message(input.value);
    input.value = "";
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
    document.querySelector("#message_add_button").addEventListener("click", on_add_click);

    load();
}

ready(start);
