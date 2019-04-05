chrome.runtime.onMessage.addListener(content_script_message);

function content_script_message(message) {
    if (message.slack && message.slack.notify_thumb_up) {
        fetch(message.slack.notify_thumb_up.url, {
            method: "POST",
            body: JSON.stringify(message.slack.notify_thumb_up.data)
        });
    }
}
