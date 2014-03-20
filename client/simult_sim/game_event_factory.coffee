class GameEventFactory
  disconnect: ->
    {
      type: 'GameEvent::Disconnect'
    }

  gamestateRequest: (f) ->
    {
      type: 'GameEvent::GamestateRequest'
      gamestateClosure: f
    }

  startGame: (ourId, turnPeriod, currentTurn, gamestate) ->
    {
      type: 'GameEvent::StartGame'
      ourId: ourId
      turnPeriod: turnPeriod
      currentTurn: currentTurn
      gamestate: gamestate
    }

  turnComplete: (turnNumber, events, checksumClosure) ->
    {
      type: 'GameEvent::TurnComplete'
      turnNumber: turnNumber 
      events: events
      checksumClosure: checksumClosure
    }

module.exports = GameEventFactory
