
class SocketIOClientAdapter extends SimultSim.EventEmitter
  constructor: (@socket) ->
    @socket.on 'data', (data) =>
      @emit 'ClientAdapter::Packet', data
    @socket.on 'disconnect', =>
      @emit 'ClientAdapter::Disconnect'
  
  send: (data) ->
    @socket.emit 'data', data

window.SimultSim.SocketIOClientAdapter = SocketIOClientAdapter
