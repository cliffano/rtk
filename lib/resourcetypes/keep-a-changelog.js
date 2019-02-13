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
 */
function setReleaseVersion(version, resource, opts) {
  const changelog = parser(fs.readFileSync(resource.path, 'UTF-8'));
  const latestRelease = changelog.releases[0];
  latestRelease.setVersion(version);
  latestRelease.setDate(new Date());
  if (!opts.dryRun) {
    fs.writeFileSync(resource.path, changelog.toString());
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
 */
function setPostReleaseVersion(version, resource, opts) {
  const changelog = parser(fs.readFileSync(resource.path, 'UTF-8'));
  const postRelease = new Release();
  changelog.addRelease(postRelease);
  if (!opts.dryRun) {
    fs.writeFileSync(resource.path, changelog.toString());
  }
}

/**
 * Get version value from the changelog's latest release.
 * The changelog follows keep a changelog format https://keepachangelog.com .
 *
 * @param {Object} resource: resource configuration which contains type, path, and params
 */
function getVersion(resource) {
  const changelog = parser(fs.readFileSync(resource.path, 'UTF-8'));
  const latestRelease = changelog.releases[0];
  return latestRelease.version;
}

module.exports = {
  setReleaseVersion: setReleaseVersion,
  setPostReleaseVersion: setPostReleaseVersion,
  getVersion: getVersion
};