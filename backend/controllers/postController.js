const mongoose = require("mongoose");
const Post = require("../models/Post");

// GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        "author",
        "username profilePicture bio"
      )
      .populate(
        "comments.author",
        "username profilePicture"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      message: "Unable to fetch posts.",
    });
  }
};

// GET ONE POST
const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(id)
      .populate(
        "author",
        "username profilePicture bio"
      )
      .populate(
        "comments.author",
        "username profilePicture"
      );

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Get single post error:", error);

    res.status(500).json({
      message: "Unable to fetch post.",
    });
  }
};

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required.",
      });
    }

    const post = await Post.create({
      content: content.trim(),
      author: req.user.id,
    });

    const populatedPost = await Post.findById(
      post._id
    ).populate(
      "author",
      "username profilePicture bio"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      message: "Unable to create post.",
    });
  }
};

// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required.",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    // OWNER CHECK
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message:
          "You can only edit your own posts.",
      });
    }

    post.content = content.trim();

    await post.save();

    const updatedPost = await Post.findById(
      post._id
    ).populate(
      "author",
      "username profilePicture bio"
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Update post error:", error);

    res.status(500).json({
      message: "Unable to update post.",
    });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    // OWNER CHECK
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message:
          "You can only delete your own posts.",
      });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    res.status(500).json({
      message: "Unable to delete post.",
    });
  }
};

// LIKE / UNLIKE POST
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    const userId = req.user.id;

    const alreadyLiked = post.likes.some(
      (likeId) =>
        likeId.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (likeId) =>
          likeId.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(id)
      .populate(
        "author",
        "username profilePicture"
      )
      .populate(
        "comments.author",
        "username profilePicture"
      );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Like error:", error);

    res.status(500).json({
      message: "Unable to like/unlike post.",
    });
  }
};

// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty.",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    post.comments.push({
      text: text.trim(),
      author: req.user.id,
    });

    await post.save();

    const updatedPost = await Post.findById(id)
      .populate(
        "author",
        "username profilePicture"
      )
      .populate(
        "comments.author",
        "username profilePicture"
      );

    res.status(201).json(updatedPost);
  } catch (error) {
    console.error("Comment error:", error);

    res.status(500).json({
      message: "Unable to add comment.",
    });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
};