const assert = require('assert');
const fs = require('fs');
const resourceType = require('../../lib/resourcetypes/json');
const sinon = require('sinon');

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
  describe('setReleaseVersion', function() {
    it('should only set version but not modify json file when dry run is enabled', function(done) {
      let resource = {
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
      let resource = {
        path: 'somepackage.json',
        type: 'json',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('somepackage.json', 'UTF-8').returns('{ "version": "0.0.0" }');
      this.mockFs.expects('writeFile').once().withArgs('somepackage.json', '{\n  "version": "1.2.3"\n}', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
  });
});
