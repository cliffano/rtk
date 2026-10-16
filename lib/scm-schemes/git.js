"use strict";
/**
 * Git SCM scheme, operating on the repository at current working directory.
 *
 * @module scm-schemes/git
 */
import { simpleGit } from "simple-git";
const _simpleGit = simpleGit(process.cwd());

/**
 * Add a version tag to the current commit.
 *
 * @param {String} version - tag name, already formatted using tag format
 * @param {Function} cb - standard cb(err, result) callback
 */
function addVersion(version, cb) {
  _simpleGit.addTag(version, cb);
}

/**
 * Commit changes made to the specified paths.
 *
 * @param {String} message - commit message
 * @param {Array<String>} paths - paths of the files to commit
 * @param {Function} cb - standard cb(err, result) callback
 */
function saveChanges(message, paths, cb) {
  _simpleGit.commit(message, paths, {}, cb);
}
const exports = {
  addVersion: addVersion,
  saveChanges: saveChanges,
};

export { exports as default };
