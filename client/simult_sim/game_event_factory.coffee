class GameEventFactory
  disconnect: ->
    {
      type: 'GameEvent::Disconnect'
    }

  gamestateRequest: (f) ->
    {
      type: 'GameEvent::GamestateRequest'
      gamestate_closure: f
    }

  startGame: ->
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
      checkusmClosure: checksumClosure
    }
