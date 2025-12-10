/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Fetches the star count for a given GitHub repository.
 * @param repo The repository in the format 'owner/repo'.
 * @returns The number of stars.
 */
export async function getRepoStarCount(repo: string): Promise<number | null> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // Use GITHUB_TOKEN if available to avoid rate limits
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!response.ok) {
      if (response.status === 403) {
        console.warn(`GitHub API rate limit exceeded or forbidden for ${repo}. Star count will be hidden.`);
        return null;
      }
      throw new Error(`GitHub API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.stargazers_count;
  } catch (error) {
    console.error('Error fetching GitHub star count:', error);
    return null;
  }
}