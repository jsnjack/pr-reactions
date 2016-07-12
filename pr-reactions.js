/*globals console, chrome */

var access_token;

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

function get_issue_ids(elements) {
    var ids = [];
    for (var i = 0; i < elements.length; i = i + 1) {
        ids.push(elements[i].id.replace("issue_", ""));
    }
    return ids;
}

function generate_url(issue_id) {
    var path_obj = window.location.pathname.split("/"),
        repo, owner, url;
    if (path_obj.length === 4) {
        owner = path_obj[1];
        repo = path_obj[2];
        url = "https://api.github.com/repos/" + owner + "/" + repo + "/issues/" + issue_id + "/reactions?access_token=";
        url = url + access_token;
    } else {
        console.log("Failed to determine request parameters");
    }
    return url;
}

function get_reactions(issue_id) {
    var url = generate_url(issue_id);
    fetch(url, {
        headers: {
            "Accept": "application/vnd.github.squirrel-girl-preview"
        }
    }).then(function(response) {
        if (response.ok) {
            return response.json().then(function(json) {
                var amount = 0,
                    title = "",
                    container = document.querySelector("#issue_" + issue_id + " div.d-table > div:last-child"),
                    element = document.createElement("a");
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
                    element.text = amount;
                    element.appendChild(create_img_element());
                    container.insertBefore(element, container.firstChild);
                }
            });
        }
    });
}

function create_img_element() {
    var element = document.createElement("img");
    element.src = "https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png";
    element.width = 20;
    element.height = 20;
    return element;
}

function start () {
    if (is_correct_location()) {
        var elements = document.querySelectorAll("div.issues-listing li"),
            ids = get_issue_ids(elements);

        for (var i = 0; i < ids.length; i = i + 1) {
            get_reactions(ids[i]);
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
