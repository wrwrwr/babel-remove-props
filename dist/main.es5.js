'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _babelGenerator = require('babel-generator');

var _babelGenerator2 = _interopRequireDefault(_babelGenerator);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _sideEffectsSafe = require('side-effects-safe');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var info = (0, _debug2.default)('remove-props');

/**
 * Removes properties matching regex specified as a plugin option.
 */

exports.default = function (_ref) {
    var types = _ref.types;

    var undef = types.identifier('undefined');
    var regex = undefined,
        pure = undefined;
    var visitor = {
        Program: {
            // Preprocess options.

            enter: function enter(path, state) {
                regex = state.opts.regex;
                if (!regex) {
                    throw new TypeError("A regex option is required.");
                }
                pure = function pure(n) {
                    return (0, _sideEffectsSafe.pureBabylon)(n, state.opts);
                };
            }
        },
        MemberExpression: function MemberExpression(path) {
            // obj.prop
            var _path$node = path.node;
            var computed = _path$node.computed;
            var object = _path$node.object;
            var property = _path$node.property;
            var parentPath = path.parentPath;

            var name = null;
            if (!computed) {
                name = property.name;
            } else if (types.isStringLiteral(property)) {
                name = property.value;
            }
            if (regex.test(name)) {
                if (types.isAssignmentExpression(parentPath)) {
                    // obj.prop = value (as an expression, not a declaration).
                    var grandparentPath = parentPath.parentPath;
                    var expStmt = types.isExpressionStatement(grandparentPath);
                    var objectPure = pure(object);
                    var rightPure = pure(parentPath.node.right);
                    if (expStmt && objectPure && rightPure) {
                        info('Removing: ' + source(grandparentPath));
                        grandparentPath.remove();
                    } else if (objectPure) {
                        info('Removing left in: ' + source(parentPath));
                        parentPath.replaceWith(parentPath.node.right);
                    } else if (expStmt && rightPure) {
                        info('Removing right in: ' + source(parentPath));
                        parentPath.replaceWith(object);
                    } else if (rightPure) {
                        // TODO: Replace with a sequence within expressions?
                        info('Impure object: ' + source(parentPath));
                    } else {
                        info('Impure object and value: ' + source(parentPath));
                    }
                } else {
                    // obj.prop (value use in an expression).
                    if (pure(object)) {
                        info('Replacing: ' + source(path) + ' in: ' + ('' + source(parentPath)));
                        path.replaceWith(undef);
                    } else {
                        info('Impure object: ' + source(path));
                    }
                }
            }
        },
        ObjectProperty: function ObjectProperty(path) {
            // prop: value
            var _path$node2 = path.node;
            var computed = _path$node2.computed;
            var key = _path$node2.key;
            var value = _path$node2.value;

            if (computed) {
                return;
            }
            var name = null;
            if (types.isIdentifier(key)) {
                name = key.name;
            } else if (types.isStringLiteral(key)) {
                name = key.value;
            }
            if (regex.test(name)) {
                if (pure(value)) {
                    info('Removing: ' + source(path));
                    path.remove();
                } else {
                    info('Inpure value: ' + source(path));
                }
            }
        }
    };
    return { visitor: visitor };
};

/**
 * Original or generated code (source for a transformed path may not be
 * available).
 */


function source(path) {
    return path.getSource() || (0, _babelGenerator2.default)(path.node).code;
}
