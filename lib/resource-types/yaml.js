"use strict";
import {getProperty, setProperty} from 'dot-prop';
import fs from 'fs';
import jsYaml from 'js-yaml';

/**
 * Set version value in the YAML resource's property (defined in dot-notation).
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, YAML file won't be modified
 * @param {Function} cb: standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const property = resource.params.property;
  const data = jsYaml.load(fs.readFileSync(resource.path, 'UTF-8'));
  setProperty(data, property, version);
  if (!opts.dryRun) {
    fs.writeFile(resource.path, _yamlDumpWithHeader(data), cb);
  } else {
    cb();
  }
}

/**
 * Prepend YAML header (--- document separator) if missing.
 * @param {String} data: the YAML data
 * @returns {String} the YAML data with header
 */
function _yamlDumpWithHeader(data) {
  const _data = jsYaml.dump(data, { indent: 2 });
  return _data.startsWith('---\n') ? _data : `---\n${_data}`;
}

/**
 * Get version value from the YAML resource's property (defined in dot-notation).
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Function} cb: standard cb(err, result) callback
 */
function getVersion(resource, cb) {
  const property = resource.params.property;

  function readCb(err, result) {
    let version;
    if (!err) {
      const data = jsYaml.load(result);
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
