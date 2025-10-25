"use strict";
import assert from 'assert';
import esmock from 'esmock';
import sinon from 'sinon';

describe('git', function () {

  describe('addVersion', async function () {
    it('should call simpleGit addTag', async function () {
      const version = '1.0.0';
      const simpleGitStub = sinon.stub().returns({
        addTag: function (_version, cb) {
          assert.equal(_version, version);
          cb(null);
        }
      });
      const gitScheme = await esmock('../../lib/scm-schemes/git.js', {
        'simple-git': simpleGitStub
      });
      await gitScheme.addVersion(version, function (err) {
        assert.equal(err, null);
      });
    });
  });

  describe('saveChanges', async function () {
    it('should call simpleGit commit', async function () {
      const message = 'some message';
      const paths = ['somefile1.txt', 'somefile2.txt'];
      const simpleGitStub = sinon.stub().returns({
        commit: function (_message, _paths, _options, cb) {
          assert.equal(_message, message);
          assert.deepEqual(_paths, paths);
          cb(null);
        }
      });
      const gitScheme = await esmock('../../lib/scm-schemes/git.js', {
        'simple-git': simpleGitStub
      });
      await gitScheme.saveChanges(message, paths, function (err) {
        assert.equal(err, null);
      });
    });
  });
});