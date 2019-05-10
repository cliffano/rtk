const semver = require('semver');
const util = require('util');

/**
 * This class defines versioning scheme following semantic versioning standard https://semver.org/ .
 */
class Semver {

  constructor(preReleaseVersion) {
    this.preReleaseVersion = preReleaseVersion;

    this.preReleaseComponent = semver.prerelease(preReleaseVersion) ? semver.prerelease(preReleaseVersion)[0] : 'pre';

    // has to rely on util format due to semver#coerce being no longer available in newer version of semver library
    this.releaseVersion = util.format('%s.%s.%s',
      semver.major(this.preReleaseVersion),
      semver.minor(this.preReleaseVersion),
      semver.patch(this.preReleaseVersion));

    this.postReleaseVersion = semver.inc(this.releaseVersion, 'preminor', this.preReleaseComponent);
  }

  getReleaseVersion() {
    return this.releaseVersion;
  }

  getPostReleaseVersion() {
    return this.postReleaseVersion;
  }

}

module.exports = Semver;
