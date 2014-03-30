MyWorld = require '../../client/my_world'

describe 'MyWorld', ->
  it 'exists and can be instantiated', ->
    world = new MyWorld()
    expect(world).toBeDefined()
    atts = world.toAttributes
    expect(atts).toBeDefined()
