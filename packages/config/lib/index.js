"use strict";
exports.__esModule = true;
exports.getRuntimeConfig = exports.getConfig = void 0;
var fs = require("fs-extra");
var yaml = require("js-yaml");
var path = require("path");
var FILE_ENV_NAME = {
    development: 'dev',
    test: 'test',
    production: 'prod'
};
function getConfig() {
    var env = process.env.NODE_ENV || 'development';
    var filePath = path.join(__dirname, '../../../config', "".concat(FILE_ENV_NAME[env], ".yaml"));
    if (!fs.existsSync(filePath)) {
        throw new Error("Can not find config file: ".concat(filePath));
    }
    return yaml.load(fs.readFileSync(filePath, 'utf8'));
}
exports.getConfig = getConfig;
function getRuntimeConfig() {
    var env = process.env.NODE_ENV || 'development';
    var filePath = path.join(__dirname, '../../../../../../', "dynamic.yaml");
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, '../../../config', "dynamic.yaml");
    }
    if (!fs.existsSync(filePath)) {
        throw new Error("Can not find config file: ".concat(filePath));
    }
    return (yaml.load(fs.readFileSync(filePath, 'utf8')).dynamic || {});
}
exports.getRuntimeConfig = getRuntimeConfig;
