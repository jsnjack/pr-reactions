/*globals chrome */

var icon_size = 20,
    settings = {},
    hipchat_notified = false;

function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function is_correct_location (path) {
    if (window.location.href.indexOf(path) > -1) {
        return true;
    }
    return false;
}

function get_issues(elements) {
    var issues = [];
    for (var i = 0; i < elements.length; i = i + 1) {
        var obj = {},
            parsed = elements[i].id.split("_", 4),
            path_obj = window.location.pathname.split("/", 4);
        if (parsed.length === 2) {
            // Pull request page in the repository
            obj.id = parsed[1];
            obj.username = path_obj[1];
            obj.repository = path_obj[2];
        } else {
            // General pull request page
            obj.id = parsed[1];
            obj.username = parsed[2];
            obj.repository = parsed[3];
            obj.type = "general";
        }
        issues.push(obj);
    }
    return issues;
}

function generate_url(issue) {
    var url = "https://api.github.com/repos/";
    url = url + issue.username + "/" + issue.repository + "/issues/" + issue.id + "/reactions?access_token=";
    url = url + settings.token;
    return url;
}

function get_reactions(issue) {
    var url = generate_url(issue);
    fetch(url, {
        headers: {
            "Accept": "application/vnd.github.squirrel-girl-preview"
        }
    }).then(function(response) {
        if (response.ok) {
            return response.json().then(function(json) {
                var amount = 0,
                    title = "",
                    selector = "#issue_" + issue.id,
                    element = document.createElement("a"),
                    container;
                if (issue.type === "general") {
                    selector = selector + "_" + issue.username + "_" + issue.repository;
                }
                container = document.querySelector(selector + " div.d-table > div:last-child > div.float-right");
                for (var i = 0; i < json.length; i = i + 1) {
                    if (json[i].content === "+1") {
                        amount = amount + 1;
                        title = title + json[i].user.login + " ";
                    }
                }
                if (container.firstChild.id === "pr-reactions") {
                    container.firstChild.text = amount;
                } else {
                    element.id = "pr-reactions";
                    element.title = title;
                    element.alt = title;
                    element.classList = "pr-reaction text-small text-bold";
                    // element.text = amount;
                    element.appendChild(create_img_element());
                    element.appendChild(create_span_element(amount));
                    container.insertBefore(element, container.firstChild);
                }
            });
        }
    });
}

function create_img_element() {
    var element = document.createElement("img");
    element.src = "https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png";
    element.width = icon_size;
    element.height = icon_size;
    return element;
}

function create_span_element(text) {
    var element = document.createElement("span");
    element.textContent = text;
    return element;
}

function generate_hipchat_payload() {
    var payload,
        username = document.querySelector("meta[name='user-login']").getAttribute("content");
    payload = {
        "color": "purple",
        "from": username,
        "message_format": "text",
        "message": username + " likes pull request " + location.href,
        "notify": true,
        "card": {
            "style": "application",
            "format": "compact",
            "url": location.href,
            "id": "pr-reactions",
            "title": document.title,
            "description": username + " likes pull request",
            "icon": {
                "url": "https://github.com/fluidicon.png"
            },
            "date": new Date()
        }
    };
    return JSON.stringify(payload);
}

function notify_hipchat() {
    hipchat_notified = false;
    fetch(settings.hipchat_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: generate_hipchat_payload()
    }).then(function (response) {
        if (response.ok) {
            hipchat_notified = true;
        }
    });
    // Once in a while a request can be blocked because of the CSP violation.
    // That should not happen as the request is patched in background.js.
    // Retrying the request should help
    setTimeout(function () {
        if (!hipchat_notified) {
            notify_hipchat();
        }
    }, 1000);
}

function on_reactions_container_click (event) {
    if (settings.hipchat_url && event.target.getAttribute("alt") === ":+1:") {
        // Check that it was not `unreact` actions
        if (event.target.parentNode.parentNode.getAttribute("value") === "+1 react") {
            notify_hipchat();
        }
    }
}

function start () {
    var elements, issues, i;
    if (is_correct_location("/pulls")) {
        elements = document.querySelectorAll("div.issues-listing li");
        issues = get_issues(elements);
        for (i = 0; i < issues.length; i = i + 1) {
            get_reactions(issues[i]);
        }

    }

    if (settings.word_wrap) {
        elements = document.querySelectorAll("code");
        for (i = 0; i < elements.length; i = i + 1) {
            elements[i].classList = "pr-reaction-word-wrap " + elements[i].classList;
        }
    }

    if (settings.hipchat_notify && is_correct_location("/pull/")) {
        var button_container = document.querySelector("div.timeline-comment-actions");
        if (button_container) {
            // Github replaces reaction buttons, attach event to the container
            button_container.addEventListener("click", on_reactions_container_click);
        }
    }
}

function load_options() {
    chrome.storage.local.get(["word_wrap", "token", "hipchat_url", "hipchat_notify"], function (storage_obj) {
        settings = storage_obj;
        start();
    });
}

function init () {
    load_options();

    // Github uses pjax to switch tabs
    document.addEventListener("pjax:success", function () {
        start();
    });

}

ready(init);
