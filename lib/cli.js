"use strict"
import bag from 'bagofcli';
import RTK from './rtk.js';

function _release(args) {

  let opts = {};

  const configFile = args && args.parent && args.parent.configFile ? args.parent.configFile : '.rtk.json';
  const config = JSON.parse(bag.lookupFile(configFile));
  opts.dryRun = args.parent.dryRun;

  opts.releaseIncrementType = args.releaseIncrementType || 'minor';
  opts.postReleaseIncrementType = args.postReleaseIncrementType || 'patch';
  opts.tagFormat = config.tagFormat || '{version}';

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

const exports = {
  exec: exec
};

export {
  exports as default
};