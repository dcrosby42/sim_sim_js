port       = 4050
verbose    = true

logfmt     = require('logfmt')
express    = require('express')
expressApp = express()
httpServer = require('http').createServer(expressApp)
socketIO   = require('socket.io').listen(httpServer)
simultSim  = require('./simult_sim')

simultSimServer = simultSim.create.socketIOServer(socketIO: socketIO)

expressApp.use logfmt.requestLogger()
expressApp.use express.static("#{__dirname}/public")

logfmt.log port: port
httpServer.listen port
