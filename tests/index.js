const runFixtures = require('babel-helper-transform-fixture-test-runner');
const path = require('path');

runFixtures(path.join(__dirname, 'fixtures'), 'transform');
