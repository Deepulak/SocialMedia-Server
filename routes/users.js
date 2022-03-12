const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.user.isAdmin) {
        if(req.body.passowrd) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.passowrd = await bcrypt.hash(req.body.passowrd, salt);
            } catch (err) {
                return res.status(500).json();
            }
        }
        try {
            const user = User.findByIdAndUpdate(req.params.id, {$set: req.body, });
            res.status(200).json("Account has been updated.");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});
// delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    }
    else {
        return res.status(403).json("You can delete only your account!");
    }
});
// get a user
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId
        ? await User.findById(userId)
        : await User.findOne({ username: username });
        const { passowrd, updatedAt, ...other } = user._doc;
        res.status(200).json(user);
    } catch(err) {
        res.status(500).json(error);
    }
});
//get friends
router.get("/friends/:userId", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const friends = await Promise.all(
        user.followings.map((friendId) => {
          return User.findById(friendId);
        })
      );
      let friendList = [];
      friends.map((friend) => {
        const { _id, username, profilePicture } = friend;
        friendList.push({ _id, username, profilePicture });
      });
      res.status(200).json(friendList);
    } catch (err) {
      res.status(500).json(err);
    }
});

// get friends
router.get("/friends/:userId", async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map(friendId => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map(friend => {
            const {_id, username, profilePicture} = friend;
            friendList.push({ _id, username, profilePicture })
        });
        res.status(200).json(friendList);
    } catch(err) {
        res.status(500).json(err);
    }
});

// follow a user
router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const cuurentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: {followers: req.body.userId } });
                await currentUser.updateOne({ $push: {followings: req.body.id } });
                res.status(200).json("user has been followed.");
            } else {
                res.status(403).json("You already follow this user!");
            }
        } catch {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cant follow yourself");
    }
});
// unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const cuurentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: {followers: req.body.userId } });
                await currentUser.updateOne({ $pull: {followings: req.body.id } });
                res.status(200).json("user has been unfollowed.");
            } else {
                res.status(403).json("You dont follow this user!");
            }
        } catch {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cant unfollow yourself");
    }
});

module.exports = router;