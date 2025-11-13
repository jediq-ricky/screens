import { Page } from "@playwright/test";

/**
 * Delete a display by name from the displays page
 */
export async function deleteDisplayByName(page: Page, displayName: string) {
  try {
    await page.goto("/controller/displays", { timeout: 10000 });

    // Find the display card with this name
    const displayCard = page.locator('.bg-white.rounded-lg.shadow').filter({ hasText: displayName });

    // Check if it exists
    if (await displayCard.count() === 0) {
      return; // Display doesn't exist, nothing to delete
    }

    // Extract the display ID from the playlist link (either Configure or Create Playlist)
    const playlistLink = displayCard.locator('a:has-text("Playlist")').first();
    const href = await playlistLink.getAttribute('href');

    if (!href) {
      return;
    }

    // Extract display ID from href like "/controller/displays/123/playlist"
    const parts = href.split('/');
    const displayId = parts[parts.length - 2]; // Get the ID before "playlist"

    if (!displayId) {
      return;
    }

    // Check if the display has a playlist by looking at the link text
    const linkText = await playlistLink.textContent();

    // If it's "Configure Playlist", the display has a playlist we need to delete
    if (linkText?.includes('Configure')) {
      // Navigate to the playlist page to get the playlist ID
      const playlistPageUrl = await playlistLink.getAttribute('href');
      if (playlistPageUrl) {
        await page.goto(playlistPageUrl, { timeout: 10000 });
        // Get the playlist ID from the current URL
        const currentUrl = page.url();
        const playlistIdMatch = currentUrl.match(/\/playlists\/([^\/]+)$/);
        if (playlistIdMatch) {
          const playlistId = playlistIdMatch[1];
          // Delete the playlist via API
          await page.evaluate(async (id) => {
            await fetch(`/api/playlists/${id}`, {
              method: 'DELETE',
            });
          }, playlistId);
        }
      }
    }

    // Delete the display via API
    await page.evaluate(async (id) => {
      await fetch(`/api/displays/${id}`, {
        method: 'DELETE',
      });
    }, displayId);
  } catch (error) {
    // Ignore errors during cleanup
    console.log(`Cleanup error for display "${displayName}":`, error);
  }
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
