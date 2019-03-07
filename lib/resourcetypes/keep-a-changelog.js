const { parser, Release } = require('keep-a-changelog');
const fs = require('fs');

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
    return release.version;
  }
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
    return release.version;
  }
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
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 * @param {Function} cb: standard cb(err, result) callback
 */
function getVersion(resource, cb) {
  function readCb(err, result) {
    let version;
    if (!err) {
      const changelog = parser(result);
      const latestRelease = changelog.releases[0];
      version = latestRelease.version;
    }
    cb(err, version);
  }
  fs.readFile(resource.path, 'UTF-8', readCb);
}

module.exports = {
  setReleaseVersion: setReleaseVersion,
  setPostReleaseVersion: setPostReleaseVersion,
  getVersion: getVersion
};
