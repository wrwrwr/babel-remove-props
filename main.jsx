import generate from 'babel-generator';
import debug from 'debug';
import {pureBabylon} from 'side-effects-safe';

const info = debug('remove-props');


/**
 * Removes properties matching regex specified as a plugin option.
 */
export default ({types}) => {
    const undef = types.identifier('undefined');
    let regex, pure;
    let visitor = {
        Program: {
            // Preprocess options.
            enter(path, state) {
                regex = state.opts.regex;
                if (!regex) {
                    throw new TypeError("A regex option is required.");
                }
                pure = n => pureBabylon(n, state.opts);
            }
        },
        MemberExpression(path) {
            // obj.prop
            let {node: {computed, object, property}, parentPath} = path;
            let name = null;
            if (!computed) {
                name = property.name;
            } else if (types.isStringLiteral(property)) {
                name = property.value;
            }
            if (regex.test(name)) {
                if (types.isAssignmentExpression(parentPath)) {
                    // obj.prop = value (as an expression, not a declaration).
                    let grandparentPath = parentPath.parentPath;
                    let expStmt = types.isExpressionStatement(grandparentPath);
                    let objectPure = pure(object);
                    let rightPure = pure(parentPath.node.right);
                    if (expStmt && objectPure && rightPure) {
                        info(`Removing: ${source(grandparentPath)}`);
                        grandparentPath.remove();
                    } else if (objectPure) {
                        info(`Removing left in: ${source(parentPath)}`);
                        parentPath.replaceWith(parentPath.node.right);
                    } else if (expStmt && rightPure) {
                        info(`Removing right in: ${source(parentPath)}`);
                        parentPath.replaceWith(object);
                    } else if (rightPure) {
                        // TODO: Replace with a sequence within expressions?
                        info(`Impure object: ${source(parentPath)}`);
                    } else {
                        info(`Impure object and value: ${source(parentPath)}`);
                    }
                } else {
                    // obj.prop (value use in an expression).
                    if (pure(object)) {
                        info(`Replacing: ${source(path)} in: ` +
                             `${source(parentPath)}`);
                        path.replaceWith(undef);
                    } else {
                        info(`Impure object: ${source(path)}`);
                    }
                }
            }
        },
        ObjectProperty(path) {
            // prop: value
            let {node: {computed, key, value}} = path;
            if (computed) {
                return;
            }
            let name = null;
            if (types.isIdentifier(key)) {
                name = key.name;
            } else if (types.isStringLiteral(key)) {
                name = key.value;
            }
            if (regex.test(name)) {
                if (pure(value)) {
                    info(`Removing: ${source(path)}`);
                    path.remove();
                } else {
                    info(`Inpure value: ${source(path)}`);
                }
            }
        }
    };
    return {visitor};
};


/**
 * Original or generated code (source for a transformed path may not be
 * available).
 */
function source(path) {
    return path.getSource() || generate(path.node).code;
}
