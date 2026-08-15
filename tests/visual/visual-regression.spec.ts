import { test, expect } from '@playwright/test';
import { discoverStories, THEMES, DENSITIES, MODES, generateStoryUrl } from './discover-stories';

const BASELINE_DIR = '../../scripts/ci/visual-baselines';

test.describe.configure({ retries: 0 });

test.describe('Visual Regression', () => {
  let stories: Awaited<ReturnType<typeof discoverStories>>;

  test.beforeAll(async () => {
    stories = await discoverStories();
    console.log(`Discovered ${stories.length} stories for visual regression testing`);
  });

  for (const story of stories) {
    for (const theme of THEMES) {
      for (const density of DENSITIES) {
        for (const mode of MODES) {
          const testName = `${story.component} > ${story.title} [theme=${theme}, density=${density}, mode=${mode}]`;
          
          test(testName, async ({ page }) => {
            const url = generateStoryUrl(story.id, theme, density, mode);
            await page.goto(url);
            await page.waitForLoadState('networkidle');
            
            // Wait for the story to render
            await page.waitForSelector('#storybook-root', { timeout: 10000 });
            
            // Take screenshot
            const screenshot = await page.screenshot({
              fullPage: true,
              animations: 'disabled',
            });
            
            // Compare with baseline
            const baselineName = `${story.component}--${story.title}--${theme}--${density}--${mode}.png`.replace(/[^a-zA-Z0-9.-]/g, '_');
            await expect(screenshot).toMatchSnapshot(baselineName, {
              maxDiffPixels: 100,
              threshold: 0.2,
            });
          });
        }
      }
    }
  }
});