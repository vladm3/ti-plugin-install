const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const {
  Builder,
  Parser
} = require('xml2js');

const install = (projectDir, pluginName, updateTiApp) => {
  const tiappXml = path.join(projectDir, 'tiapp.xml');
  if (!fs.pathExistsSync(tiappXml) || !fs.statSync(tiappXml).isFile()) {
    console.log(chalk.yellow(`Couldn't locate tiapp.xml at ${tiappXml}`));
    return;
  }

  console.log(chalk.green(`Found tiapp.xml at ${tiappXml}`));

  let pluginPkgPath = null;
  try {
    pluginPkgPath = require.resolve(`${pluginName}/package.json`);
  } catch (e) {
    console.log(chalk.yellow(`Couldn't resolve plugin ${pluginName}`));
    return;
  }

  console.log(chalk.green(`Found ${pluginName}'s package.json at ${pluginPkgPath}`));

  const {
    name,
    version
  } = require(pluginPkgPath);
  const dstDir = path.join(projectDir, 'plugins', name, version);

  console.log(chalk.green(`Cleaning dir ${dstDir} for plugin`));
  fs.ensureDirSync(dstDir);
  fs.emptyDirSync(dstDir);

  const srcDir = path.dirname(pluginPkgPath);
  console.log(chalk.green(`Copying plugin code ${srcDir} -> ${dstDir}`));
  fs.copySync(srcDir, dstDir);

  if (updateTiApp) {
    const tiapp = fs.readFileSync(tiappXml);
    const xmlParser = new Parser();
    xmlParser.parseString(tiapp, (err, result) => {
      if (err || !result) {
        console.log(chalk.red(`Failed parsing tiapp.xml at ${tiappXml}`));
        return;
      }

      if (!result['ti:app']) {
        console.log(chalk.red(`ti:app element not found in tiapp.xml at ${tiappXml}`));
        return;
      }

      if (!result['ti:app'].plugins || !result['ti:app'].plugins[0]) {
        result['ti:app'].plugins = [{}];
      }

      const plugins = result['ti:app'].plugins[0].plugin || [];
      const newPlugins = plugins
        .filter(({ _ }) => _ !== name)
        .concat({
          _: name,
          $: { version }
        });
      
      result['ti:app'].plugins[0].plugin = newPlugins;

      const builder = new Builder({
        renderOpts: {
          pretty: true,
          indent: '  ',
          newline: '\n'
        }
      });
      const xml = builder.buildObject(result);

      console.log(chalk.green(`Adding plugin directive to tiapp.xml at ${tiappXml}`));
      fs.writeFileSync(tiappXml, xml);
    });
  }
};

module.exports = install;