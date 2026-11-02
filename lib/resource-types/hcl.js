"use strict";
/**
 * @module resource-types/hcl
 */
import bag from "bagofcli";
import { getProperty } from "dot-prop";
import fs from "fs";
import hcl from "hcl2-parser";

/**
 * Set version value in the HCL resource's property (defined in dot-notation).
 * This uses {@link https://github.com/minamijoyo/hcledit|hcledit} CLI tool to
 * modify the HCL file because there is no node.js library that can write HCL
 * files in a safe way while preserving original formatting.
 *
 * NOTE: hcledit must be installed and available in the PATH for this to work.
 *
 * @param {String} version - version value to set
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the HCL file
 * @param {String} resource.params.property - property in dot-notation
 * @param {Object} opts - optional settings
 * @param {Boolean} [opts.dryRun] - when true, HCL file won't be modified
 * @param {Function} cb - standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  if (!opts.dryRun) {
    const property = resource.params.property;
    function execCb(err, stdOutOuput, stdErrOuput, result) {
      cb(err);
    }
    bag.exec(
      `hcledit attribute set ${property} ${version} -f ${resource.path} -u`,
      false,
      execCb,
    );
  } else {
    cb();
  }
}

/**
 * Get version value from the HCL resource's property (defined in dot-notation).
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the HCL file
 * @param {String} resource.params.property - property in dot-notation
 * @param {Function} cb - standard cb(err, result) callback, result is the
 *   version value
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
  fs.readFile(resource.path, "UTF-8", readCb);
}

/**
 * Check that the HCL resource is ready for release, i.e. the file can be
 * parsed and the property exists with a value.
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the HCL file
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
      // hcl2-parser returns the parse error (without a message) instead of
      // throwing it
      const [data, parseErr] = hcl.parseToObject(result);
      if (parseErr) {
        err = new Error(`Failed to parse HCL resource ${resource.path}`);
      } else {
        const value = getProperty(data, property);
        if (value === undefined) {
          err = new Error(
            `Property ${property} does not exist in HCL resource ${resource.path}`,
          );
        } else if (value === null || value === "") {
          err = new Error(
            `Property ${property} has no value in HCL resource ${resource.path}`,
          );
        } else {
          ready = true;
        }
      }
    }
    cb(err, ready);
  }
  if (!property) {
    cb(
      new Error(
        `HCL resource ${resource.path} has no params.property configured`,
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
