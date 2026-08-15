const { glob } = require('glob');
const path = require('path');

const STORIES_ROOT = path.join(__dirname, '..', '..', '..', 'unierp-design-system', 'src');
console.log(`Looking for stories in: ${STORIES_ROOT}`);

async function main() {
  const files = await glob('**/*.stories.@(ts|tsx)', { cwd: STORIES_ROOT, absolute: true });
  console.log(`Found ${files.length} story files`);
  for (const file of files.slice(0, 10)) {
    console.log(`  ${path.relative(STORIES_ROOT, file)}`);
  }
}

main().catch(console.error);