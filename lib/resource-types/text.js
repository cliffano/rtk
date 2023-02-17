"use strict"
import fs from 'fs';

/**
 * Set version value in the text resource where there are matches to the regex.
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, text file won't be modified
 * @param {Function} cb: standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const regex = resource.params.regex;
  let data = fs.readFileSync(resource.path, 'UTF-8');
  data = data.replaceAll(new RegExp(regex, 'g'), version);
  if (!opts.dryRun) {
    fs.writeFile(resource.path, data, cb);
  } else {
    cb();
  }
}

/**
 * Get version value from the text resource based on regex matches.
 * 
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Function} cb: standard cb(err, result) callback
 */
function getVersion(resource, cb) {
  const regex = resource.params.regex;

  function readCb(err, result) {
    let version;
    if (!err) {
      const data = result.match(new RegExp(regex));
      version = data[0];
    }
    cb(err, version);
  }
  fs.readFile(resource.path, 'UTF-8', readCb);
}

const exports = {
  setReleaseVersion: setVersion,
  setPostReleaseVersion: setVersion,
  getVersion: getVersion
};

export {
  exports as default
};
