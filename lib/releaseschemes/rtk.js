const logger = require('../logger');
const simpleGit = require('simple-git')(process.cwd());
const util = require('util');

/**
 * This is the default release scheme for RTK using Git as SCM.
 */
class Rtk {

  constructor(versionSchemeName, preReleaseResource) {

    versionSchemeName = versionSchemeName || 'semver';

    const preReleaseVersion = (require('../resourcetypes/' + preReleaseResource.type)).getVersion(preReleaseResource);
    this.versionScheme = new (require('../versionschemes/' + versionSchemeName))(preReleaseVersion);

  }

  pre(resources, opts) {

    const self = this;

    logger.logStepHeading('Executing pre step of rtk release scheme...');

    let paths = [];
    resources.forEach(function (resource) {
      const message = util.format('Setting release version %s on %s resource located at %s', self.versionScheme.getReleaseVersion(), resource.type, resource.path);
      logger.logStepItem(message);
      (require('../resourcetypes/' + resource.type)).setReleaseVersion(self.versionScheme.getReleaseVersion(), resource, opts);
      paths.push(resource.path);
    });

    if (!opts.dryRun) {
      const message = util.format('Committing release version changes made to %s...', paths.join(', '));
      logger.logStepItem(message);
      simpleGit.commit(util.format('Release version %s', self.versionScheme.getReleaseVersion()), paths);
    }

  }

  release(resources, opts) {

    logger.logStepHeading('Executing release step of rtk release scheme...');

    if (!opts.dryRun) {
      const message = util.format('Adding release version tag %s ...', this.versionScheme.getReleaseVersion());
      logger.logStepItem(message);
      simpleGit.addTag(this.versionScheme.getReleaseVersion());
    }

  }

  post(resources, opts) {

    const self = this;

    logger.logStepHeading('Executing post step of rtk release scheme...');

    let paths = [];
    resources.forEach(function (resource) {
      const message = util.format('Setting next pre-release version %s on %s resource located at %s', self.versionScheme.getPostReleaseVersion(), resource.type, resource.path);
      logger.logStepItem(message);
      (require('../resourcetypes/' + resource.type)).setPostReleaseVersion(self.versionScheme.getPostReleaseVersion(), resource, opts);
      paths.push(resource.path);
    });
    
    if (!opts.dryRun) {
      const message = util.format('Committing next pre-release version changes made to %s...', paths.join(', '));
      logger.logStepItem(message);
      simpleGit.commit(util.format('Bump up to next pre-release version %s', self.versionScheme.getPostReleaseVersion()), paths);
    }

  }

}

module.exports = Rtk;
