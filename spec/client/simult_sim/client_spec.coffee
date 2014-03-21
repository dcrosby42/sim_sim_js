Client = require '../../../client/simult_sim/client'
GameEventFactory = require '../../../client/simult_sim/game_event_factory'
ClientMessageFactory = require '../../../client/simult_sim/client_message_factory'
SimulationEventFactory = require '../../../client/simult_sim/simulation_event_factory'
EventEmitter = require '../../../client/simult_sim/event_emitter'

describe 'Client', ->
  adapter = null
  gameEventFactory = null
  clientMessageFactory = null
  simulationEventFactory = null
  subject = null
  gameEvents = null
  updateBlock = null

  beforeEach ->
    adapter = new EventEmitter()
    adapter.disconnect = ->
    adapter.send = (data) ->
    gameEventFactory = new GameEventFactory()
    clientMessageFactory = new ClientMessageFactory()
    simulationEventFactory = new SimulationEventFactory()
    subject = new Client(adapter, gameEventFactory, clientMessageFactory, simulationEventFactory)

    gameEvents = []
    updateBlock = (event) ->
      gameEvents.push event

  describe 'when ClientAdapter::Disconnect arrives', ->
    describe 'before game is started', ->
      it 'enqueus it internally but does not relay', ->
        adapter.emit 'ClientAdapter::Disconnect'
        subject.update updateBlock
        expect(gameEvents.length).toEqual 0
        # once game is started, the disconnect event can come out:
        subject.gameStarted = true
        subject.update updateBlock
        e = gameEvents.shift()
        expect(e.type).toEqual("GameEvent::Disconnect")
      
    describe 'after game is started', ->
      beforeEach ->
        subject.gameStarted = true
      
      it 'enqueues a Disconnect message on ClientAdapter::Disconnect', ->
        adapter.emit 'ClientAdapter::Disconnect'
        subject.update updateBlock
        e = gameEvents.shift()
        expect(e.type).toEqual("GameEvent::Disconnect")
      
  describe 'when ClientAdapter::Packet arrives', ->
    buildAndPackServerMsg = (name,info) ->
      info.type = "ServerMsg::#{name}"
      info # currently, packing server msgs is a noop

    emitServerMsgPacket = (name,info) ->
      packet = buildAndPackServerMsg name, info
      adapter.emit 'ClientAdapter::Packet', packet
      

    describe 'with ServerMsg::IdAssigned', ->
      it 'sets clientId', ->
        emitServerMsgPacket 'IdAssigned', ourId: 'the new id'
        expect(subject.clientId).toEqual 'the new id'

    describe 'with ServerMsg::Event', ->
      it 'buffers a simulation event w data', ->
        emitServerMsgPacket 'Event', sourcePlayerId: 'p1', data: 'event1 data'
        emitServerMsgPacket 'Event', sourcePlayerId: 'p2', data: 'event2 data'
        expect(subject.simulationEventsBuffer).toEqual(
          [
            simulationEventFactory.event('p1', 'event1 data')
            simulationEventFactory.event('p2', 'event2 data')
          ]
        )
    describe 'with ServerMsg::PlayerJoined', ->
      it "buffers a simulation event for player joined", ->
        emitServerMsgPacket 'PlayerJoined', playerId: 'p1'
        emitServerMsgPacket 'PlayerJoined', playerId: 'p2'
        expect(subject.simulationEventsBuffer).toEqual(
          [
            simulationEventFactory.playerJoined('p1')
            simulationEventFactory.playerJoined('p2')
          ]
        )
    describe 'with ServerMsg::PlayerLeft', ->
      it "buffers a simulation event for player left", ->
        emitServerMsgPacket 'PlayerLeft', playerId: 'p1'
        emitServerMsgPacket 'PlayerLeft', playerId: 'p2'
        expect(subject.simulationEventsBuffer).toEqual(
          [
            simulationEventFactory.playerLeft('p1')
            simulationEventFactory.playerLeft('p2')
          ]
        )

    describe 'with ServerMsg::TurnComplete', ->
      it "bundles prior sim events into a turnComplete game event", ->
        emitServerMsgPacket 'Event', sourcePlayerId: 'p1', data: 'event1 data'
        emitServerMsgPacket 'PlayerJoined', playerId: 'p2'
        emitServerMsgPacket 'PlayerLeft', playerId: 'p3'
        emitServerMsgPacket 'Event', sourcePlayerId: 'p4', data: 'another data'

        subject.update updateBlock
        expect(gameEvents.length).toEqual 0

        emitServerMsgPacket 'TurnComplete', turnNumber: 37
        
        subject.update updateBlock
        # STILL should be nothing because @gameStarted not set true yet
        expect(gameEvents.length).toEqual 0

        subject.gameStarted = true
        subject.update updateBlock
        expect(gameEvents.length).toEqual 1

        event = gameEvents.shift()
        expect(event.events).toEqual [
          simulationEventFactory.event 'p1', 'event1 data'
          simulationEventFactory.playerJoined 'p2'
          simulationEventFactory.playerLeft 'p3'
          simulationEventFactory.event 'p4', 'another data'
        ]

        console.log "Game event:",event
        expect("wat").toEqual "FINISH ME"

