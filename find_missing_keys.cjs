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

let totalMapCalls = 0;
let jsxMapCalls = 0;
let missingKeys = [];

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
        totalMapCalls++;
        const args = node.arguments;
        if (args.length > 0) {
          const callback = args[0];
          if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) {
            const returnedJsx = getReturnedJsx(callback.body);
            if (returnedJsx) {
              jsxMapCalls++;
              const hasKey = checkJsxHasKey(returnedJsx);
              const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart());
              const line = lineAndChar.line + 1;
              if (!hasKey) {
                missingKeys.push({
                  file: filePath,
                  line: line,
                  code: node.getText(sourceFile).slice(0, 100).replace(/\n/g, ' '),
                  returnedTag: getTagName(returnedJsx)
                });
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

console.log(`Total map calls: ${totalMapCalls}`);
console.log(`JSX map calls: ${jsxMapCalls}`);
console.log(`JSX map calls missing key: ${missingKeys.length}`);
console.log('\n--- Missing Keys Details ---');
missingKeys.forEach((m, idx) => {
  console.log(`${idx + 1}. ${m.file}:${m.line} -> tag: <${m.returnedTag}>`);
  console.log(`   Code: ${m.code}`);
});
