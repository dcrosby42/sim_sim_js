class ClientMessageFactory
  turnFinished: (turnNumber, checksum) ->
    {
      type: 'ClientMsg::TurnFinished'
      turnNumber: turnNumber
      checksum: checksum
    }

  gamestate: (forPlayerId, protoTurn, gamestate) ->
    {
      type: 'ClientMsg::Gamestate'
      forPlayerId: forPlayerId
      protoTurn: protoTurn
      data: gamestate
    }

  event: (data) ->
    {
      type: 'ClientMsg::Event'
      data: data
    }

module.exports = ClientMessageFactory
