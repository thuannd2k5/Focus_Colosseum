const Accelerometer = {
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  setUpdateInterval: jest.fn(),
  removeAllListeners: jest.fn()
};

module.exports = {
  Accelerometer
};
