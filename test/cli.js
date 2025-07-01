"use strict";
/* eslint no-unused-vars: 0 */
import RTK from '../lib/rtk.js';
import bag from 'bagofcli';
import cli from '../lib/cli.js';
import referee from '@sinonjs/referee';
import sinon from 'sinon';
const assert = referee.assert;

describe('cli - exec', function() {

  it('should contain commands with actions', function (done) {
    const mockCommand = function (base, actions) {
      assert.isString(base);
      assert.isFunction(actions.commands.release.action);
      done();
    };
    sinon.stub(bag, 'command').value(mockCommand);
    cli.exec();
  });
});

describe('cli - release', function() {

  beforeEach(function () {
    this.mockBag = sinon.mock(bag);
  });

  afterEach(function () {
    this.mockBag.verify();
    this.mockBag.restore();
  });

  it('should contain release command and delegate to rtk release when exec is called', function (done) {
    sinon.stub(bag, 'lookupFile').value(function (configFile, cb) {
      assert.equals(configFile, '.rtk.json');
      return '{ "releaseScheme": "rtk", "versionScheme": "semver", "scmScheme": "git", "tagFormat": "v{version}" }';
    });
    sinon.stub(bag, 'command').value(function (base, actions) {
      actions.commands.release.action({
        releaseIncrementType: 'minor',
        postReleaseIncrementType: 'patch',
        tagFormat: 'v{version}',
        parent: {
          configFile: '.rtk.json',
          dryRun: false
        }
      });
    });
    sinon.stub(RTK.prototype, 'release').value(function (releaseScheme, versionScheme, scmScheme, cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});