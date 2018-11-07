var icon_size = 20,
    pending_prs_cache = 15 * 1000,
    settings = {},
    pending_prs_label = "Pending prs",
    not_ready_prs_key = "WIP";
var OPTIONS = [
    "token", "word_wrap", "assigned_issues", "hipchat_url", "hipchat_notify", "organization",
    "pending_pull_requests", "hide_not_ready", "remove_marketplace", "slack_url", "slack_notify"
];


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
                console.log("RESP", json);
                var amount = 0,
                    title = "",
                    selector = "#issue_" + issue.id,
                    element = document.createElement("a"),
                    username = document.querySelector("meta[name='user-login']").getAttribute("content"),
                    container, reaction_container, author;
                if (issue.type === "general") {
                    selector = selector + "_" + issue.username + "_" + issue.repository;
                }
                container = document.querySelector(selector);
                author = container.querySelector("span.opened-by a").textContent;
                reaction_container = container.querySelector("div.d-table > div:last-child > div.float-right");
                for (var i = 0; i < json.length; i = i + 1) {
                    if (json[i].content === "+1") {
                        amount = amount + 1;
                        title = title + json[i].user.login + " ";
                    }
                }
                if (author !== username && title.indexOf(username) === -1) {
                    amount = amount + "★";
                }
                if (reaction_container.firstChild.id === "pr-reactions") {
                    reaction_container.firstChild.text = amount;
                } else {
                    element.id = "pr-reactions";
                    element.title = title;
                    element.alt = title;
                    element.classList = "pr-reaction text-small text-bold";
                    element.appendChild(create_img_element());
                    element.appendChild(create_span_element(amount));
                    reaction_container.insertBefore(element, reaction_container.firstChild);
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

function generate_message () {
    var username, message;
    username = document.querySelector("meta[name='user-login']").getAttribute("content");
    message = username + " likes the pull request";
    return message;
}

function generate_hipchat_payload() {
    var payload,
        username = document.querySelector("meta[name='user-login']").getAttribute("content");

    payload = {
        "color": "purple",
        "from": username,
        "message_format": "text",
        "message": generate_message() + " " + location.href,
        "notify": true,
        "card": {
            "style": "application",
            "format": "compact",
            "url": location.href,
            "id": "pr-reactions",
            "title": document.title,
            "description": generate_message(),
            "icon": {
                "url": "https://github.com/fluidicon.png"
            },
            "date": new Date()
        }
    };
    return payload;
}

function generate_slack_payload() {
    var payload = {
        "attachments": [
            {
                "fallback": generate_message() + " " + location.href,
                "color": "#ab5ebc",
                "pretext": generate_message(),
                "title": document.title,
                "title_link": location.href,
            }
        ]
    };
    return payload;
}

function notify_hipchat() {
    if (settings.hipchat_notify && settings.hipchat_url) {
        chrome.runtime.sendMessage({
            "hipchat": {
                "notify_thumb_up": {
                    "data": generate_hipchat_payload(),
                    "url": settings.hipchat_url
                }
            }
        });
    }
}

function notify_slack() {
    if (settings.slack_notify && settings.slack_url) {
        chrome.runtime.sendMessage({
            "slack": {
                "notify_thumb_up": {
                    "data": generate_slack_payload(),
                    "url": settings.slack_url
                }
            }
        });
    }
}

function on_click (event) {
    var reaction_button_clicked = false,
        data_channel;
    var node = event.target;
    while (node) {
        if ("getAttribute" in node) {
            if (!reaction_button_clicked && node.nodeName === "BUTTON") {
                if (node.getAttribute("value") === "THUMBS_UP react") {
                    reaction_button_clicked = true;
                }
            }

            data_channel = node.getAttribute("data-channel");
            if (reaction_button_clicked && data_channel) {
                if (data_channel.indexOf(":pull-request:") > 0
                    && is_correct_location("github.com/" + settings.organization + "/")) {
                    notify_hipchat();
                    notify_slack();
                    break;
                }
                // Separate comment
                if (data_channel.indexOf(":issue-comment:") > 0) {
                    break;
                }
                // In-code comment
                if (data_channel.indexOf(":pull-request-review-comment:") > 0) {
                    break;
                }
            }
            node = node.parentNode;
        } else {
            return;
        }
    }
}

function attach_click_event () {
    if ((settings.hipchat_notify || settings.slack_notify) && is_correct_location("/pull/")) {
        window.removeEventListener("click", on_click);
        window.addEventListener("click", on_click);
    }
}

function update_number_of_pending_pull_requests(element) {
    // The way to get opened pull requests with github is to fetch all repositories
    // from the organization and request opened pull requests after
    var last_data = window.sessionStorage.getItem("pr-reactions:pending_prs:timestamp");

    element.setAttribute("pending_pr", 0);
    if (last_data && last_data > new Date().getTime() - pending_prs_cache) {
        var number = window.sessionStorage.getItem("pr-reactions:pending_prs:value");
        element.setAttribute("pending_pr", number);
        element.textContent = pending_prs_label + " (" + number + ")";
    } else {
        var url_repos = "https://api.github.com/orgs/" + settings.organization + "/repos?access_token=" + settings.token;
        fetch(url_repos, {
            headers: {
                "Accept": "application/vnd.github.squirrel-girl-preview"
            }
        }).then(function(response) {
            if (response.ok) {
                return response.json().then(function(json) {
                    for (var i=0; i < json.length; i++) {
                        var url_pull_requests = "https://api.github.com/repos/" + settings.organization + "/";
                        url_pull_requests += json[i].name + "/pulls?access_token=" + settings.token;
                        fetch(url_pull_requests, {
                            headers: {
                                "Accept": "application/vnd.github.squirrel-girl-preview"
                            }
                        }).then(function(response) {
                            if (response.ok) {
                                return response.json().then(function(json) {
                                    for (var i=0; i < json.length; i++) {
                                        if (settings.hide_not_ready && json[i].title.indexOf(not_ready_prs_key) > -1) {
                                            continue;
                                        } else {
                                            var number = element.getAttribute("pending_pr");
                                            element.setAttribute("pending_pr", parseInt(number, 10) + 1);
                                            element.textContent = pending_prs_label + " (" + element.getAttribute("pending_pr") + ")";
                                            window.sessionStorage.setItem("pr-reactions:pending_prs:timestamp", new Date().getTime());
                                            window.sessionStorage.setItem("pr-reactions:pending_prs:value", element.getAttribute("pending_pr"));
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

}

function start () {
    var elements, issues, i;
    if (is_correct_location("/pulls")) {
        elements = document.querySelectorAll("div.issues-listing div");
        issues = get_issues(elements);
        for (i = 0; i < issues.length; i = i + 1) {
            get_reactions(issues[i]);
        }

    }

    if (settings.word_wrap) {
        elements = document.querySelectorAll("pre > code");
        for (i = 0; i < elements.length; i = i + 1) {
            elements[i].classList = "pr-reaction-word-wrap " + elements[i].classList;
        }
    }

    if (settings.assigned_issues) {
        var element = document.querySelector("ul[role='navigation'] a[href='/issues']");
        if (element) {
            element.textContent = "Assigned issues";
            element.href = "//github.com/issues/assigned/?q=is%3Aopen+sort%3Aupdated-desc";
        }
    }

    if (settings.remove_marketplace) {
        var element = document.querySelector("ul[role='navigation'] a[href='/marketplace']");
        if (element) {
            element.parentNode.remove();
        }
    }

    if (settings.pending_pull_requests && settings.organization) {
        var container = document.querySelector("ul[role='navigation']"),
            sample = container.querySelector("a[href='/pulls']"),
            pending_pr_element, pending_pr_element_container, url;

        pending_pr_element = document.querySelector("#pr-reactions_pending_pr");
        if (!pending_pr_element) {
            pending_pr_element = document.createElement("a");
            url = "/pulls?q=is:open is:pr user:" + settings.organization;
            if (settings.hide_not_ready) {
                url =url + " NOT " + not_ready_prs_key + " in:title";
            }
            pending_pr_element.href = url;
            pending_pr_element.setAttribute("aria-label", "Pending pull requests in your organization");
            pending_pr_element.className = sample.className.replace(" selected ", " ");
            pending_pr_element.textContent = pending_prs_label + " (0)";
            pending_pr_element.setAttribute("pending_pr", 0);
            pending_pr_element.id = "pr-reactions_pending_pr";

            pending_pr_element_container = document.createElement("li");
            pending_pr_element_container.className = sample.parentElement.className;

            pending_pr_element_container.appendChild(pending_pr_element);
            container.insertBefore(pending_pr_element_container, container.firstChild);
        }
        update_number_of_pending_pull_requests(pending_pr_element);
    }
}

function load_options() {
    chrome.storage.local.get(OPTIONS, function (storage_obj) {
        settings = storage_obj;
        start();
        attach_click_event();
    });
}

function init () {
    load_options();

    // Github uses pjax to switch tabs
    document.addEventListener("pjax:success", function () {
        attach_click_event();
        start();
    });
}

ready(init);
