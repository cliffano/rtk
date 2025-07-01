"use strict";
import simpleGit from 'simple-git';
const _simpleGit = simpleGit(process.cwd());

function addVersion(version, cb) {
  _simpleGit.addTag(version, cb);
}

function saveChanges(message, paths, cb) {
  _simpleGit.commit(message, paths, {}, cb);
}
const exports = {
  addVersion: addVersion,
  saveChanges: saveChanges
};

export {
  exports as default
};