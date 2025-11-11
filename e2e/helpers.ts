import { Page } from "@playwright/test";

/**
 * Delete a display by name from the displays page
 */
export async function deleteDisplayByName(page: Page, displayName: string) {
  await page.goto("/controller/displays");

  // Find the display card with this name
  const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });

  // Check if it exists
  if (await displayCard.count() === 0) {
    return; // Display doesn't exist, nothing to delete
  }

  // Extract the display ID from the Configure Playlist link
  const configureLink = displayCard.locator('a:has-text("Configure Playlist")');
  const href = await configureLink.getAttribute('href');

  if (!href) {
    return;
  }

  // Extract display ID from href like "/controller/playlists/123"
  const displayId = href.split('/').pop();

  if (!displayId) {
    return;
  }

  // Make API call to delete the display
  await page.evaluate(async (id) => {
    await fetch(`/api/displays/${id}`, {
      method: 'DELETE',
    });
  }, displayId);
}

/**
 * Delete a video by title from the video library
 */
export async function deleteVideoByTitle(page: Page, videoTitle: string) {
  // Get all videos via API and find the one with matching title
  const videoId = await page.evaluate(async (title) => {
    const response = await fetch('/api/videos');
    const data = await response.json();
    const video = data.videos.find((v: any) => v.title === title);
    return video?.id;
  }, videoTitle);

  if (!videoId) {
    return; // Video doesn't exist, nothing to delete
  }

  // Make API call to delete the video
  await page.evaluate(async (id) => {
    await fetch(`/api/videos/${id}`, {
      method: 'DELETE',
    });
  }, videoId);
}
