EventEmitter = require './event_emitter.coffee'

class SocketIOClientAdapter extends EventEmitter
  constructor: (@socket) ->
    @socket.on 'data', (data) =>
      @emit 'ClientAdapter::Packet', data
    @socket.on 'disconnect', =>
      @emit 'ClientAdapter::Disconnected'
  
  send: (data) ->
    @socket.emit('data', data)

  disconnect: ->
    @socket.disconnect()

module.exports = SocketIOClientAdapter
