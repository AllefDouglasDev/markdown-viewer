const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE_NAME = 'markify-config.json';

function getConfigPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, CONFIG_FILE_NAME);
}

function getDefaultConfig() {
  return {
    version: '1.0',
    editor: {
      type: 'system',
      supportLineNumbers: true,
    },
    editorPresets: {
      vim: {
        command: 'vim',
        args: ['+{line}', '{file}'],
        terminal: true,
        name: 'Vim',
      },
      nvim: {
        command: 'nvim',
        args: ['+{line}', '{file}'],
        terminal: true,
        name: 'Neovim',
      },
      vscode: {
        command: 'code',
        args: ['--goto', '{file}:{line}'],
        terminal: false,
        name: 'VS Code',
      },
      cursor: {
        command: 'cursor',
        args: ['--goto', '{file}:{line}'],
        terminal: false,
        name: 'Cursor',
      },
      notepad: {
        command: 'notepad',
        args: ['{file}'],
        terminal: false,
        name: 'Notepad',
        platform: 'win32',
      },
      system: {
        useShell: true,
        name: 'System Default',
      },
    },
  };
}

function readConfig() {
  const configPath = getConfigPath();

  try {
    if (!fs.existsSync(configPath)) {
      const defaultConfig = getDefaultConfig();
      writeConfig(defaultConfig);
      return defaultConfig;
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading config:', error);
    return getDefaultConfig();
  }
}

function writeConfig(config) {
  const configPath = getConfigPath();

  try {
    const userDataPath = path.dirname(configPath);
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing config:', error);
    return false;
  }
}

function detectAvailableEditors() {
  const config = readConfig();
  const presets = config.editorPresets;
  const available = [];
  const { exec } = require('child_process');
  const platform = process.platform;

  return new Promise((resolve) => {
    const editorKeys = Object.keys(presets);
    let checked = 0;

    editorKeys.forEach((key) => {
      const preset = presets[key];

      if (key === 'system') {
        available.push({ key, ...preset });
        checked++;
        if (checked === editorKeys.length) resolve(available);
        return;
      }

      if (preset.platform && preset.platform !== platform) {
        checked++;
        if (checked === editorKeys.length) resolve(available);
        return;
      }

      const checkCommand = platform === 'win32'
        ? `where ${preset.command}`
        : `which ${preset.command}`;

      exec(checkCommand, (error) => {
        if (!error) {
          available.push({ key, ...preset });
        }
        checked++;
        if (checked === editorKeys.length) {
          resolve(available);
        }
      });
    });
  });
}

module.exports = {
  getConfigPath,
  getDefaultConfig,
  readConfig,
  writeConfig,
  detectAvailableEditors,
};
