(function() {
  var SocketIOClientAdapter, adapter, socket;

  socket = io.connect(location.toString());

  SocketIOClientAdapter = require('./simult_sim/socket_io_client_adapter.coffee');

  adapter = new SocketIOClientAdapter(socket);

  adapter.on('ClientAdapter::Packet', function(data) {
    return console.log("ClientAdapter::Packet", data);
  });

  adapter.on('ClientAdapter::Disconnect', function() {
    console.log("ClientAdapter::Disconnect", data);
    return console.log("DISCONNECTED!");
  });

  console.log("Main done.");

}).call(this);
