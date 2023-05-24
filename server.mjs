/**
 * @typedef {object} MessageType
 * @property {boolean} [isConnectionMessage]
 * @property {boolean} [isDisconnectionMessage]
 */

/**
 * @typedef {object} Message
 * @property {string} from
 * @property {string | null} data
 * @property {object} [headers]
 * @property {string} [httpVersion]
 * @property {MessageType} type
 */

/**
 * @typedef {(message: Message) => void} SendMessage
 */

import { WebSocket, WebSocketServer } from "ws"

const wsServer = new WebSocketServer({ port: 5000 })

wsServer.on('connection', function conn(ws, req) {

    const currentClient = req.headers['sec-websocket-key']
    console.log(`\n\n${currentClient} just got connected\nclients connected: ${wsServer.clients.size}\n`)

    /** 
     * @type {SendMessage}
     * ? broadcast to all clients except the current client who is sending the message
     */
    function broadcast(message) {
        
        const stringifiedMessage = JSON.stringify(message)

        wsServer.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(stringifiedMessage, (err) => {
                    if (err) {
                        console.log(err)
                        return;
                    }
                })
            }
        })
    }

    /** 
     * @type {SendMessage}
     * ? send the "id" to the client on connection
     */
    function sendToCurrentClient(message) {
        ws.send(JSON.stringify(message), (err) => {
            if (err) {
                console.log(err)
                return;
            }
        })
    }


    ws.on('error', console.error)

    sendToCurrentClient({
        from: currentClient,
        data: null,
        headers: req.headers,
        httpVersion: req.httpVersion,
        type: {
            isConnectionMessage: false
        }
    })

    broadcast({
        from: currentClient,
        data: `${currentClient} just got connected`,
        type: {
            isConnectionMessage: true
        }
    })

    ws.on('message', (data) => {

        const incomingMessage = data.toString('utf8')

        const outgoingMessage = {
            from: currentClient,
            data: incomingMessage,
            type: {
                isConnectionMessage: false
            }
        }

        broadcast(outgoingMessage)
    })

    ws.on("close", () => {

        console.log(`\n\n${currentClient} closed the connection\nRemaining clients ${wsServer.clients.size}\n`)

        broadcast({
            from: currentClient,
            data: `${currentClient} just left the chat`,
            type: {
                isConnectionMessage: false,
                isDisconnectionMessage: true
            }
        })
    })
})
