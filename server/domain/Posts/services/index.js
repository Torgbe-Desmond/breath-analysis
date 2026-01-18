const fs = require("fs").promises;
const path = require("path");

const dataFile = path.join(__dirname, "../../../config/redditData.json");
console.log("dataFile",dataFile)
/**
 * Artificial delay to simulate DB / network latency
 */
const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Read posts from JSON file (async)
 */
async function readPostsFromFile() {
  const raw = await fs.readFile(dataFile, "utf-8");
  return JSON.parse(raw);
}

/**
 * Get filtered & paginated posts (async)
 */
async function getPosts({
  author,
  subreddit,
  flair,
  keyword,
  page = 1,
  limit = 10,
}) {
  // Simulate real server latency
  await delay(400);

  const posts = await readPostsFromFile();

  let filteredPosts = posts;

  // -------- FILTERS --------
  if (author) {
    filteredPosts = filteredPosts.filter((p) =>
      p.data.author?.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (subreddit) {
    filteredPosts = filteredPosts.filter((p) =>
      p.data.subreddit?.toLowerCase().includes(subreddit.toLowerCase())
    );
  }

  if (flair) {
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.data.link_flair_text &&
        p.data.link_flair_text.toLowerCase().includes(flair.toLowerCase())
    );
  }

  if (keyword) {
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.data.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        p.data.selftext?.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // -------- PAGINATION --------
  const pageNumber = Math.max(parseInt(page, 10), 1);
  const limitNumber = Math.max(parseInt(limit, 10), 1);

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / limitNumber);

  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = startIndex + limitNumber;

  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  console.log("paginatedPosts",paginatedPosts.length)

  return {
    posts: paginatedPosts,
    pagination: {
      totalPosts,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  };
}

module.exports = {
  getPosts,
};
