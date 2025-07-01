"use strict";
/* eslint no-unused-vars: 0 */
import assert from 'assert';
import fs from 'fs';
import resourceType from '../../lib/resource-types/json.js';
import sinon from 'sinon';

describe('json', function() {

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
    it('should only set version but not modify json file when dry run is enabled', function(done) {
      const resource = {
        path: 'somepackage.json',
        type: 'json',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somepackage.json', 'UTF-8').returns('{ "version": "0.0.0" }');
      this.mockFs.expects('writeFile').never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: true }, cb);
    });
    it('should set version and modify json file when dry run is disabled', function(done) {
      const resource = {
        path: 'somepackage.json',
        type: 'json',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somepackage.json', 'UTF-8').returns('{ "version": "0.0.0" }');
      this.mockFs.expects('writeFile').once().withExactArgs('somepackage.json', '{\n  "version": "1.2.3"\n}', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
    it('should set property under array sub-property', function(done) {
      const resource = {
        path: 'somepackage.json',
        type: 'json',
        params: {
          property: 'versions[1].minor'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somepackage.json', 'UTF-8').returns('{ "versions": [{ "major": 1, "minor": 2, "patch": 3 }, { "major": 8, "minor": 9, "patch": 0 }] }');
      this.mockFs.expects('writeFile').once().withExactArgs('somepackage.json', '{\n  "versions": [\n    {\n      "major": 1,\n      "minor": 2,\n      "patch": 3\n    },\n    {\n      "major": 8,\n      "minor": 9,\n      "patch": 0\n    }\n  ]\n}', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion(9, resource, { dryRun: false }, cb);
    });
  });

  describe('getVersion', function() {
    it('should get version from resource property', function(done) {
      const resource = {
        path: 'somepackage.json',
        type: 'json',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('somepackage.json', 'UTF-8', sinon.match.func).callsArgWith(2, null, '{ "version": "0.0.0" }');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '0.0.0');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it('should get property under an array array sub-property', function(done) {
      const resource = {
        path: 'somepackage.json',
        type: 'json',
        params: {
          property: 'versions[1].minor'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('somepackage.json', 'UTF-8', sinon.match.func).callsArgWith(2, null, '{ "versions": [{ "major": 1, "minor": 2, "patch": 3 }, { "major": 8, "minor": 9, "patch": 0 }] }');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, 9);
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

});
