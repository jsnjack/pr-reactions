var icon_size = 20,
    pending_prs_cache = 15 * 1000,
    settings = {},
    pending_prs_label = "Pending prs",
    not_ready_prs_key = "WIP";
var OPTIONS = [
    "word_wrap", "assigned_issues", "organization",
    "modify_pr_page", "hide_not_ready", "remove_marketplace",
    "create_pr"
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

function start () {
    if (settings.word_wrap) {
        elements = document.querySelectorAll("pre > code");
        for (i = 0; i < elements.length; i = i + 1) {
            elements[i].classList = "pr-reaction-word-wrap " + elements[i].classList;
        }
    }

    if (settings.assigned_issues) {
        var element = document.querySelector(".Header nav").querySelector("a[href='/issues']");
        if (element) {
            element.textContent = "Assigned issues";
            element.href = "//github.com/issues/assigned/?q=is%3Aopen+sort%3Aupdated-desc";
        }
    }

    if (settings.create_pr && settings.organization) {
        var element = document.querySelector(".Header nav").querySelector("a[href='/marketplace']");
        if (element) {
            element.textContent = "Create a pr";
            element.href = "//github.com/" + settings.organization +"/cobro/compare";
        }
    }

    if (settings.remove_marketplace) {
        var element = document.querySelector(".Header nav").querySelector("a[href='/marketplace']");
        if (element) {
            element.remove();
        }
    }

    if (settings.modify_pr_page) {
        // TODO: replace with MO
        setTimeout(function () {
            var pr_statuses = document.querySelectorAll("#js-issues-toolbar span.opened-by + span a");
            for (var st of pr_statuses) {
                st.textContent = st.getAttribute("aria-label");
            }
        }, 1000);

        if (settings.organization) {
            var me = document.querySelector("meta[name='user-login']").getAttribute("content");
            var not_ready = `NOT ${not_ready_prs_key} in:title draft:false`;

            // All
            var element = document.querySelector("#js-pjax-container nav > a[aria-label='Pull Requests assigned to you']");
            if (element) {
                element.textContent = "All";
                element.setAttribute("aria-label", "All created pull requests in organization");
                var url = `/pulls?q=is:open is:pr archived:false user:${settings.organization}`;
                if (settings.hide_not_ready) {
                    url = `${url} ${not_ready}`;
                }
                element.href = url;
            }

            // Approved
            var element = document.querySelector("#js-pjax-container nav > a[title='Pull Requests mentioning you']");
            if (element) {
                element.textContent = "Approved";
                element.setAttribute("aria-label", "All approved pull requests in organization");
                var url = `/pulls?q=is:open is:pr archived:false review:approved user:${settings.organization}`;
                if (settings.hide_not_ready) {
                    url = `${url} ${not_ready}`;
                }
                element.href = url;
            }

            // Review requests
            var element = document.querySelector("#js-pjax-container nav > a[title='Pull Requests requesting your review']");
            if (element) {
                var url = `/pulls?q=is:open is:pr archived:false user:${settings.organization} review-requested:${me}`;
                if (settings.hide_not_ready) {
                    url = `${url} ${not_ready}`;
                }
                element.href = url;
            }

            // Created
            var element = document.querySelector("#js-pjax-container nav > a[aria-label='Pull Requests created by you']");
            if (element) {
                var url = `/pulls?q=is:open is:pr archived:false user:${settings.organization} author:${me}`;
                element.href = url;
            }

            // Button in the header
            var element = document.querySelector(".Header nav").querySelector("a[href='/pulls']");
            if (element) {
                var url = "/pulls?q=is:open is:pr archived:false user:" + settings.organization;
                url += " review-requested:" + document.querySelector("meta[name='user-login']").getAttribute("content");
                if (settings.hide_not_ready) {
                    url = `${url} ${not_ready}`;
                }
                element.href= url;
            }
        }
    }
}

function load_options() {
    chrome.storage.local.get(OPTIONS, function (storage_obj) {
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
