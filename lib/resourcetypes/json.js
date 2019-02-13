const dotProp = require('dot-prop');
const fs = require('fs');

/**
 * Set version value in the JSON resource's property (defined in dot-notation).
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, JSON file won't be modified
 */
function setVersion(version, resource, opts) {
  const property = resource.params.property;
  let data = JSON.parse(fs.readFileSync(resource.path, 'UTF-8'));
  dotProp.set(data, property, version);
  if (!opts.dryRun) {
    fs.writeFileSync(resource.path, JSON.stringify(data, null, 2));
  }
}

/**
 * Get version value from the JSON resource's property (defined in dot-notation).
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 */
function getVersion(resource) {
  const property = resource.params.property;
  const data = JSON.parse(fs.readFileSync(resource.path, 'UTF-8'));
  return dotProp.get(data, property);
}

module.exports = {
  setReleaseVersion: setVersion,
  setPostReleaseVersion: setVersion,
  getVersion: getVersion
};