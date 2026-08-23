const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcryptjs");

// GET USER PROFILE
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const posts = await Post.find({
      author: id,
    })
      .populate(
        "author",
        "username profilePicture"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      user,
      posts,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Unable to fetch profile.",
    });
  }
};

// UPDATE PROFILE
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (req.user.id !== id) {
      return res.status(403).json({
        message:
          "You can only update your own profile.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const {
      username,
      bio,
      profilePicture,
      password,
    } = req.body;

    if (username) {
      const existingUser =
        await User.findOne({
          username: username.trim(),
          _id: {
            $ne: id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          message: "Username already exists.",
        });
      }

      user.username = username.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (profilePicture !== undefined) {
      user.profilePicture =
        profilePicture.trim();
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must contain at least 6 characters.",
        });
      }

      user.password =
        await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        username: user.username,
        profilePicture:
          user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Unable to update profile.",
    });
  }
};

// SEARCH USERS
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || !query.trim()) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      username: {
        $regex: query.trim(),
        $options: "i",
      },
    })
      .select(
        "_id username profilePicture bio"
      )
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error);

    res.status(500).json({
      message: "Unable to search users.",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  searchUsers,
};