EventEmitter = require './event_emitter.coffee'

class SocketIOClientAdapter extends EventEmitter
  constructor: (@socket) ->
    @socket.on 'data', (data) =>
      @_debug "rec'd data: ",data
      @emit 'ClientAdapter::Packet', data
    @socket.on 'disconnect', =>
      @_debug "rec'd disconnect"
      @emit 'ClientAdapter::Disconnected'
  
  send: (data) ->
    @_debug "send", data
    @socket.emit('data', data)

  disconnect: ->
    @socket.disconnect()

  _debug: (args...) ->
    console.log "[SocketIOClientAdapter]", args... if @_debugOn


module.exports = SocketIOClientAdapter
