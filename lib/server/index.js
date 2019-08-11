"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _express = _interopRequireDefault(require("express"));

var _util = require("util");

var _config = _interopRequireDefault(require("../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: true
}));
app.get('/', (req, res) => {
  console.log((0, _util.inspect)(req.body, {
    colors: true,
    depth: null
  }));
  res.end();
});
app.post('/', (req, res) => {
  console.log((0, _util.inspect)(req.body, {
    colors: true,
    depth: null
  }));
  res.end();
});

function _default(publicProjectId, privateProjectId) {
  app.set('projects', {
    public: publicProjectId,
    private: privateProjectId
  });
  return (0, _util.promisify)(app.listen.bind(app))(_config.default.port).then(() => _config.default.port);
}