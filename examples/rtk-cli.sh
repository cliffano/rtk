#!/usr/bin/env bash
set -o errexit
set -o nounset

cd ../
npm link .
cd examples/

# NOTE: all release examples use --dry-run, which only logs the versions that
# would be set, without modifying any file, committing, or tagging the repo.

printf "\n\n========================================\n"
printf "Show help guide:\n"
rtk --help

printf "\n\n========================================\n"
printf "Show version info: rtk --version\n"
rtk --version

printf "\n\n========================================\n"
printf "Dry run release with default config file .rtk.json:\n"
rtk --dry-run release

printf "\n\n========================================\n"
printf "Dry run release with specified config file containing multiple resource types:\n"
rtk --dry-run --config-file customrtk.json release

printf "\n\n========================================\n"
printf "Dry run major release with minor post release increment:\n"
rtk --dry-run --config-file customrtk.json release --release-increment-type major --post-release-increment-type minor

printf "\n\n========================================\n"
printf "Dry run patch release, releasing current pre-release version as-is:\n"
rtk --dry-run --config-file customrtk.json release --release-increment-type patch
