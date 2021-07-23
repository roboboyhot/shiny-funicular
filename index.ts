import * as express from 'express'
import { createServer } from 'http'
import * as socket from 'socket.io'
import * as path from 'path'
import * as ejs from 'ejs'
import { throws } from 'assert';

class Server {
    _app: any = express()
    _server: any = createServer(this._app)
    _io: any = socket(this._server)
    _messages: any = []

    constructor(){
        this.serveStaticFiles()
        this.renderStaticFiles()
        this.startServer()
        this.handleConnection()
    }

    serveStaticFiles(){
        this._app.use(express.static(path.join(__dirname, 'public')))
        this._app.set('views', path.join(__dirname, 'public'))
        this._app.engine('html', ejs.renderFile)
        this._app.set('view engine', 'html')
    }

    renderStaticFiles(){
        this._app.use('/', (req, res) => {
            res.render('index.html')
        })
    }

    startServer(){
        this._server.listen(process.env.PORT || 3000, () => {
            console.log(`=> Server running... [PORT ${process.env.PORT || 3000}]`)
        })
    }

    handleConnection(){
        this._io.on('connection', socket => {
            console.log(`Socket connected: ${socket.id}`)
            socket.emit('previousMessages', this._messages)

            socket.on('sendMessage', data => {
                this._messages.push(data)
                socket.broadcast.emit('receivedMessage', data)
            })
        })
    }
}

new Server