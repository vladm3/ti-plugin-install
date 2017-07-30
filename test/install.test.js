const os = require('os');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const fs = require('fs-extra');
const assert = require('assert');
const tiappXml = require('tiapp.xml');
const install = require('../');
const fixture = path.join.bind(null, __dirname, 'fixtures');

describe('ti-plugin-install', () => {
  describe('install', () => {
    const pluginId = 'generic-ti-plugin';
    const version = '1.0.0';
    const emitter = new EventEmitter();
    const fixtureDir = fixture('ti-project');
    let testDir;

    beforeEach(() => {
      testDir = path.join(os.tmpdir(), 'ti-plugin-install');
      fs.copySync(fixtureDir, testDir);
    });

    afterEach(() => {
      fs.removeSync(testDir);
    });

    it('should copy plugin code', () => {
      install(testDir, pluginId, false, emitter);
      assert(fs.existsSync(path.join(testDir, 'plugins', pluginId, version)));
    });

    it('should update tiapp.xml when updateTiApp = true', () => {
      install(testDir, pluginId, true, emitter);
      const tiapp = tiappXml.load(path.join(testDir, 'tiapp.xml'));
      const addedPlugin = tiapp.getPlugins()
        .find(plugin => plugin.id === pluginId && plugin.version === version);
      assert(addedPlugin);
    });
  });
});