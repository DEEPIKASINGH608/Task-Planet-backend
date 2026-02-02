const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 1. CREATE POST (Keep your existing)
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. GET USER POSTS (For Profile Page)
router.get("/user/:username", async (req, res) => {
  try {
    const posts = await Post.find({ username: req.params.username }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. UPDATE PROFILE & SYNC TO HOME PAGE (The Fix)
// backend/routes/posts.js
router.put("/profile/update/:username", async (req, res) => {
  try {
    const { bio, profilePic } = req.body;
    let updateData = {};
    
    // Check if fields are present before adding to update object
    if (bio !== undefined) updateData.bio = bio;
    if (profilePic !== undefined) updateData.profilePic = profilePic;

    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: updateData },
      { new: true }
    );

    // Sync pic to all existing posts if it was changed
    if (profilePic) {
      await Post.updateMany(
        { username: req.params.username },
        { $set: { userProfilePic: profilePic } }
      );
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json("Server error during update");
  }
});


// 5. LIKE/COMMENT/DELETE (Keep your existing logic below)
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.username)) {
      await post.updateOne({ $push: { likes: req.body.username } });
      res.status(200).json("Liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.username } });
      res.status(200).json("Unliked");
    }
  } catch (err) { res.status(500).json(err); }
});

router.put("/comment/:id", async (req, res) => {
  try {
    const comment = { username: req.body.username, text: req.body.text, createdAt: new Date() };
    await Post.findByIdAndUpdate(req.params.id, { $push: { comments: comment } });
    res.status(200).json("Comment added");
  } catch (err) { res.status(500).json(err); }
});

router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json("Deleted");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;

