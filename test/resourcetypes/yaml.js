const assert = require('assert');
const fs = require('fs');
const resourceType = require('../../lib/resourcetypes/yaml');
const sinon = require('sinon');

describe('yaml', function() {

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
    it('should only set version but not modify yaml file when dry run is enabled', function(done) {
      let resource = {
        path: 'someplaybook.yaml',
        type: 'yaml',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('someplaybook.yaml', 'UTF-8').returns('version: "0.0.0"');
      this.mockFs.expects('writeFile').never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: true }, cb);
    });
    it('should set version and modify yaml file when dry run is disabled', function(done) {
      let resource = {
        path: 'someplaybook.yaml',
        type: 'yaml',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('someplaybook.yaml', 'UTF-8').returns('{ "version": "0.0.0" }');
      this.mockFs.expects('writeFile').once().withExactArgs('someplaybook.yaml', 'version: 1.2.3\n', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
  });

  describe('getVersion', function() {
    it('should get version from resource property', function(done) {
      let resource = {
        path: 'someplaybook.yaml',
        type: 'yaml',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('someplaybook.yaml', 'UTF-8', sinon.match.func).callsArgWith(2, null, '{ "version": "0.0.0" }');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '0.0.0');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

});