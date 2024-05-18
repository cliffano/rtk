"use strict"
import {getProperty, setProperty} from 'dot-prop';
import fs from 'fs';
import hcl2 from 'hcl2-json-parser';
import hcl from 'js-hcl-parser';

/**
 * Set version value in the HCL resource's property (defined in dot-notation).
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, HCL file won't be modified
 * @param {Function} cb: standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const property = resource.params.property;
  let data = hcl.parse(fs.readFileSync(resource.path, 'UTF-8'));
  console.dir("OBJECTIFY");
  console.dir(data);
  setProperty(data, property, version);
  if (!opts.dryRun) {
    console.dir("STRINGIFY")
    console.dir(hcl.stringify(data))
    fs.writeFile(resource.path, hcl.stringify(data), cb);
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
      const data = hcl2.parseToObject(result);
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
