SimulationStateFactory = require '../../../client/simult_sim/simulation_state_factory'

describe 'SimulationStateFactory', ->
  beforeEach ->
    @world = {the_default: 'world data'}
    @createWorld = -> {the_generated: 'world data'}

    @subject = new SimulationStateFactory
      timePerTurn: 0.25
      stepsPerTurn: 7
      world: @world

  describe 'createSimulationState', ->
    it 'returns a new SimulationState instance using the constructed defaults', ->
      simState = @subject.createSimulationState()
      expect(simState.timePerTurn).toEqual 0.25
      expect(simState.stepsPerTurn).toEqual 7

    describe 'when "world" is set explicitly in defaults', ->
      it 'installs that world into new simState objects', ->
        simState = @subject.createSimulationState()
        expect(simState.world).toEqual @world

    describe 'when "createWorld" constructor function is set in the defaults', ->
      beforeEach ->
        @subject = new SimulationStateFactory
          timePerTurn: 0.25
          stepsPerTurn: 7
          createWorld: @createWorld
      
      it 'invokes the function to provide new world instances', ->
        simState = @subject.createSimulationState()
        expect(simState.world).toEqual {the_generated: 'world data'}

    describe 'when both "world" and "createWorld" constructor function are set in the defaults', ->
      beforeEach ->
        @subject = new SimulationStateFactory
          timePerTurn: 0.25
          stepsPerTurn: 7
          world: @world
          createWorld: @createWorld

      it 'prefers the installed "world"', ->
        simState = @subject.createSimulationState()
        expect(simState.world).toEqual @world

      
    

