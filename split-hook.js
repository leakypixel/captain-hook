#!/bin/bash
':' //;export PATH="/usr/local/bin:$PATH";
':' //;exec "$(command -v nodejs || command -v node)" "$0" "$@"
// Above set to ensure compatibility with Mac OSX GUI tools

const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;

// This file will be linked as the githooks in order to split them, so we need
// to know who called us, and where from (should always be the same place, but
// this way is reliable).
const callingFile = path.basename(__filename);
const hooksDir = path.dirname(__filename);

function exit(code) {
  process.exit(code);
}

function exec(hook) {
  const process = spawn("sh", [hook], {
    stdio: "inherit"
  });
  // If one of our hooks exits with a code other than zero, we want to pipe that
  // through to our calling shell.
  process.on("close", function(code) {
    if (code !== 0) {
      return exit(code);
    }
  });
}

// We call local hooks first. We're doing this because we want our shared hooks
// to (probably) validate against styleguides etc. - no use if a local hook can
// change stuff *after* we've checked it.
const localHook = path.join(hooksDir, "local", callingFile);
fs.stat(localHook, function(err, stats) {
  if (stats && stats.isFile()) {
    exec(localHook);
  }
});

const sharedHook = path.join(hooksDir, "shared", callingFile);
fs.stat(sharedHook, function(err, stats) {
  if (stats && stats.isFile()) {
    exec(sharedHook);
  }
});
