"use strict";
/**
 * @module cli
 */
import bag from "bagofcli";
import p from "path";
import { fileURLToPath } from 'url';
import RTK from "./rtk.js";

const DIRNAME = p.dirname(import.meta.url).replace("file://", "");

/**
 * Handle release command by loading RTK configuration file and running a
 * release using the resources and schemes defined in that configuration.
 *
 * @private
 * @param {Object} args - command options passed by bagofcli
 * @param {String} [args.configFile=.rtk.json] - RTK configuration file
 * @param {Boolean} [args.dryRun] - when true, no change will be made
 * @param {String} [args.releaseIncrementType=minor] - major, minor, or patch
 * @param {String} [args.postReleaseIncrementType=patch] - major, minor, or
 *   patch
 */
function _release(args) {
  const opts = {};

  const configFile = args.configFile || ".rtk.json";
  const config = JSON.parse(bag.lookupFile(configFile));
  opts.dryRun = args.dryRun;

  opts.releaseIncrementType = args.releaseIncrementType || "minor";
  opts.postReleaseIncrementType = args.postReleaseIncrementType || "patch";
  opts.tagFormat = config.tagFormat || "{version}";

  const rtk = new RTK(config.resources, opts);
  rtk.release(
    config.releaseScheme,
    config.versionScheme,
    config.scmScheme,
    bag.exit,
  );
}

/**
 * Execute RTK CLI.
 */
function exec() {
  const actions = {
    commands: {
      release: { action: _release },
    },
  };

  bag.command(DIRNAME, actions);
}

const exports = {
  exec: exec,
};

export {
  exports as default
};
