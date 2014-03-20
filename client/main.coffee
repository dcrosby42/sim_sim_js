
socket = io.connect(location.toString())

SocketIOClientAdapter = require './simult_sim/socket_io_client_adapter.coffee'
adapter = new SocketIOClientAdapter(socket)

adapter.on 'ClientAdapter::Packet', (data) ->
  console.log "ClientAdapter::Packet", data
  
adapter.on 'ClientAdapter::Disconnect', ->
  console.log "ClientAdapter::Disconnect", data
  console.log "DISCONNECTED!"

console.log "Main done."
