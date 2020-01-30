var bag = require('bagofcli');
var RTK = require('./rtk');

function _release(args) {

  let opts = {};

  const configFile = args && args.parent && args.parent.configFile ? args.parent.configFile : '.rtk.json';
  const config = JSON.parse(bag.lookupFile(configFile));
  opts.dryRun = args.parent.dryRun;

  opts.releaseIncrementType = args.releaseIncrementType || 'minor';
  opts.postReleaseIncrementType = args.postReleaseIncrementType || 'patch';

  const rtk = new RTK(config.resources, opts);
  rtk.release(config.releaseScheme, config.versionScheme, config.scmScheme, bag.exit);

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
