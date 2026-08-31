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

let results = [];

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
            const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            const line = lineAndChar.line + 1;

            const returnedJsxElements = [];
            collectReturnedJsx(callback.body, returnedJsxElements);

            if (returnedJsxElements.length > 0) {
              for (const jsxNode of returnedJsxElements) {
                const hasKey = checkJsxHasKey(jsxNode);
                results.push({
                  file: filePath,
                  line,
                  tagName: getTagName(jsxNode),
                  hasKey,
                  codeSnippet: jsxNode.getText(sourceFile).slice(0, 80).replace(/\n/g, ' ')
                });
              }
            } else {
              // Check if body contains JSX text at all
              const text = callback.body.getText(sourceFile);
              if (/<[a-zA-Z]/.test(text)) {
                results.push({
                  file: filePath,
                  line,
                  tagName: 'UNKNOWN_JSX',
                  hasKey: false,
                  codeSnippet: text.slice(0, 80).replace(/\n/g, ' ')
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
  if (ts.isJsxFragment(jsxNode)) return 'React.Fragment (<>)';
  if (ts.isJsxElement(jsxNode)) return jsxNode.openingElement.tagName.getText();
  if (ts.isJsxSelfClosingElement(jsxNode)) return jsxNode.tagName.getText();
  return 'unknown';
}

console.log(`Total map results analyzed: ${results.length}`);
const missing = results.filter(r => !r.hasKey);
console.log(`Missing keys count: ${missing.length}`);
missing.forEach((m, idx) => {
  console.log(`${idx + 1}. ${m.file}:${m.line} Tag: <${m.tagName}> | Snippet: ${m.codeSnippet}`);
});
