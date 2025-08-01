"use strict";
import {getProperty, setProperty} from 'dot-prop';
import fs from 'fs';

/**
 * Set version value in the JSON resource's property (defined in dot-notation).
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, JSON file won't be modified
 * @param {Function} cb: standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const property = resource.params.property;
  const data = JSON.parse(fs.readFileSync(resource.path, 'UTF-8'));
  setProperty(data, property, version);
  if (!opts.dryRun) {
    fs.writeFile(resource.path, JSON.stringify(data, null, 2), cb);
  } else {
    cb();
  }
}

/**
 * Get version value from the JSON resource's property (defined in dot-notation).
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Function} cb: standard cb(err, result) callback
 */
function getVersion(resource, cb) {
  const property = resource.params.property;

  function readCb(err, result) {
    let version;
    if (!err) {
      const data = JSON.parse(result);
      version = getProperty(data, property);
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
