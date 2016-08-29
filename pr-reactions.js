/*globals chrome */

var icon_size = 20,
    access_token;

function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function is_correct_location () {
    if (window.location.href.indexOf("/pulls") > -1) {
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
    url = url + access_token;
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

function start () {
    if (is_correct_location()) {
        var elements = document.querySelectorAll("div.issues-listing li"),
            issues = get_issues(elements);
        for (var i = 0; i < issues.length; i = i + 1) {
            get_reactions(issues[i]);
        }

    }
}

function load_options() {
    chrome.storage.local.get('token', function (storage_obj) {
        access_token = storage_obj.token;
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
