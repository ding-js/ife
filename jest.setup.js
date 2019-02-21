const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({
  toMatchImageSnapshot: configureToMatchImageSnapshot({
    failureThreshold: 0.01,
    failureThresholdType: 'percent'
  })
});
