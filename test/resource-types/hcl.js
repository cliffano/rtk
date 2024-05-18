"use strict"
/* eslint no-unused-vars: 0 */
import assert from 'assert';
import fs from 'fs';
import resourceType from '../../lib/resource-types/hcl.js';
import sinon from 'sinon';

describe('hcl', function() {

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
    it('should only set version but not modify hcl file when dry run is enabled', function(done) {
      let resource = {
        path: 'variables.tf',
        type: 'hcl',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('variables.tf', 'UTF-8').returns('variable "tags" { default     = { version = "0.0.0" }}');
      this.mockFs.expects('writeFile').never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: true }, cb);
    });
    it('should set version and modify hcl file when dry run is disabled', function(done) {
      let resource = {
        path: 'variables.tf',
        type: 'hcl',
        params: {
          property: 'variable.tags.default.version'
        }
      };
      this.mockFs.expects('readFileSync').once().withExactArgs('variables.tf', 'UTF-8').returns('variable "tags" { default     = { version = "0.0.0" }}');
      this.mockFs.expects('writeFile').once().withExactArgs('variables.tf', 'variable "tags" { default     = { version = "1.2.3" }}\n', sinon.match.func).callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
    // it('should set array property under a section', function(done) {
    //   let resource = {
    //     path: 'variables.tf',
    //     type: 'hcl',
    //     params: {
    //       property: 'package.versions[1]'
    //     }
    //   };
    //   this.mockFs.expects('readFileSync').once().withExactArgs('variables.tf', 'UTF-8').returns('[package]\nversions = ["9.9.9", "0.0.0", "8.8.8"]');
    //   this.mockFs.expects('writeFile').once().withExactArgs('variables.tf', '[package]\nversions = [ "9.9.9", "1.2.3", "8.8.8" ]\n', sinon.match.func).callsArgWith(2, null);
    //   function cb(err, result) {
    //     assert.equal(err, null);
    //     done();
    //   }
    //   resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    // });
  });

  // describe('getVersion', function() {
  //   it('should get version from resource property', function(done) {
  //     let resource = {
  //       path: 'variables.tf',
  //       type: 'hcl',
  //       params: {
  //         property: 'version'
  //       }
  //     };
  //     this.mockFs.expects('readFile').once().withExactArgs('variables.tf', 'UTF-8', sinon.match.func).callsArgWith(2, null, 'version = "0.0.0"');
  //     function cb(err, result) {
  //       assert.equal(err, null);
  //       assert.equal(result, '0.0.0');
  //       done();
  //     }
  //     resourceType.getVersion(resource, cb);
  //   });
  //   it('should get array property under a section', function(done) {
  //     let resource = {
  //       path: 'variables.tf',
  //       type: 'hcl',
  //       params: {
  //         property: 'package.versions[1]'
  //       }
  //     };
  //     this.mockFs.expects('readFile').once().withExactArgs('variables.tf', 'UTF-8', sinon.match.func).callsArgWith(2, null, '[package]\nversions = ["9.9.9", "0.0.0", "8.8.8"]');
  //     function cb(err, result) {
  //       assert.equal(err, null);
  //       assert.equal(result, '0.0.0');
  //       done();
  //     }
  //     resourceType.getVersion(resource, cb);
  //   });
  // });

});
