"use strict";
/**
 * @module resource-types/xml
 */
import fs from "fs";
import sax from "sax";

/**
 * Set version value in the XML resource's element (defined in dot-notation
 * of element names, e.g. project.version in a Maven pom.xml).
 * Only the element's text is replaced, the rest of the file including its
 * formatting and comments is kept as-is.
 *
 * @param {String} version - version value to set
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the XML file
 * @param {String} resource.params.property - element names in dot-notation
 * @param {Object} opts - optional settings
 * @param {Boolean} [opts.dryRun] - when true, XML file won't be modified
 * @param {Function} cb - standard cb(err, result) callback
 */
function setVersion(version, resource, opts, cb) {
  const property = resource.params.property;
  const data = fs.readFileSync(resource.path, "UTF-8");
  const element = _findElement(data, property);
  if (!element) {
    cb(
      new Error(
        `Property ${property} does not exist in XML resource ${resource.path}`,
      ),
    );
  } else if (!opts.dryRun) {
    fs.writeFile(
      resource.path,
      data.slice(0, element.start) + version + data.slice(element.end),
      cb,
    );
  } else {
    cb();
  }
}

/**
 * Get version value from the XML resource's element (defined in
 * dot-notation of element names).
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the XML file
 * @param {String} resource.params.property - element names in dot-notation
 * @param {Function} cb - standard cb(err, result) callback, result is the
 *   version value
 */
function getVersion(resource, cb) {
  const property = resource.params.property;

  function readCb(err, result) {
    let version;
    if (!err) {
      const element = _findElement(result, property);
      version = element ? element.value : undefined;
    }
    cb(err, version);
  }
  fs.readFile(resource.path, "UTF-8", readCb);
}

/**
 * Check that the XML resource is ready for release, i.e. the file can be
 * parsed and the element exists with a value.
 *
 * @param {Object} resource - resource configuration
 * @param {String} resource.path - path to the XML file
 * @param {String} resource.params.property - element names in dot-notation
 * @param {Function} cb - standard cb(err, result) callback, result is true
 *   when the resource is ready for release, an error is passed when the file
 *   is not configured, the file can't be parsed, or the element doesn't exist or has no value
 */
function isReadyForRelease(resource, cb) {
  const property = resource.params && resource.params.property;

  function readCb(err, result) {
    let ready;
    if (!err) {
      try {
        const element = _findElement(result, property);
        if (!element) {
          err = new Error(
            `Property ${property} does not exist in XML resource ${resource.path}`,
          );
        } else if (element.value === "") {
          err = new Error(
            `Property ${property} has no value in XML resource ${resource.path}`,
          );
        } else {
          ready = true;
        }
      } catch (parseErr) {
        err = new Error(
          `Failed to parse XML resource ${resource.path}. Error: ${parseErr.message}`,
        );
      }
    }
    cb(err, ready);
  }
  if (!property) {
    cb(
      new Error(
        `XML resource ${resource.path} has no params.property configured`,
      ),
    );
  } else {
    fs.readFile(resource.path, "UTF-8", readCb);
  }
}

/**
 * Find the first element matching the element names in dot-notation, which
 * only contains text.
 *
 * The XML is parsed with a SAX parser in order to get the position of the
 * element's text, so that it can be replaced without re-serialising (and
 * reformatting) the whole file.
 *
 * @private
 * @param {String} data - XML content
 * @param {String} property - element names in dot-notation
 * @return {Object} the element's trimmed text value along with its start
 *   and end positions within the content, undefined when there is no match
 * @throws {Error} when XML content can't be parsed
 */
function _findElement(data, property) {
  const parser = sax.parser(true);
  const names = [];
  let textStart;
  let element;

  parser.onopentag = function (node) {
    names.push(node.name);
    if (
      element === undefined &&
      textStart === undefined &&
      !node.isSelfClosing &&
      names.join(".") === property
    ) {
      // position is right after the opening tag's '>'
      textStart = parser.position;
    }
  };
  parser.onclosetag = function () {
    if (
      element === undefined &&
      textStart !== undefined &&
      names.join(".") === property
    ) {
      // startTagPosition is right after the closing tag's '<'
      const text = data.slice(textStart, parser.startTagPosition - 1);
      // skip element with child elements, comments, or CDATA
      if (!text.includes("<")) {
        const value = text.trim();
        const start = textStart + text.indexOf(value);
        element = { value: value, start: start, end: start + value.length };
      }
      textStart = undefined;
    }
    names.pop();
  };
  parser.write(data).close();

  return element;
}

const exports = {
  setReleaseVersion: setVersion,
  setPostReleaseVersion: setVersion,
  getVersion: getVersion,
  isReadyForRelease: isReadyForRelease,
};

export { exports as default };
