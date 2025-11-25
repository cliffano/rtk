"use strict";
import { parser, Release } from 'keep-a-changelog';
import fs from 'fs';
import stringFormat from 'string-format';

/**
 * Set a release version number to the latest release within the changelog, with date set to current date.
 * The changelog follows keep a changelog format https://keepachangelog.com .
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, changelog file won't be modified
 * @param {Function} cb: standard cb(err, result) callback
 */
function setReleaseVersion(version, resource, opts, cb) {
  const changelog = parser(fs.readFileSync(resource.path, 'UTF-8'));
  changelog.tagNameBuilder = function (release) {
    // Use tagFormat option to format the version to be used as SCM tag
    const formattedVersion = stringFormat(opts.tagFormat, { version: release.version });
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
 * Add a new release to the changelog having the post-release version and an unreleased date.
 * The changelog follows keep a changelog format https://keepachangelog.com .
 *
 * @param {String} version: version value to set
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Object} opts: optional settings
 *   - dryRun: when true, changelog file won't be modified
 * @param {Function} cb: standard cb(err, result) callback
 */
function setPostReleaseVersion(version, resource, opts, cb) {
  const changelog = parser(fs.readFileSync(resource.path, 'UTF-8'));
  changelog.tagNameBuilder = function (release) {
    // Use tagFormat option to format the version to be used as SCM tag
    const formattedVersion = stringFormat(opts.tagFormat, { version: release.version });
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
 * The changelog follows keep a changelog format https://keepachangelog.com .
 * It's common for the latest positioned version value for keep a changelog to be set to 'Unreleased'
 * in order to indicate that it's the one that's currently in progress.
 * Hence we need to handle two scenarios here:
 * - when latest release has a version number, then use that as the current version
 * - when latest release is 'Unreleased' (version is undefined after parsing), then use the previous release and append a '.0' suffix
 * - otherwise defaults to '0.0.0'
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Function} cb: standard cb(err, result) callback
 */
function getVersion(resource, cb) {
  function readCb(err, result) {
    let version;
    if (err) {
      cb(err);
    } else {
      function parseCb(err, changelog) {
        if (err) {
          cb(err);
        } else {
          const latestRelease = changelog.releases[0];
          const latestReleaseMinusOne = changelog.releases[1];
          if (latestRelease && latestRelease.version) {
            version = latestRelease.version;
          } else if (latestReleaseMinusOne && latestReleaseMinusOne.version) {
            version = latestReleaseMinusOne.version + '.0';
          } else {
            version = '0.0.0';
          }
          cb(null, version);
        }
      }
      _parseWithValidation(result, parseCb);
    }
  }
  fs.readFile(resource.path, 'UTF-8', readCb);
}

/**
 * Parse changelog content using keep-a-changelog parser.
 * This function also serves as a validator, where an error will be thrown
 * @param {String} content: changelog content
 * @param {Function} cb: standard cb(err, result) callback
 */
function _parseWithValidation(content, cb) {
  try {
    const changelog = parser(content);
    cb(null, changelog);
  } catch (err) {
    const message = `Failed to parse changelog. Please fix the changelog following the keep a changelog format https://keepachangelog.com . Error: ${err.message}`;
    cb(new Error(message));
  }
}

const exports = {
  setReleaseVersion: setReleaseVersion,
  setPostReleaseVersion: setPostReleaseVersion,
  getVersion: getVersion
};

export {
  exports as default
};
