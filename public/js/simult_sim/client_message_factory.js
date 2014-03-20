(function() {
  var ClientMessageFactory;

  ClientMessageFactory = (function() {
    function ClientMessageFactory() {}

    ClientMessageFactory.prototype.turnFinished = function(turnNumber, checksum) {
      return {
        type: 'ClientMsg::TurnFinished',
        turnNumber: turnNumber,
        checksum: checksum
      };
    };

    ClientMessageFactory.prototype.gamestate = function(forPlayerId, protoTurn, gamestate) {
      return {
        type: 'ClientMsg::Gamestate',
        forPlayerId: forPlayerId,
        protoTurn: protoTurn,
        gamestate: gamestate
      };
    };

    ClientMessageFactory.prototype.event = function(data) {
      return {
        type: 'ClientMsg::Event',
        data: data
      };
    };

    return ClientMessageFactory;

  })();

}).call(this);
