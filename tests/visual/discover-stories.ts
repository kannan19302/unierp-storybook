import { globSync } from 'glob';
import path from 'path';
import { readFileSync } from 'fs';

const STORIES_ROOT = path.resolve(process.cwd(), '../design-system/src');

export interface StoryInfo {
  id: string;
  title: string;
  filePath: string;
  component: string;
}

export function discoverStories(): StoryInfo[] {
  console.log(`Looking for stories in: ${STORIES_ROOT}`);
  const storyFiles = globSync('**/*.stories.@(ts|tsx)', { cwd: STORIES_ROOT, absolute: true });
  console.log(`Found ${storyFiles.length} story files`);
  
  const stories: StoryInfo[] = [];
  
  for (const filePath of storyFiles) {
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(STORIES_ROOT, filePath);
    
    // Parse story exports to get story IDs and titles
    const exportMatches = content.matchAll(/export\s+(?:const|var|let)\s+(\w+)\s*=/g);
    const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
    
    const title = titleMatch?.[1] || path.basename(filePath, '.stories.tsx');
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
  // Convert "Components/Badge--Default" to "components-badge--default"
  const formattedId = storyId.toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
  return `/iframe.html?id=${formattedId}&viewMode=story&globals=theme:${theme},density:${density},mode:${mode}`;
}