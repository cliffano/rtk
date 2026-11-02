"use strict";
/**
 * @module resource-types/text
 */
import fs from "fs";

/**
 * Set version value in the text resource, replacing all matches of the regex.
 *
 * @param {String} version - version value to set
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the text file
 * @param {String} resource.params.regex - regular expression which matches
 *   the version value
 * @param {Object} opts - optional settings
 * @param {Boolean} [opts.dryRun] - when true, text file won't be modified
 * @param {Function} cb - standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const regex = resource.params.regex;
  let data = fs.readFileSync(resource.path, "UTF-8");
  data = data.replaceAll(new RegExp(regex, "g"), version);
  if (!opts.dryRun) {
    fs.writeFile(resource.path, data, cb);
  } else {
    cb();
  }
}

/**
 * Get version value from the text resource, using the first match of the
 * regex.
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the text file
 * @param {String} resource.params.regex - regular expression which matches
 *   the version value
 * @param {Function} cb - standard cb(err, result) callback, result is the
 *   version value
 */
function getVersion(resource, cb) {
  const regex = resource.params.regex;

  function readCb(err, result) {
    let version;
    if (!err) {
      const data = result.match(new RegExp(regex));
      version = data[0];
    }
    cb(err, version);
  }
  fs.readFile(resource.path, "UTF-8", readCb);
}

/**
 * Check that the text resource is ready for release, i.e. the regex is valid
 * and it matches a non-empty version value.
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the text file
 * @param {String} resource.params.regex - regular expression which matches
 *   the version value
 * @param {Function} cb - standard cb(err, result) callback, result is true
 *   when the resource is ready for release, an error is passed when the regex
 *   is not configured, is invalid, or doesn't match a non-empty version
 */
function isReadyForRelease(resource, cb) {
  const regex = resource.params && resource.params.regex;

  function readCb(err, result) {
    let ready;
    if (!err) {
      try {
        const match = result.match(new RegExp(regex));
        if (!match) {
          err = new Error(
            `Regex ${regex} does not match any version in text resource ${resource.path}`,
          );
        } else if (match[0] === "") {
          err = new Error(
            `Regex ${regex} matches an empty version in text resource ${resource.path}`,
          );
        } else {
          ready = true;
        }
      } catch (regexErr) {
        err = new Error(
          `Invalid regex ${regex} for text resource ${resource.path}. Error: ${regexErr.message}`,
        );
      }
    }
    cb(err, ready);
  }
  if (!regex) {
    cb(
      new Error(
        `text resource ${resource.path} has no params.regex configured`,
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
