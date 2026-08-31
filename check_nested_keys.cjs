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

let issues = [];

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
            const rootJsxNodes = [];
            collectReturnedJsx(callback.body, rootJsxNodes);

            for (const rootJsx of rootJsxNodes) {
              const rootHasKey = checkJsxHasKey(rootJsx);
              if (!rootHasKey) {
                // Check if any child of rootJsx has key
                let childWithKey = false;
                function checkChildren(child) {
                  if (child !== rootJsx && (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child))) {
                    if (checkJsxHasKey(child)) {
                      childWithKey = true;
                    }
                  }
                  ts.forEachChild(child, checkChildren);
                }
                ts.forEachChild(rootJsx, checkChildren);

                if (childWithKey) {
                  const lineAndChar = sourceFile.getLineAndCharacterOfPosition(rootJsx.getStart());
                  issues.push({
                    file: filePath,
                    line: lineAndChar.line + 1,
                    rootTag: rootJsx.openingElement ? rootJsx.openingElement.tagName.getText() : 'self-closing',
                    code: rootJsx.getText(sourceFile).slice(0, 100).replace(/\n/g, ' ')
                  });
                }
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

function collectReturnedJsx(node, list) {
  if (!node) return;
  if (ts.isParenthesizedExpression(node)) {
    collectReturnedJsx(node.expression, list);
  } else if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
    list.push(node);
  } else if (ts.isBlock(node)) {
    for (const stmt of node.statements) {
      if (ts.isReturnStatement(stmt) && stmt.expression) {
        collectReturnedJsx(stmt.expression, list);
      }
    }
  } else if (ts.isConditionalExpression(node)) {
    collectReturnedJsx(node.whenTrue, list);
    collectReturnedJsx(node.whenFalse, list);
  } else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
    collectReturnedJsx(node.right, list);
  }
}

function checkJsxHasKey(jsxNode) {
  if (ts.isJsxFragment(jsxNode)) return false;
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

console.log(`Issues found where root JSX lacks key but child has key: ${issues.length}`);
issues.forEach((iss, i) => {
  console.log(`${i+1}. ${iss.file}:${iss.line} root: <${iss.rootTag}> -> ${iss.code}`);
});
