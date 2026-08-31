const fs = require('fs');
const execSync = require('child_process').execSync;

const output = execSync(`grep -rn '\\.map(' src/ --include='*.tsx' | grep -v 'key=' | grep -v 'const\\|let\\|var\\|headers\\|col\\|formatted\\|list\\|current\\|found\\|matchedDemo\\|counts\\|Object'`).toString();

const lines = output.trim().split('\n');

lines.forEach((l, i) => {
  const parts = l.split(':');
  const filePath = parts[0];
  const lineNum = parseInt(parts[1], 10);
  const lineText = parts.slice(2).join(':');

  const fileContent = fs.readFileSync(filePath, 'utf8').split('\n');
  const start = Math.max(0, lineNum - 1);
  const end = Math.min(fileContent.length, lineNum + 15);
  const context = fileContent.slice(start, end);

  let keyFound = false;
  for (let cIdx = 0; cIdx < context.length; cIdx++) {
    if (context[cIdx].includes('key=')) {
      keyFound = true;
      break;
    }
  }

  if (!keyFound) {
    console.log(`[${i+1}/${lines.length}] ${filePath}:${lineNum}`);
    console.log(`  Map line: ${lineText.trim()}`);
    console.log(`  Context:\n` + context.slice(0, 8).map(x => '     ' + x).join('\n'));
    console.log('-'.repeat(60));
  }
});
