"use strict";
import bag from 'bagofcli';
import {getProperty} from 'dot-prop';
import fs from 'fs';
import hcl from 'hcl2-parser';

/**
 * Set version value in the HCL resource's property (defined in dot-notation).
 * This will use hcledit CLI tool (https://github.com/minamijoyo/hcledit) to
 * modify the HCL file because there is no node.js library that can write HCL
 * files in a safe way while preserving original formatting. NOTE: hcledit
 * must be installed and available in the PATH for this to work.
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, HCL file won't be modified
 * @param {Function} cb: standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  if (!opts.dryRun) {
    const property = resource.params.property;
    function execCb(err, stdOutOuput, stdErrOuput, result) {
      cb(err);
    };
    bag.exec(`hcledit attribute set ${property} ${version} -f ${resource.path} -u`, false, execCb);
  } else {
    cb();
  }
}

/**
 * Get version value from the HCL resource's property (defined in dot-notation).
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Function} cb: standard cb(err, result) callback
 */
function getVersion(resource, cb) {
  const property = resource.params.property;

  function readCb(err, result) {
    let version;
    if (!err) {
      const data = hcl.parseToObject(result)[0];
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
