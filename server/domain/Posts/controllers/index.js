const postsService = require("../services/index");

async function getPostsController(req, res) {
  try {
    const result = await postsService.getPosts(req.query);
    res.json(result);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to load posts" });
  }
}

module.exports = {
  getPostsController,
};
