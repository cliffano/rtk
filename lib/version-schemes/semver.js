"use strict"
import semver from 'semver';
import util from 'util';

/**
 * This class defines versioning scheme following semantic versioning standard https://semver.org/ .
 */
class Semver {

  constructor(preReleaseVersion, releaseIncrementType, postReleaseIncrementType) {
    releaseIncrementType = releaseIncrementType || 'minor';
    postReleaseIncrementType = postReleaseIncrementType || 'patch';

    this.preReleaseVersion = preReleaseVersion;

    this.preReleaseComponent = semver.prerelease(preReleaseVersion) ? semver.prerelease(preReleaseVersion)[0] : 'pre';

    // has to rely on util format due to semver#coerce being no longer available in newer version of semver library
    this.preReleaseVersionWithoutPreReleaseComponent = util.format('%d.%d.%d',
      semver.major(this.preReleaseVersion),
      semver.minor(this.preReleaseVersion),
      semver.patch(this.preReleaseVersion));

    if (['minor', 'major'].includes(releaseIncrementType)) {
      this.releaseVersion = semver.inc(this.preReleaseVersionWithoutPreReleaseComponent, releaseIncrementType);
    } else {
      this.releaseVersion = this.preReleaseVersionWithoutPreReleaseComponent;
    }

    this.postReleaseVersion = semver.inc(this.releaseVersion, 'pre' + postReleaseIncrementType, this.preReleaseComponent);
  }

  getReleaseVersion() {
    return this.releaseVersion;
  }

  getPostReleaseVersion() {
    return this.postReleaseVersion;
  }

}

export {
  Semver as default
};
