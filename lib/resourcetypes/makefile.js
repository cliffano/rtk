"use strict"
import fs from 'fs';
import makefileParser from '@kba/makefile-parser';

/**
 * Set version value in the Makefile resource's variable (variable defines the variable name that contains the version).
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, Makefile won't be modified
 * @param {Function} cb: standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const variable = resource.params.variable;
  let content = fs.readFileSync(resource.path, 'UTF-8');
  let data = makefileParser(content);

  data.ast.forEach(function (elem) {
    if (elem.variable && elem.variable === variable) {
      const matches = content.match(new RegExp(elem.variable + '.*' + elem.value));
      if (matches && matches.length === 1) {
        content = content.replace(matches[0], matches[0].replace(elem.value, version));
      }
    }
  });
  if (!opts.dryRun) {
    fs.writeFile(resource.path, content, cb);
  } else {
    cb();
  }
}

/**
 * Get version value from the Makefile resource's variable (variable defines the variable name that contains the version).
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Function} cb: standard cb(err, result) callback
 */
function getVersion(resource, cb) {
  const variable = resource.params.variable;

  function readCb(err, result) {
    let version;
    if (!err) {
      const data = makefileParser(result);
      data.ast.forEach(function (elem) {
        if (elem.variable && elem.variable === variable) {
          version = elem.value;
        }
      });
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
