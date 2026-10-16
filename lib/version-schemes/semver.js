"use strict";
/**
 * @module version-schemes/semver
 */
import semver from "semver";
import util from "util";

/**
 * Versioning scheme following semantic versioning standard
 * {@link https://semver.org/}.
 */
class Semver {
  /**
   * Calculate release and post-release versions from the current
   * pre-release version.
   *
   * @param {String} preReleaseVersion - current pre-release version,
   *   e.g. 1.2.3-pre.0
   * @param {String} [releaseIncrementType=minor] - major, minor, or patch,
   *   where patch releases the current version without incrementing it
   * @param {String} [postReleaseIncrementType=patch] - major, minor, or
   *   patch increment applied to the release version to get the next
   *   pre-release version
   */
  constructor(
    preReleaseVersion,
    releaseIncrementType,
    postReleaseIncrementType,
  ) {
    releaseIncrementType = releaseIncrementType || "minor";
    postReleaseIncrementType = postReleaseIncrementType || "patch";

    this.preReleaseVersion = preReleaseVersion;

    this.preReleaseComponent = semver.prerelease(preReleaseVersion)
      ? semver.prerelease(preReleaseVersion)[0]
      : "pre";

    // has to rely on util format due to semver#coerce being no longer available in newer version of semver library
    this.preReleaseVersionWithoutPreReleaseComponent = util.format(
      "%d.%d.%d",
      semver.major(this.preReleaseVersion),
      semver.minor(this.preReleaseVersion),
      semver.patch(this.preReleaseVersion),
    );

    if (["minor", "major"].includes(releaseIncrementType)) {
      this.releaseVersion = semver.inc(
        this.preReleaseVersionWithoutPreReleaseComponent,
        releaseIncrementType,
      );
    } else {
      this.releaseVersion = this.preReleaseVersionWithoutPreReleaseComponent;
    }

    this.postReleaseVersion = semver.inc(
      this.releaseVersion,
      "pre" + postReleaseIncrementType,
      this.preReleaseComponent,
    );
  }

  /**
   * Get release version.
   *
   * @return {String} release version, e.g. 1.3.0
   */
  getReleaseVersion() {
    return this.releaseVersion;
  }

  /**
   * Get post-release version, i.e. the next pre-release version.
   *
   * @return {String} post-release version, e.g. 1.3.1-pre.0
   */
  getPostReleaseVersion() {
    return this.postReleaseVersion;
  }
}

export { Semver as default };
