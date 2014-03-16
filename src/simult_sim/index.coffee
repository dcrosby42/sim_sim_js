

createServer = (opts={}) ->
  TurnManager           = require './turn_manager'
  ServerMessageFactory  = require './server_message_factory'
  Server                = require './server'
  period = opts.period || 100
  adapter = opts.adapter || raise("adapter required")
  turnManager = opts.turnManager || new TurnManager(period)
  serverMessageFactory = opts.serverMessageFactory || new ServerMessageFactory()
  server = new Server(adapter, turnManager, serverMessageFactory)
  server
  
createSocketIOServerAdapter = (socketIO) ->
  SocketIOServerAdapter = require './socket_io_server_adapter'
  socketIO or raise("socketIO required")
  adapter = new SocketIOServerAdapter(socketIO)
  adapter

createServerUsingSocketIO = (opts={}) ->
  opts.adapter = createSocketIOServerAdapter(opts.socketIO)
  createServer(opts)

exports.create =
  server: createServer
  socketIOServer: createServerUsingSocketIO
