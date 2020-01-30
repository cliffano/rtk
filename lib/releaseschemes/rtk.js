const async = require('async');
const logger = require('../logger');
const util = require('util');

/**
 * This is the default release scheme for RTK using Git as SCM.
 */
class Rtk {

  constructor(versionSchemeName, scmSchemeName, preReleaseVersion) {

    versionSchemeName = versionSchemeName || 'semver';
    scmSchemeName = scmSchemeName || 'git';

    this.versionScheme = new (require('../versionschemes/' + versionSchemeName))(preReleaseVersion, 'major', 'patch');
    this.scmScheme = require('../scmschemes/' + scmSchemeName);

  }

  pre(resources, opts, cb) {

    const self = this;

    logger.logStepHeading('Executing pre step of rtk release scheme...');

    let tasks = [];
    let paths = [];
    resources.forEach(function (resource) {
      function resourceTask(cb) {
        const releaseVersion = resource.params && resource.params.release_value ? resource.params.release_value : self.versionScheme.getReleaseVersion();
        const message = util.format('Setting release version %s on %s resource located at %s', releaseVersion, resource.type, resource.path);
        logger.logStepItem(message);
        (require('../resourcetypes/' + resource.type)).setReleaseVersion(releaseVersion, resource, opts, cb);
      }
      tasks.push(resourceTask);
      paths.push(resource.path);
    });

    function scmTask(cb) {
      const message = util.format('Committing release version changes made to %s...', paths.join(', '));
      logger.logStepItem(message);
      self.scmScheme.saveChanges(util.format('Release version %s', self.versionScheme.getReleaseVersion()), paths, cb);
    }

    if (!opts.dryRun) {
      tasks.push(scmTask);
    }

    async.series(tasks, cb);

  }

  release(resources, opts, cb) {

    const self = this;

    logger.logStepHeading('Executing release step of rtk release scheme...');

    function scmTask(cb) {
      const message = util.format('Adding release version tag %s ...', self.versionScheme.getReleaseVersion());
      logger.logStepItem(message);
      self.scmScheme.addVersion(self.versionScheme.getReleaseVersion(), cb);
    }

    let tasks = [];
    if (!opts.dryRun) {
      tasks.push(scmTask);
    }

    async.series(tasks, cb);

  }

  post(resources, opts, cb) {

    const self = this;

    logger.logStepHeading('Executing post step of rtk release scheme...');

    let tasks = [];
    let paths = [];
    resources.forEach(function (resource) {
      function resourceTask(cb) {
        const postReleaseVersion = resource.params && resource.params.post_release_value ? resource.params.post_release_value : self.versionScheme.getPostReleaseVersion();
        const message = util.format('Setting next pre-release version %s on %s resource located at %s', postReleaseVersion, resource.type, resource.path);
        logger.logStepItem(message);
        (require('../resourcetypes/' + resource.type)).setPostReleaseVersion(postReleaseVersion, resource, opts, cb);
      }
      tasks.push(resourceTask);
      paths.push(resource.path);
    });

    function scmTask(cb) {
      const message = util.format('Committing next pre-release version changes made to %s...', paths.join(', '));
      logger.logStepItem(message);
      self.scmScheme.saveChanges(util.format('Bump up to next pre-release version %s', self.versionScheme.getPostReleaseVersion()), paths);
    }

    if (!opts.dryRun) {
      tasks.push(scmTask);
    }

    async.series(tasks, cb);

  }

}

module.exports = Rtk;
