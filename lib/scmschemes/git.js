const simpleGit = require('simple-git')(process.cwd());

function addVersion(version, cb) {
  simpleGit.addTag(version, cb);
}

function saveChanges(message, paths, cb) {
  simpleGit.commit(message, paths, {}, cb);
}

module.exports = {
  addVersion: addVersion,
  saveChanges: saveChanges
};
