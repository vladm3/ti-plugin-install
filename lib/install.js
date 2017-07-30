const path = require('path');
const fs = require('fs-extra');
const tiappXml = require('tiapp.xml');
const resolve = require('resolve');

/**
 * Installs plugin
 * @param {String} projectDir
 * @param {String} pluginName
 * @param {Boolean} updateTiApp
 * @param {EventEmitter} emitter
 */
const install = (projectDir, pluginName, updateTiApp, emitter) => {
  const tiappXmlPath = path.join(projectDir, 'tiapp.xml');
  if (!fs.pathExistsSync(tiappXmlPath) || !fs.statSync(tiappXmlPath).isFile()) {
    return emitter.emit('error', `Couldn't locate tiapp.xml in project dir ${projectDir}`);
  }

  emitter.emit('log', `Found tiapp.xml at ${tiappXml}`);

  let pluginPkgPath = null;
  try {
    pluginPkgPath = resolve.sync(`${pluginName}/package.json`, {
      basedir: projectDir
    });
  } catch (error) {
    return emitter.emit('error', `Couldn't resolve plugin ${pluginName}`, error);
  }

  const {
    name,
    version
  } = require(pluginPkgPath);
  const pluginDstDir = path.join(projectDir, 'plugins', name, version);

  try {
    fs.ensureDirSync(pluginDstDir);
    fs.emptyDirSync(pluginDstDir);
    emitter.emit('log', `Emptied dir ${pluginDstDir} for plugin`);
  } catch (error) {
    return emitter.emit('error', `Failed emptying dir ${pluginDstDir} for plugin`, error);
  }

  const pluginSrcDir = path.dirname(pluginPkgPath);
  try {
    fs.copySync(pluginSrcDir, pluginDstDir);
    emitter.emit('log', `Copied plugin code ${pluginSrcDir} -> ${pluginDstDir}`);
  } catch (error) {
    return emitter.emit('error', `Failed copying plugin code ${pluginSrcDir} -> ${pluginDstDir}`, error);
  }

  if (updateTiApp) {
    try {
      const tiapp = tiappXml.load(tiappXmlPath);
      tiapp.setPlugin(name, version);
      tiapp.write();
      emitter.emit('log', `Added plugin ${name}@${version} to "${tiappXmlPath}"`);
    } catch (error) {
      return emitter.emit('error', `Failed adding plugin ${name}@${version} to "${tiappXmlPath}"`, error);
    }
  }
};

module.exports = install;