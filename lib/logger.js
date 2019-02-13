const chalk = require('chalk');

/**
 * Displays release step heading message on the console.
 *
 * @param {String} message: the message string to display
 */
function logStepHeading(message) {
  console.log(chalk.bold.cyan(message));
}

/**
 * Displays release step item message on the console.
 *
 * @param {String} message: the message string to display
 */
function logStepItem(message) {
  console.log('  * %s', chalk.green(message));
}

module.exports = {
  logStepHeading: logStepHeading,
  logStepItem: logStepItem
};