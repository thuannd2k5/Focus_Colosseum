const activateKeepAwakeAsync = jest.fn().mockResolvedValue(undefined);
const deactivateKeepAwake = jest.fn();

module.exports = {
  activateKeepAwakeAsync,
  deactivateKeepAwake
};
