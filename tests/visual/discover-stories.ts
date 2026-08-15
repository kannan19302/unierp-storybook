import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORIES_ROOT = path.join(__dirname, '..', '..', '..', 'unierp-design-system', 'src');

export interface StoryInfo {
  id: string;
  title: string;
  filePath: string;
  component: string;
}

export async function discoverStories(): Promise<StoryInfo[]> {
  console.log(`Looking for stories in: ${STORIES_ROOT}`);
  const storyFiles = await glob('**/*.stories.@(ts|tsx)', { cwd: STORIES_ROOT, absolute: true });
  console.log(`Found ${storyFiles.length} story files`);
  
  const stories: StoryInfo[] = [];
  
  for (const filePath of storyFiles) {
    const content = await readFile(filePath, 'utf-8');
    const relativePath = path.relative(STORIES_ROOT, filePath);
    
    // Parse story exports to get story IDs and titles
    const exportMatches = content.matchAll(/export\s+(?:const|var|let)\s+(\w+)\s*=/g);
    const defaultExportMatch = content.match(/export\s+default\s+\{\s*title:\s*['"]([^'"]+)['"]/);
    
    const title = defaultExportMatch?.[1] || path.basename(filePath, '.stories.tsx');
    const component = path.dirname(relativePath).split(path.sep).pop() || 'unknown';
    
    // Find named exports (individual stories)
    let hasNamedExports = false;
    for (const match of exportMatches) {
      const storyName = match[1];
      if (!storyName.startsWith('_') && storyName !== 'meta') {
        hasNamedExports = true;
        stories.push({
          id: `${title}--${storyName}`,
          title,
          filePath: relativePath,
          component,
        });
      }
    }
    
    // Also add the primary story if no named exports
    if (!hasNamedExports) {
      stories.push({
        id: title,
        title,
        filePath: relativePath,
        component,
      });
    }
  }
  
  return stories;
}

export const THEMES = ['light', 'dark', 'enterprise', 'modern', 'minimal', 'classic', 'high-contrast'];
export const DENSITIES = ['comfortable', 'compact'];
export const MODES = ['light', 'dark'];

export function generateStoryUrl(storyId: string, theme: string, density: string, mode: string): string {
  const encodedId = encodeURIComponent(storyId);
  return `/?path=/${encodedId}&globals=theme:${theme},density:${density},mode:${mode}`;
}