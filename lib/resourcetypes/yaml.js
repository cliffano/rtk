const dotProp = require('dot-prop');
const fs = require('fs');
const jsYaml = require('js-yaml');

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
  let data = jsYaml.safeLoad(fs.readFileSync(resource.path, 'UTF-8'));
  dotProp.set(data, property, version);
  if (!opts.dryRun) {
    fs.writeFile(resource.path, jsYaml.safeDump(data, { indent: 2 }), cb);
  } else {
    cb();
  }
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
      const data = jsYaml.safeLoad(result);
      version = dotProp.get(data, property);
    }
    cb(err, version);
  }
  fs.readFile(resource.path, 'UTF-8', readCb);
}

module.exports = {
  setReleaseVersion: setVersion,
  setPostReleaseVersion: setVersion,
  getVersion: getVersion
};