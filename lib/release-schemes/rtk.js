"use strict";
/**
 * @module release-schemes/rtk
 */
import async from "async";
import bag from "bagofcli";
import stringFormat from "string-format";
import util from "util";
import semverVersionScheme from "../version-schemes/semver.js";
import gitScmScheme from "../scm-schemes/git.js";
import hclResourceType from "../resource-types/hcl.js";
import jsonResourceType from "../resource-types/json.js";
import keepAChangelogResourceType from "../resource-types/keep-a-changelog.js";
import makefileResourceType from "../resource-types/makefile.js";
import textResourceType from "../resource-types/text.js";
import tomlResourceType from "../resource-types/toml.js";
import xmlResourceType from "../resource-types/xml.js";
import yamlResourceType from "../resource-types/yaml.js";

/**
 * Default release scheme for RTK, consisting of three steps:
 * pre (set and commit release version), release (tag release version),
 * and post (set and commit next pre-release version).
 */
class Rtk {
  /**
   * Construct release scheme with the version and SCM schemes to use.
   *
   * @param {String} [versionSchemeName=semver] - version scheme name
   * @param {String} [scmSchemeName=git] - SCM scheme name
   * @param {String} preReleaseVersion - current pre-release version
   * @param {Object} opts - release settings
   * @param {Boolean} [opts.dryRun] - when true, no change will be made
   * @param {String} [opts.releaseIncrementType] - major, minor, or patch
   * @param {String} [opts.postReleaseIncrementType] - major, minor, or patch
   */
  constructor(versionSchemeName, scmSchemeName, preReleaseVersion, opts) {
    versionSchemeName = versionSchemeName || "semver";
    scmSchemeName = scmSchemeName || "git";

    this.versionSchemes = {
      semver: semverVersionScheme,
    };
    this.scmSchemes = {
      git: gitScmScheme,
    };
    this.resourceTypes = {
      hcl: hclResourceType,
      json: jsonResourceType,
      makefile: makefileResourceType,
      text: textResourceType,
      toml: tomlResourceType,
      xml: xmlResourceType,
      yaml: yamlResourceType,
    };
    this.resourceTypes["keep-a-changelog"] = keepAChangelogResourceType;

    const VersionSchemeClass = this.versionSchemes[versionSchemeName];
    this.versionScheme = new VersionSchemeClass(
      preReleaseVersion,
      opts.releaseIncrementType,
      opts.postReleaseIncrementType,
    );
    this.scmScheme = this.scmSchemes[scmSchemeName];

    this.logOpts = {};
    if (opts.dryRun) {
      this.logOpts["labels"] = ["dry run"];
    }
  }

  /**
   * Pre step: set release version on all resources, then commit the changes.
   * A resource's params.release_value overrides the release version, and
   * params.release_format formats it, e.g. v{version}.
   *
   * @param {Array<Object>} resources - resources which contain version value
   * @param {Object} opts - release settings
   * @param {Boolean} [opts.dryRun] - when true, no change will be made
   * @param {Function} cb - standard cb(err, result) callback
   */
  pre(resources, opts, cb) {
    const self = this;

    bag.logStepHeading(
      "Executing pre step of rtk release scheme...",
      self.logOpts,
    );

    const tasks = [];
    const paths = [];
    resources.forEach((resource) => {
      function resourceTask(cb) {
        let releaseVersion =
          resource.params && resource.params.release_value
            ? resource.params.release_value
            : self.versionScheme.getReleaseVersion();
        if (resource.params && resource.params.release_format) {
          releaseVersion = stringFormat(resource.params.release_format, {
            version: releaseVersion,
          });
        }
        const message = util.format(
          "Setting release version %s on %s resource located at %s",
          releaseVersion,
          resource.type,
          resource.path,
        );
        bag.logStepItemSuccess(message, self.logOpts);
        self.resourceTypes[resource.type].setReleaseVersion(
          releaseVersion,
          resource,
          opts,
          cb,
        );
      }
      tasks.push(resourceTask);
      paths.push(resource.path);
    });

    function scmTask(cb) {
      const message = util.format(
        "Committing release version changes made to %s...",
        paths.join(", "),
      );
      bag.logStepItemSuccess(message, self.logOpts);
      if (!opts.dryRun) {
        self.scmScheme.saveChanges(
          util.format(
            "Release version %s",
            self.versionScheme.getReleaseVersion(),
          ),
          paths,
          cb,
        );
      } else {
        cb();
      }
    }
    tasks.push(scmTask);

    async.series(tasks, cb);
  }

  /**
   * Release step: tag the release version.
   *
   * @param {Array<Object>} resources - resources which contain version value
   * @param {Object} opts - release settings
   * @param {Boolean} [opts.dryRun] - when true, no change will be made
   * @param {String} opts.tagFormat - SCM tag format, e.g. v{version}
   * @param {Function} cb - standard cb(err, result) callback
   */
  release(resources, opts, cb) {
    const self = this;

    bag.logStepHeading(
      "Executing release step of rtk release scheme...",
      self.logOpts,
    );

    const tasks = [];

    function scmTask(cb) {
      // Use tagFormat option to format the version to be used as SCM tag
      const formattedVersion = stringFormat(opts.tagFormat, {
        version: self.versionScheme.getReleaseVersion(),
      });
      const message = util.format(
        "Adding release version tag %s ...",
        formattedVersion,
      );
      bag.logStepItemSuccess(message, self.logOpts);
      if (!opts.dryRun) {
        self.scmScheme.addVersion(formattedVersion, cb);
      } else {
        cb();
      }
    }
    tasks.push(scmTask);

    async.series(tasks, cb);
  }

  /**
   * Post step: set next pre-release version on all resources, then commit
   * the changes. A resource's params.post_release_value overrides the
   * post-release version.
   *
   * @param {Array<Object>} resources - resources which contain version value
   * @param {Object} opts - release settings
   * @param {Boolean} [opts.dryRun] - when true, no change will be made
   * @param {Function} cb - standard cb(err, result) callback
   */
  post(resources, opts, cb) {
    const self = this;

    bag.logStepHeading(
      "Executing post step of rtk release scheme...",
      self.logOpts,
    );

    const tasks = [];
    const paths = [];
    resources.forEach((resource) => {
      function resourceTask(cb) {
        const postReleaseVersion =
          resource.params && resource.params.post_release_value
            ? resource.params.post_release_value
            : self.versionScheme.getPostReleaseVersion();
        const message = util.format(
          "Setting next pre-release version %s on %s resource located at %s",
          postReleaseVersion,
          resource.type,
          resource.path,
        );
        bag.logStepItemSuccess(message, self.logOpts);
        self.resourceTypes[resource.type].setPostReleaseVersion(
          postReleaseVersion,
          resource,
          opts,
          cb,
        );
      }
      tasks.push(resourceTask);
      paths.push(resource.path);
    });

    function scmTask(cb) {
      const message = util.format(
        "Committing next pre-release version changes made to %s...",
        paths.join(", "),
      );
      bag.logStepItemSuccess(message, self.logOpts);
      if (!opts.dryRun) {
        self.scmScheme.saveChanges(
          util.format(
            "Bump up to next pre-release version %s",
            self.versionScheme.getPostReleaseVersion(),
          ),
          paths,
          cb,
        );
      } else {
        cb();
      }
    }
    tasks.push(scmTask);

    async.series(tasks, cb);
  }
}

export { Rtk as default };
