"use strict"
import simpleGit from 'simple-git';
simpleGit = simpleGit(process.cwd());

function addVersion(version, cb) {
  simpleGit.addTag(version, cb);
}

function saveChanges(message, paths, cb) {
  simpleGit.commit(message, paths, {}, cb);
}
const exports = {
  addVersion: addVersion,
  saveChanges: saveChanges
};

export {
  exports as default
};