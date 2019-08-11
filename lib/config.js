"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

(0, _assert.default)(process.env.TG_API_TOKEN, 'TG_API_TOKEN is required');
const config = {
  dev: process.env.NODE_ENV === 'development',
  apiToken: process.env.TG_API_TOKEN || '',
  port: +process.env.PORT || 3000
};
var _default = config;
exports.default = _default;