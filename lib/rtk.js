"use strict";
/**
 * @module rtk
 */
import async from "async";
import rtkReleaseScheme from "./release-schemes/rtk.js";
import hclResourceType from "./resource-types/hcl.js";
import jsonResourceType from "./resource-types/json.js";
import keepAChangelogResourceType from "./resource-types/keep-a-changelog.js";
import makefileResourceType from "./resource-types/makefile.js";
import textResourceType from "./resource-types/text.js";
import tomlResourceType from "./resource-types/toml.js";
import yamlResourceType from "./resource-types/yaml.js";

/**
 * RTK is the enchilada, Release The Kraken!
 */
class RTK {
  /**
   * Construct RTK object which will manage a set of resources.
   *
   * @param {Array<Object>} resources - resources which contain version value,
   *   the first resource is used as the source of truth of current version
   * @param {Object} [opts] - optional settings
   * @param {Boolean} [opts.dryRun] - when true, no change will be made
   * @param {String} [opts.releaseIncrementType] - major, minor, or patch
   * @param {String} [opts.postReleaseIncrementType] - major, minor, or patch
   * @param {String} [opts.tagFormat] - SCM tag format, e.g. v{version}
   */
  constructor(resources, opts) {
    this.resources = resources || {};
    this.opts = opts || {};
    this.releaseSchemes = {
      rtk: rtkReleaseScheme,
    };
    this.resourceTypes = {
      hcl: hclResourceType,
      json: jsonResourceType,
      makefile: makefileResourceType,
      text: textResourceType,
      toml: tomlResourceType,
      yaml: yamlResourceType,
    };
    this.resourceTypes["keep-a-changelog"] = keepAChangelogResourceType;
  }

  /**
   * Execute release steps for the specified release scheme.
   *
   * @param {String} [releaseSchemeName=rtk] - release scheme name that
   *   defines the steps involved in a release
   * @param {String} [versionSchemeName=semver] - version scheme name that
   *   defines the release and post-release version values
   * @param {String} [scmSchemeName=git] - name of SCM used by the repository
   *   to be released
   * @param {Function} cb - standard cb(err, result) callback
   */
  release(releaseSchemeName, versionSchemeName, scmSchemeName, cb) {
    const self = this;

    releaseSchemeName = releaseSchemeName || "rtk";
    versionSchemeName = versionSchemeName || "semver";
    scmSchemeName = scmSchemeName || "git";

    let releaseScheme;

    function versionTask(cb) {
      // uses first resource as the source of truth and the correct pre-release version
      const preReleaseResource = self.resources[0];

      function versionCb(err, result) {
        if (!err) {
          const ReleaseSchemeClass = self.releaseSchemes[releaseSchemeName];
          releaseScheme = new ReleaseSchemeClass(
            versionSchemeName,
            scmSchemeName,
            result,
            self.opts,
          );
        }
        cb(err, result);
      }
      const resourceType = self.resourceTypes[preReleaseResource.type];
      resourceType.getVersion(preReleaseResource, versionCb);
    }
    function preTask(cb) {
      releaseScheme.pre(self.resources, self.opts, cb);
    }
    function releaseTask(cb) {
      releaseScheme.release(self.resources, self.opts, cb);
    }
    function postTask(cb) {
      releaseScheme.post(self.resources, self.opts, cb);
    }

    async.series([versionTask, preTask, releaseTask, postTask], cb);
  }
}

export { RTK as default };
