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

![Release the Kraken](https://raw.github.com/cliffano/rtk/master/release-the-kraken.jpg "Release the Kraken!")

This is handy when you need to execute several steps as part of your release process. RTK comes with a default set of steps, but it's also open for extension by implementing custom release scheme.

The default release scheme involves the following steps:

* Replace pre-release version on resource paths with its release version
* Commit the release version changes to SCM
* Add release tag using its version value
* Replace release version on resource paths with the next pre-release version
* Commit the next pre-release version changes to SCM

![RTK console screenshot](https://raw.github.com/cliffano/rtk/master/screenshots/console.jpg "RTK console screenshot")

Installation
------------

    npm install -g rtk

Usage
-----

Cut off a release using default Rtk release scheme:

    rtk release

By default, the release version will increment minor value, and the next pre-release version will increment patch value.

This default is based on the idea that most release involves additions and changes (which often mean minor value increment), more than removals (which could mean backward incompatible major value increment) and fixes (which often mean patch value increment).

However, in order to honour the possibility of fixes, the next pre-release version will increment patch value.

The increment types can be customised, e.g. to cut off a release with major release and minor post-release increment types:

    rtk release --release-increment-type major --post-release-increment-type minor

Do a release dry run without modifying resource files and making any SCM changes:

    rtk release --dry-run

Cut off a release with major release and minor post-release increment types:

    rtk release --release-increment-type major --post-release-increment-type minor

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

Example `yaml` resource configuration:

    {
      "resources": [
        {
          "path": "playbook.yaml",
          "type": "yaml",
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

Example `makefile` resource configuration:

    {
      "resources": [
        {
          "path": "Makefile",
          "type": "makefile",
          "params": {
            "variable": "version"
          }
        }
      ]
    }

It is also possible to force the release and post-release values instead of using the version scheme generated value:
Note: because release and post-release values are specified at resource level, the SCM tag will still use the version scheme generated value

{
  "resources": [
    {
      "path": "package.json",
      "type": "json",
      "params": {
        "property": "version",
        "release_value": "1.2.3",
        "post_release_value": "master"
      }
    }
  ]
}

If you want to format the tag instead of using the version number as the tag, you can configure `tagFormat` property:

    {
      "tagFormat": "v{version}",
      "resources": [...]
    }

The above example will set the tag `v1.2.3` for version `1.2.3` .

Colophon
--------

[Developer's Guide](http://cliffano.github.io/developers_guide.html#nodejs)

Build reports:

* [Code complexity report](http://cliffano.github.io/rtk/complexity/plato/index.html)
* [Unit tests report](http://cliffano.github.io/rtk/test/buster.out)
* [Test coverage report](http://cliffano.github.io/rtk/coverage/buster-istanbul/lcov-report/lib/index.html)
* [Integration tests report](http://cliffano.github.io/rtk/test-integration/cmdt.out)
* [API Documentation](http://cliffano.github.io/rtk/doc/dox-foundation/index.html)
