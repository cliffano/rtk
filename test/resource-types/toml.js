"use strict";
/* eslint no-unused-vars: 0 */
import assert from 'assert';
import fs from 'fs';
import resourceType from '../../lib/resource-types/toml.js';
import sinon from 'sinon';

describe('toml', function() {

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
    it('should only set version but not modify toml file when dry run is enabled', function(done) {
      const resource = {
        path: 'somepackage.toml',
        type: 'toml',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somepackage.toml', 'UTF-8').returns('version = "0.0.0"');
      this.mockFs.expects('writeFile').never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: true }, cb);
    });
    it('should set version and modify toml file when dry run is disabled', function(done) {
      const resource = {
        path: 'somepackage.toml',
        type: 'toml',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somepackage.toml', 'UTF-8').returns('version = "0.0.0"');
      this.mockFs.expects('writeFile').once().withExactArgs('somepackage.toml', 'version = "1.2.3"\n', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
    it('should set array property under a section', function(done) {
      const resource = {
        path: 'somepackage.toml',
        type: 'toml',
        params: {
          property: 'package.versions[1]'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somepackage.toml', 'UTF-8').returns('[package]\nversions = ["9.9.9", "0.0.0", "8.8.8"]');
      this.mockFs.expects('writeFile').once().withExactArgs('somepackage.toml', '[package]\nversions = [ "9.9.9", "1.2.3", "8.8.8" ]\n', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
  });

  describe('getVersion', function() {
    it('should get version from resource property', function(done) {
      const resource = {
        path: 'somepackage.toml',
        type: 'toml',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('somepackage.toml', 'UTF-8', sinon.match.func).callsArgWith(2, null, 'version = "0.0.0"');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '0.0.0');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it('should get array property under a section', function(done) {
      const resource = {
        path: 'somepackage.toml',
        type: 'toml',
        params: {
          property: 'package.versions[1]'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('somepackage.toml', 'UTF-8', sinon.match.func).callsArgWith(2, null, '[package]\nversions = ["9.9.9", "0.0.0", "8.8.8"]');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '0.0.0');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

});
