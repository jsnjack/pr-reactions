chrome.runtime.onMessage.addListener(content_script_message);

function content_script_message(message) {
    if (message.hipchat && message.hipchat.notify_thumb_up) {
        if (message.hipchat.notify_thumb_up.url) {
            fetch(message.hipchat.notify_thumb_up.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(message.hipchat.notify_thumb_up.data)
            });
        }
    }
}
