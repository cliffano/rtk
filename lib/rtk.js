const RtkReleaseScheme = require('./releaseschemes/rtk');
/**
 * RTK is the enchilada, Release The Kraken!
 */
class RTK {

  /**
   * Construct RTK object which will manage a set of resources.
   *
   * @param {Array} resources: an array of resources which contain version value
   * @param {Object} opts: optional settings
   *   - dryRun: when true, changelog file won't be modified
   */
  constructor(resources, opts) {
    this.resources = resources || {};
    this.opts = opts || {};
  }

  /**
   * Execute release steps for the specified release scheme.
   *
   * @param {String} releaseSchemeName: release scheme name that defines the steps involved in a release step
   * @param {String} versionSchemeName: version scheme name that defines the release and pre-release version value
   * @param {Function} cb: standard cb(err, result) callback
   */
  release(releaseSchemeName, versionSchemeName, cb) {
    releaseSchemeName = releaseSchemeName || 'rtk';

    // assumes first resource contains the source of truth and the correct pre-release version
    const preReleaseResource = this.resources[0];

    const releaseScheme = new (require('./releaseschemes/' + releaseSchemeName))(versionSchemeName, preReleaseResource);
    releaseScheme.pre(this.resources, this.opts);
    releaseScheme.release(this.resources, this.opts);
    releaseScheme.post(this.resources, this.opts);

    cb();
  }

}

module.exports = RTK;
