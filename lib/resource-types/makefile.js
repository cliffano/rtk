"use strict";
/**
 * @module resource-types/makefile
 */
import fs from "fs";
import makefileParser from "@kba/makefile-parser";

/**
 * Set version value in the Makefile resource's variable.
 *
 * @param {String} version - version value to set
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the Makefile
 * @param {String} resource.params.variable - name of the variable which
 *   contains the version
 * @param {Object} opts - optional settings
 * @param {Boolean} [opts.dryRun] - when true, Makefile won't be modified
 * @param {Function} cb - standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const variable = resource.params.variable;
  let content = fs.readFileSync(resource.path, "UTF-8");
  const data = makefileParser(content);

  data.ast.forEach((elem) => {
    if (elem.variable && elem.variable === variable) {
      const matches = content.match(
        new RegExp(elem.variable + ".*" + elem.value),
      );
      if (matches && matches.length === 1) {
        content = content.replace(
          matches[0],
          matches[0].replace(elem.value, version),
        );
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
 * Get version value from the Makefile resource's variable.
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the Makefile
 * @param {String} resource.params.variable - name of the variable which
 *   contains the version
 * @param {Function} cb - standard cb(err, result) callback, result is the
 *   version value
 */
function getVersion(resource, cb) {
  const variable = resource.params.variable;

  function readCb(err, result) {
    let version;
    if (!err) {
      const data = makefileParser(result);
      data.ast.forEach((elem) => {
        if (elem.variable && elem.variable === variable) {
          version = elem.value;
        }
      });
    }
    cb(err, version);
  }
  fs.readFile(resource.path, "UTF-8", readCb);
}

/**
 * Check that the Makefile resource is ready for release, i.e. the variable
 * exists with a value. The Makefile parser doesn't reject invalid content, it skips the
 * lines it can't handle.
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the Makefile
 * @param {String} resource.params.variable - name of the variable which
 *   contains the version
 * @param {Function} cb - standard cb(err, result) callback, result is true
 *   when the resource is ready for release, an error is passed when the
 *   variable is not configured, doesn't exist, or has no value
 */
function isReadyForRelease(resource, cb) {
  const variable = resource.params && resource.params.variable;

  function readCb(err, result) {
    let ready;
    if (!err) {
      const data = makefileParser(result);
      const elem = data.ast.find((elem) => elem.variable === variable);
      if (!elem) {
        err = new Error(
          `Variable ${variable} does not exist in Makefile resource ${resource.path}`,
        );
      } else if (!elem.value) {
        err = new Error(
          `Variable ${variable} has no value in Makefile resource ${resource.path}`,
        );
      } else {
        ready = true;
      }
    }
    cb(err, ready);
  }
  if (!variable) {
    cb(
      new Error(
        `Makefile resource ${resource.path} has no params.variable configured`,
      ),
    );
  } else {
    fs.readFile(resource.path, "UTF-8", readCb);
  }
}

const exports = {
  setReleaseVersion: setVersion,
  setPostReleaseVersion: setVersion,
  getVersion: getVersion,
  isReadyForRelease: isReadyForRelease,
};

export { exports as default };
