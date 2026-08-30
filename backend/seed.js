require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Post = require("./models/Post");

const DEMO_USERS = [
  { username: "maya.wanders", bio: "Chasing sunsets & good coffee ☕🌅", profilePicture: "https://i.pravatar.cc/150?img=32" },
  { username: "theo.codes", bio: "Full-stack tinkerer. Building small, shipping often.", profilePicture: "https://i.pravatar.cc/150?img=12" }, 
  { username: "luna.bakes", bio: "Sourdough experiments & Sunday baking diaries 🍞", profilePicture: "https://i.pravatar.cc/150?img=47" },
  { username: "kai.travels", bio: "Backpacking through life, one city at a time 🎒", profilePicture: "https://i.pravatar.cc/150?img=15" },
  { username: "noor.designs", bio: "Pixels, palettes & the occasional plant obsession 🎨🌿", profilePicture: "https://i.pravatar.cc/150?img=44" },
  { username: "ren.photos", bio: "35mm film photography. Slow living, fast shutter.", profilePicture: "https://i.pravatar.cc/150?img=68" },
];

const DEMO_POSTS = [
  { username: "maya.wanders", content: "Golden hour on the coast never gets old 🌇", seed: "maya-1" },
  { username: "maya.wanders", content: "Found the best little coffee shop hidden down an alley today.", seed: "maya-2" },
  { username: "theo.codes", content: "Finally shipped the feature I've been debugging all week 🚀", seed: "theo-1" },
  { username: "theo.codes", content: "Late night, good playlist, clean code. Perfect combo.", seed: "theo-2" },
  { username: "luna.bakes", content: "First sourdough loaf that actually rose properly!! 🍞", seed: "luna-1" },
  { username: "luna.bakes", content: "Sunday means cinnamon rolls and slow mornings.", seed: "luna-2" },
  { username: "kai.travels", content: "Got lost in the old town for three hours and loved every minute.", seed: "kai-1" },
  { username: "kai.travels", content: "Mountain air hits different when you've been in cities too long.", seed: "kai-2" },
  { username: "noor.designs", content: "New moodboard for a client project — obsessed with this palette.", seed: "noor-1" },
  { username: "noor.designs", content: "My desk plant finally has a new leaf 🌿", seed: "noor-2" },
  { username: "ren.photos", content: "Shot a whole roll of film on this trip, developing soon.", seed: "ren-1" },
  { username: "ren.photos", content: "Nothing beats natural light in the late afternoon.", seed: "ren-2" },
];

const DEMO_COMMENTS = [
  "This is gorgeous 😍", "Okay I need to go here immediately", "The vibes are immaculate",
  "So good!!", "Saving this for later", "This made my day", "Absolutely stunning",
  "Tell me your secrets 👀", "I felt this in my soul", "Obsessed with this",
];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSubset = (arr, max) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * max) + 1;
  return shuffled.slice(0, count);
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing from your .env file.");
    process.exit(1);
  }

    await connectDB();

  const usernames = DEMO_USERS.map((u) => u.username);

  // Clean up any previous demo data so this script is safe to re-run.
  const oldUsers = await User.find({ username: { $in: usernames } });
  const oldUserIds = oldUsers.map((u) => u._id);
  await Post.deleteMany({ author: { $in: oldUserIds } });
  await User.deleteMany({ username: { $in: usernames } });

  const hashedPassword = await bcrypt.hash("Demo@1234", 10);

  const createdUsers = await User.insertMany(
    DEMO_USERS.map((u) => ({ ...u, password: hashedPassword }))
  );

  const userByUsername = Object.fromEntries(createdUsers.map((u) => [u.username, u]));

  for (const postDef of DEMO_POSTS) {
    const author = userByUsername[postDef.username];
    const others = createdUsers.filter((u) => u._id.toString() !== author._id.toString());
    const likers = randomSubset(others, Math.min(4, others.length));
    const commenterCount = Math.floor(Math.random() * 3) + 1;
    const commenters = randomSubset(others, commenterCount);

    await Post.create({
      content: postDef.content,
      image: `https://picsum.photos/seed/${postDef.seed}/900/900`,
      author: author._id,
      likes: likers.map((u) => u._id),
      comments: commenters.map((u) => ({ text: randomItem(DEMO_COMMENTS), author: u._id })),
    });
  }

  console.log(`Seeded ${createdUsers.length} demo users and ${DEMO_POSTS.length} demo posts.`);
  console.log("Demo login password for all seeded accounts: Demo@1234");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});