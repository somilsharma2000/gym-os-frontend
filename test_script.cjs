const ts = require('typescript');
const fs = require('fs');
const path = require('path');

function getAllTsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach(dirent => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(getAllTsxFiles(fullPath));
    } else if (dirent.isFile() && dirent.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getAllTsxFiles('src');

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'map') {
        const args = node.arguments;
        if (args.length > 0) {
          const callback = args[0];
          if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) {
            // Let's check any JSX returned or anywhere in callback
            const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            const line = lineAndChar.line + 1;
            
            // Find root JSX returned
            const jsxNode = getReturnedJsx(callback.body);
            if (jsxNode) {
              const hasKey = checkJsxHasKey(jsxNode);
              console.log(`${filePath}:${line} -> tag: <${getTagName(jsxNode)}> hasKey: ${hasKey}`);
            } else {
              // Check if callback body contains JSX at all
              if (callback.body.getText(sourceFile).includes('<')) {
                console.log(`[NO RETURN JSX MATCH] ${filePath}:${line} -> Body text: ${callback.body.getText(sourceFile).slice(0, 100).replace(/\n/g, ' ')}`);
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
});

function getReturnedJsx(body) {
  if (ts.isJsxElement(body) || ts.isJsxSelfClosingElement(body) || ts.isJsxFragment(body)) {
    return body;
  }
  if (ts.isParenthesizedExpression(body)) {
    return getReturnedJsx(body.expression);
  }
  if (ts.isBlock(body)) {
    for (const stmt of body.statements) {
      if (ts.isReturnStatement(stmt) && stmt.expression) {
        const jsx = getReturnedJsx(stmt.expression);
        if (jsx) return jsx;
      }
    }
  }
  if (ts.isConditionalExpression(body)) {
    const whenTrue = getReturnedJsx(body.whenTrue);
    if (whenTrue) return whenTrue;
    const whenFalse = getReturnedJsx(body.whenFalse);
    if (whenFalse) return whenFalse;
  }
  return null;
}

function checkJsxHasKey(jsxNode) {
  if (ts.isJsxFragment(jsxNode)) {
    return false;
  }
  let attributes;
  if (ts.isJsxElement(jsxNode)) {
    attributes = jsxNode.openingElement.attributes.properties;
  } else if (ts.isJsxSelfClosingElement(jsxNode)) {
    attributes = jsxNode.attributes.properties;
  }
  if (attributes) {
    for (const attr of attributes) {
      if (ts.isJsxAttribute(attr) && attr.name && attr.name.text === 'key') {
        return true;
      }
    }
  }
  return false;
}

function getTagName(jsxNode) {
  if (ts.isJsxFragment(jsxNode)) return 'React.Fragment';
  if (ts.isJsxElement(jsxNode)) return jsxNode.openingElement.tagName.getText();
  if (ts.isJsxSelfClosingElement(jsxNode)) return jsxNode.tagName.getText();
  return 'unknown';
}
