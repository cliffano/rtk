"use strict";
/**
 * Changelog resource following {@link https://keepachangelog.com|Keep a
 * Changelog} format.
 *
 * @module resource-types/keep-a-changelog
 */
import { parser, Release } from "keep-a-changelog";
import fs from "fs";
import stringFormat from "string-format";

/**
 * Set release version on the latest release within the changelog, with date
 * set to current date.
 *
 * @param {String} version - version value to set
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the changelog file
 * @param {Object} opts - optional settings
 * @param {Boolean} [opts.dryRun] - when true, changelog file won't be
 *   modified
 * @param {String} opts.tagFormat - SCM tag format used in release links,
 *   e.g. v{version}
 * @param {Function} cb - standard cb(err, result) callback
 */
function setReleaseVersion(version, resource, opts, cb) {
  const changelog = parser(fs.readFileSync(resource.path, "UTF-8"));
  changelog.tagNameBuilder = function (release) {
    // Use tagFormat option to format the version to be used as SCM tag
    const formattedVersion = stringFormat(opts.tagFormat, {
      version: release.version,
    });
    return formattedVersion;
  };
  const latestRelease = changelog.releases[0];
  latestRelease.setVersion(version);
  latestRelease.setDate(new Date());
  if (!opts.dryRun) {
    fs.writeFile(resource.path, changelog.toString(), cb);
  } else {
    cb();
  }
}

/**
 * Add a new Unreleased section to the top of the changelog.
 *
 * The version value is not written to the changelog, Unreleased section
 * represents the next pre-release version instead.
 *
 * @param {String} version - post-release version value, unused
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the changelog file
 * @param {Object} opts - optional settings
 * @param {Boolean} [opts.dryRun] - when true, changelog file won't be
 *   modified
 * @param {String} opts.tagFormat - SCM tag format used in release links,
 *   e.g. v{version}
 * @param {Function} cb - standard cb(err, result) callback
 */
function setPostReleaseVersion(version, resource, opts, cb) {
  const changelog = parser(fs.readFileSync(resource.path, "UTF-8"));
  changelog.tagNameBuilder = function (release) {
    // Use tagFormat option to format the version to be used as SCM tag
    const formattedVersion = stringFormat(opts.tagFormat, {
      version: release.version,
    });
    return formattedVersion;
  };
  const postRelease = new Release();
  changelog.addRelease(postRelease);
  if (!opts.dryRun) {
    fs.writeFile(resource.path, changelog.toString(), cb);
  } else {
    cb();
  }
}

/**
 * Get version value from the changelog's latest release.
 *
 * It's common for the latest release of a changelog to be 'Unreleased', in
 * order to indicate that it's the one currently in progress. Hence the
 * version is resolved in this order:
 * 1. when latest release has a version number, use that version
 * 2. when latest release is 'Unreleased' (version is undefined after
 *    parsing), use the previous release's version
 * 3. otherwise default to '0.0.0'
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the changelog file
 * @param {Function} cb - standard cb(err, result) callback, result is the
 *   version value
 */
function getVersion(resource, cb) {
  function parseCb(err, changelog) {
    let version;
    if (!err) {
      const latestRelease = changelog.releases[0];
      const latestReleaseMinusOne = changelog.releases[1];
      if (latestRelease && latestRelease.version) {
        version = latestRelease.version;
      } else if (latestReleaseMinusOne && latestReleaseMinusOne.version) {
        version = latestReleaseMinusOne.version;
      } else {
        version = "0.0.0";
      }
    }
    cb(err, version);
  }
  function readCb(err, result) {
    if (err) {
      cb(err);
    } else {
      _parseWithValidation(result, parseCb);
    }
  }
  fs.readFile(resource.path, "UTF-8", readCb);
}

/**
 * Parse changelog content using keep-a-changelog parser.
 * This function also serves as a validator, where an error will be thrown.
 *
 * Due to the way keep-a-changelog parser works, it throws error directly
 * instead of passing it to callback, hence we rethrow the error with a more
 * descriptive message.
 *
 * Even though the current implementation wouldn't pass an error to callback,
 * we still keep the cb parameter for consistency and future-proofing.
 *
 * @private
 * @param {String} content - changelog content
 * @param {Function} cb - standard cb(err, result) callback, result is the
 *   parsed changelog
 * @throws {Error} when changelog content can't be parsed
 */
function _parseWithValidation(content, cb) {
  try {
    const changelog = parser(content);
    console.dir(changelog);
    cb(null, changelog);
  } catch (err) {
    const message = `Failed to parse changelog. Please fix the changelog following the keep a changelog format https://keepachangelog.com . Error: ${err.message}`;
    throw new Error(message);
  }
}

const exports = {
  setReleaseVersion: setReleaseVersion,
  setPostReleaseVersion: setPostReleaseVersion,
  getVersion: getVersion,
};

export { exports as default };
