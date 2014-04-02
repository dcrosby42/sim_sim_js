port       = 4050
verbose    = true
appRoot = "#{__dirname}/.."

logfmt     = require('logfmt')
express    = require('express')
expressApp = express()
httpServer = require('http').createServer(expressApp)
socketIO   = require('socket.io').listen(httpServer, log: false)
simultSim  = require('./simult_sim')

simultSimServer = simultSim.create.socketIOServer(
  socketIO: socketIO
  period: 100
)

expressApp.use logfmt.requestLogger()
expressApp.use express.static("#{appRoot}/public")

logfmt.log port: port
httpServer.listen port
