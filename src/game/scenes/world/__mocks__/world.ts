const entityGroup = {
  getTotalUsed: jest.fn(() => 0),
};

const world = {
  getTime: jest.fn(() => 0),
  isTimePaused: jest.fn(() => false),
  setTimePause: jest.fn(),
  spawnEnemy: jest.fn(),
  spawner: {
    getSpawnPosition: jest.fn(() => Promise.resolve({ x: 0, y: 0 })),
  },
  game: {
    screen: {
      notice: jest.fn(),
    },
  },
  entityGroups: {
    enemy: entityGroup,
  },
  getEntities: jest.fn(() => 0),
  getEntitiesGroup: jest.fn(() => entityGroup),
  level: {
    looseEffects: jest.fn(),
  },
  player: {},
  input: {
    keyboard: {
      on: jest.fn(),
      off: jest.fn(),
    },
  },
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
  fx: {
    playSound: jest.fn(),
  },
};

export default world;
