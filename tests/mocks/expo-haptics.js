const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error'
};

const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy'
};

const notificationAsync = jest.fn().mockResolvedValue(undefined);
const impactAsync = jest.fn().mockResolvedValue(undefined);

module.exports = {
  NotificationFeedbackType,
  ImpactFeedbackStyle,
  notificationAsync,
  impactAsync
};
