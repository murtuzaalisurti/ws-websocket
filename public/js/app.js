// @ts-nocheck
const socketStatusElement = document.querySelector("#socketStatus")
const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws'
console.log(location.host);
const ws = new WebSocket(`${protocol}://${location.hostname}:5000`)
const messages = document.querySelector("#messages");
let firstLoad = true
let me;

function focusLast() {
    messages.scrollTop = messages.scrollHeight
    console.log(messages.scrollTop, messages.scrollHeight, messages.clientHeight);
}

function sendMessage() {
    let messageContain = document.createElement("p")
    messageContain.innerText = document.querySelector("#inputMessage").value
    messageContain.setAttribute("data-me", true)
    messages.appendChild(messageContain)

    ws.send(document.querySelector("#inputMessage").value)
    focusLast();
}

function updateWebSocketStatus() {

    function setWebSocketStatus(status) {
        socketStatusElement.innerHTML = status
    }

    switch (ws.readyState) {
        case ws.CONNECTING:
            setWebSocketStatus("Connecting...")
            break;
        case ws.OPEN:
            setWebSocketStatus("Connection established!")
            break;
        case ws.CLOSING:
            setWebSocketStatus("Closing the connection...")
            break;
        case ws.CLOSED:
            setWebSocketStatus("Connection Closed")
        default:
            break;
    }

}

updateWebSocketStatus()

document.querySelector("#sendMessage").addEventListener("click", () => {
    sendMessage()
})

document.addEventListener("keypress", (e) => {
    e.key === "Enter" && sendMessage()
})

ws.onmessage = (message) => {

    const messageObject = JSON.parse(message.data)
    console.log(messageObject);

    if (firstLoad) {
        me = messageObject.from
        firstLoad = false
    }

    if (messageObject.data) {
        let messageContain = document.createElement("p")

        if (messageObject.from && me) {
            messageObject.from === me ? (
                messageContain.setAttribute("data-me", true)
            ) : (
                messageContain.removeAttribute("data-me"),

                messageObject.type.isConnectionMessage === true ? (
                    messageContain.setAttribute("data-clientConnected", true)
                ) : (
                    messageContain.removeAttribute("data-clientConnected")
                ),

                messageObject.type.isDisconnectionMessage === true ? (
                    messageContain.setAttribute("data-clientDisconnected", true)
                ) : (
                    messageContain.removeAttribute("data-clientDisconnected")
                )
            )
        }
        messageContain.innerText = messageObject.data
        document.querySelector("#messages").appendChild(messageContain)
    }

    focusLast();
}

ws.onopen = () => {
    updateWebSocketStatus()
}

ws.onclose = () => {
    updateWebSocketStatus()
}
