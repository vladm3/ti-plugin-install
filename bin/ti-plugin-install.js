#!/usr/bin/env node

const minimist = require('minimist');
const install = require('../lib/install');
const args = minimist(process.argv);
const projectDir = process.cwd().replace(/(.+[/\\])node_modules.+/, '$1');
install(projectDir, args.p, false);