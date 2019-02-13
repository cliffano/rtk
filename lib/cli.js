var bag = require('bagofcli');
var RTK = require('./rtk');

function _release(args) {

  let opts = {};

  const configFile = args && args.parent && args.parent.configFile ? args.parent.configFile : '.rtk.json';
  const config = JSON.parse(bag.lookupFile(configFile));
  opts.dryRun = args.parent.dryRun;

  const rtk = new RTK(config.resources, opts);
  rtk.release(config.releaseScheme, config.versionScheme, bag.exit);

}

/**
 * Execute RTK CLI.
 */
function exec() {

  var actions = {
    commands: {
      release : { action: _release }
    }
  };

  bag.command(__dirname, actions);
}

exports.exec = exec;