"use strict";
/**
 * @module resource-types/toml
 */
import { getProperty, setProperty } from "dot-prop";
import fs from "fs";
import toml from "@iarna/toml";

/**
 * Set version value in the TOML resource's property (defined in dot-notation).
 *
 * @param {String} version - version value to set
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the TOML file
 * @param {String} resource.params.property - property in dot-notation
 * @param {Object} opts - optional settings
 * @param {Boolean} [opts.dryRun] - when true, TOML file won't be modified
 * @param {Function} cb - standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const property = resource.params.property;
  const data = toml.parse(fs.readFileSync(resource.path, "UTF-8"));
  setProperty(data, property, version);
  if (!opts.dryRun) {
    fs.writeFile(resource.path, toml.stringify(data, null, 2), cb);
  } else {
    cb();
  }
}

/**
 * Get version value from the TOML resource's property (defined in
 * dot-notation).
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the TOML file
 * @param {String} resource.params.property - property in dot-notation
 * @param {Function} cb - standard cb(err, result) callback, result is the
 *   version value
 */
function getVersion(resource, cb) {
  const property = resource.params.property;

  function readCb(err, result) {
    let version;
    if (!err) {
      const data = toml.parse(result);
      version = getProperty(data, property);
    }
    cb(err, version);
  }
  fs.readFile(resource.path, "UTF-8", readCb);
}

/**
 * Check that the TOML resource is ready for release, i.e. the file can be
 * parsed and the property exists with a value.
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the TOML file
 * @param {String} resource.params.property - property in dot-notation
 * @param {Function} cb - standard cb(err, result) callback, result is true
 *   when the resource is ready for release, an error is passed when the file
 *   is not configured, the file can't be parsed, or the property doesn't exist or has no value
 */
function isReadyForRelease(resource, cb) {
  const property = resource.params && resource.params.property;

  function readCb(err, result) {
    let ready;
    if (!err) {
      try {
        const value = getProperty(toml.parse(result), property);
        if (value === undefined) {
          err = new Error(
            `Property ${property} does not exist in TOML resource ${resource.path}`,
          );
        } else if (value === null || value === "") {
          err = new Error(
            `Property ${property} has no value in TOML resource ${resource.path}`,
          );
        } else {
          ready = true;
        }
      } catch (parseErr) {
        err = new Error(
          `Failed to parse TOML resource ${resource.path}. Error: ${parseErr.message}`,
        );
      }
    }
    cb(err, ready);
  }
  if (!property) {
    cb(
      new Error(
        `TOML resource ${resource.path} has no params.property configured`,
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
