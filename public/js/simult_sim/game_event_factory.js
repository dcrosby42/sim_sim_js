(function() {
  var GameEventFactory;

  GameEventFactory = (function() {
    function GameEventFactory() {}

    GameEventFactory.prototype.disconnect = function() {
      return {
        type: 'GameEvent::Disconnect'
      };
    };

    GameEventFactory.prototype.gamestateRequest = function(f) {
      return {
        type: 'GameEvent::GamestateRequest',
        gamestate_closure: f
      };
    };

    GameEventFactory.prototype.startGame = function() {
      return {
        type: 'GameEvent::StartGame',
        ourId: ourId,
        turnPeriod: turnPeriod,
        currentTurn: currentTurn,
        gamestate: gamestate
      };
    };

    GameEventFactory.prototype.turnComplete = function(turnNumber, events, checksumClosure) {
      return {
        type: 'GameEvent::TurnComplete',
        turnNumber: turnNumber,
        events: events,
        checkusmClosure: checksumClosure
      };
    };

    return GameEventFactory;

  })();

}).call(this);
