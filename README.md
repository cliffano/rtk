<img align="right" src="https://raw.github.com/cliffano/rtk/master/avatar.jpg" alt="Avatar"/>

[![Build Status](https://img.shields.io/travis/cliffano/rtk.svg)](http://travis-ci.org/cliffano/rtk)
[![Dependencies Status](https://img.shields.io/david/cliffano/rtk.svg)](http://david-dm.org/cliffano/rtk)
[![Coverage Status](https://img.shields.io/coveralls/cliffano/rtk.svg)](https://coveralls.io/r/cliffano/rtk?branch=master)
[![Published Version](https://img.shields.io/npm/v/rtk.svg)](http://www.npmjs.com/package/rtk)
<br/>
[![npm Badge](https://nodei.co/npm/rtk.png)](http://npmjs.org/package/rtk)

RTK
---

RTK is a tech stack agnostic software release and versioning tool, Zeus-style!

This is handy when you need to execute several steps as part of your release process. RTK comes with a default set of steps, but is also open for extension by implementing custom release scheme.

The default release scheme involves the following steps:

* Replace pre-release version on resource paths with its release version
* Commit the release version changes to SCM
* Add release tag using its version value
* Replace release version on resource paths with the next pre-release version
* Commit the next pre-release version changes to SCM

![Release the Kraken](https://raw.github.com/cliffano/rtk/master/release-the-kraken.jpg "Release the Kraken!")

Installation
------------

    npm install -g rtk

Usage
-----

Cut off a release using default Rtk release scheme:

    rtk release

Do a release dry run without modifying resource files and making any SCM changes:

    rtk release --dry-run

Configuration
-------------

Resources can be configured in .rtk.json file.

Example `json` resource configuration:

    {
      "resources": [
        {
          "path": "package.json",
          "type": "json",
          "params": {
            "property": "version"
          }
        }
      ]
    }

Example `keep-a-changelog` resource configuration:

    {
      "resources": [
        {
          "path": "CHANGELOG.md",
          "type": "keep-a-changelog"
        }
      ]
    }

Colophon
--------

[Developer's Guide](http://cliffano.github.io/developers_guide.html#nodejs)

Build reports:

* [Code complexity report](http://cliffano.github.io/rtk/complexity/plato/index.html)
* [Unit tests report](http://cliffano.github.io/rtk/test/buster.out)
* [Test coverage report](http://cliffano.github.io/rtk/coverage/buster-istanbul/lcov-report/lib/index.html)
* [Integration tests report](http://cliffano.github.io/rtk/test-integration/cmdt.out)
* [API Documentation](http://cliffano.github.io/rtk/doc/dox-foundation/index.html)
