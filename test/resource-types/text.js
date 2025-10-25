"use strict";
/* eslint no-unused-vars: 0 */
/* eslint no-useless-escape: 0 */
import assert from 'assert';
import fs from 'fs';
import resourceType from '../../lib/resource-types/text.js';
import sinon from 'sinon';

describe('text', function() {

  beforeEach(function (done) {
    this.mockFs = sinon.mock(fs);
    done();
  });
  afterEach(function (done) {
    this.mockFs.verify();
    sinon.restore();
    done();
  });

  describe('setVersion', function() {
    it('should only set version but not modify text file when dry run is enabled', function(done) {
      const resource = {
        path: 'somefile.txt',
        type: 'text',
        params: {
          regex: '(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somefile.txt', 'UTF-8').returns(' version = "0.0.0" ');
      this.mockFs.expects('writeFile').never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: true }, cb);
    });
    it('should set version and modify text file when dry run is disabled', function(done) {
      const resource = {
        path: 'somefile.txt',
        type: 'text',
        params: {
          regex: '(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somefile.txt', 'UTF-8').returns(' version = "0.0.0" ');
      this.mockFs.expects('writeFile').once().withExactArgs('somefile.txt', ' version = "1.2.3" ', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
    it('should set version and modify text file when there are multiple matches', function(done) {
      const resource = {
        path: 'somefile.txt',
        type: 'text',
        params: {
          regex: '(\\d+).(\\d+).(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somefile.txt', 'UTF-8').returns(' version1 = "0.0.0", version2 = "1.1.1-beta" ');
      this.mockFs.expects('writeFile').once().withExactArgs('somefile.txt', ' version1 = "1.2.3", version2 = "1.2.3" ', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
  });

  describe('getVersion', function() {
    it('should get version from text resource', function(done) {
      const resource = {
        path: 'somefile.txt',
        type: 'text',
        params: {
          regex: '(\\d+).(\\d+).(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('somefile.txt', 'UTF-8', sinon.match.func).callsArgWith(2, null, ' version = "0.0.0" ');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '0.0.0');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it('should get first regex match as version from text resource when there are multiple matches', function(done) {
      const resource = {
        path: 'somefile.txt',
        type: 'text',
        params: {
          regex: '(\\d+).(\\d+).(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('somefile.txt', 'UTF-8', sinon.match.func).callsArgWith(2, null, ' version = "9.8.7" \n side_version = "1.2.3" ');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '9.8.7');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it('should get version from text resource when the version includes a pre release', function(done) {
      const resource = {
        path: 'somefile.txt',
        type: 'text',
        params: {
          regex: '(\\d+).(\\d+).(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('somefile.txt', 'UTF-8', sinon.match.func).callsArgWith(2, null, ' version = "1.1.1-pre.2" ');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '1.1.1-pre.2');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

});
