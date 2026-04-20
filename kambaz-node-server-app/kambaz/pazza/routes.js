import { PazzaDao, FoldersDao } from "./dao.js";

export default function PazzaRoutes(app) {
  const pDao = PazzaDao();
  const fDao = FoldersDao();

  function extractUser(req) {
    const u = req.session?.currentUser;
    if (!u) return null;
    return {
      id: u._id,
      role: u.role === "FACULTY" ? "INSTRUCTOR" : "STUDENT",
      name:
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        u.email ||
        "Unknown",
    };
  }

  app.get("/api/pazza/:cid/posts", async (req, res) => {
    try {
      const posts = await pDao.findPostsForCourse(req.params.cid);
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

  app.post("/api/pazza/:cid/posts", async (req, res) => {
    try {
      const { cid } = req.params;
      if (!cid || cid === "undefined")
        return res.status(400).json({ error: "Invalid course ID." });

      const user = extractUser(req);
      const { type, postTo, folders, summary, details } = req.body;
      const post = await pDao.createPost(
        cid,
        user?.id || null,
        user?.role || "STUDENT",
        user?.name || "Unknown",
        { type, postTo, folders, summary, details }
      );
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

  app.get("/api/pazza/posts/:pid/details", async (req, res) => {
    try {
      const post = await pDao.findPostWithDetails(req.params.pid);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

  app.delete("/api/pazza/posts/:pid", async (req, res) => {
    try {
      const { pid } = req.params;
      console.log("DELETE post request for pid:", pid);

      const currentUser = req.session?.currentUser;
      console.log("currentUser on delete:", currentUser?._id, currentUser?.role);

      const post = await pDao.findPostById(pid);
      console.log("Found post:", post?._id, "author:", post?.author);

      if (!post) return res.status(404).json({ error: "Post not found.", pid });

      const isInstructor =
        currentUser?.role === "FACULTY" || currentUser?.role === "INSTRUCTOR";
      const isAuthor = currentUser?._id === post.author;
      if (!isInstructor && !isAuthor)
        return res.status(403).json({ error: "Not authorized to delete this post." });

      await pDao.deletePost(pid);
      res.json({ deleted: pid });
    } catch (err) {
      console.error("Error deleting post:", err);
      res.status(500).send(err.message);
    }
  });

  app.get("/api/pazza/:cid/stats", async (req, res) => {
    try {
      const { cid } = req.params;
      const userId = req.session?.currentUser?._id || null;
      const stats = await pDao.getCourseStats(cid, userId);
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

  app.post("/api/pazza/posts/:postId/answers", async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const user = extractUser(req);
      if (!user) return res.status(401).json({ error: "Not logged in." });

      const answer = await pDao.createAnswer(
        postId,
        user.id,
        user.name,
        user.role,
        content
      );
      res.json(answer);
    } catch (err) {
      console.error("Error creating answer:", err);
      res.status(500).send(err.message);
    }
  });

  app.delete("/api/pazza/answers/:answerId", async (req, res) => {
    try {
      const { answerId } = req.params;
      await pDao.deleteAnswer(answerId);
      res.json({ deleted: answerId });
    } catch (err) {
      console.error("Error deleting answer:", err);
      res.status(500).send(err.message);
    }
  });

  app.post("/api/pazza/posts/:postId/followups", async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const user = extractUser(req);
      if (!user) return res.status(401).json({ error: "Not logged in." });

      const followup = await pDao.createFollowup(
        postId,
        user.id,
        user.name,
        user.role,
        content
      );
      res.json(followup);
    } catch (err) {
      console.error("Error creating followup:", err);
      res.status(500).send(err.message);
    }
  });

  app.delete("/api/pazza/followups/:followupId", async (req, res) => {
    try {
      const { followupId } = req.params;
      await pDao.deleteFollowup(followupId);
      res.json({ deleted: followupId });
    } catch (err) {
      console.error("Error deleting followup:", err);
      res.status(500).send(err.message);
    }
  });

  app.put("/api/pazza/followups/:followupId/resolve", async (req, res) => {
    try {
      const { followupId } = req.params;
      const updated = await FollowupModel.findOneAndUpdate(
        { _id: followupId },
        [{ $set: { isResolved: { $not: "$isResolved" } } }],
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Followup not found." });
      res.json(updated);
    } catch (err) {
      console.error("Error toggling followup resolve:", err);
      res.status(500).send(err.message);
    }
  });

  app.post("/api/pazza/followups/:followupId/replies", async (req, res) => {
    try {
      const { followupId } = req.params;
      const { content } = req.body;
      const user = extractUser(req);
      if (!user) return res.status(401).json({ error: "Not logged in." });

      const updated = await pDao.addReply(
        followupId,
        user.id,
        user.name,
        user.role,
        content
      );
      if (!updated) return res.status(404).json({ error: "Followup not found." });
      res.json(updated);
    } catch (err) {
      console.error("Error adding reply:", err);
      res.status(500).send(err.message);
    }
  });

  app.delete("/api/pazza/followups/:followupId/replies/:replyId", async (req, res) => {
    try {
      const { followupId, replyId } = req.params;
      const updated = await pDao.deleteReply(followupId, replyId);
      if (!updated) return res.status(404).json({ error: "Followup not found." });
      res.json(updated);
    } catch (err) {
      console.error("Error deleting reply:", err);
      res.status(500).send(err.message);
    }
  });

  app.get("/api/pazza/:cid/folders", async (req, res) => {
    try {
      const folders = await fDao.findFoldersForCourse(req.params.cid);
      res.json(folders);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

  app.post("/api/pazza/:cid/folders", async (req, res) => {
    try {
      const { cid } = req.params;
      const { name } = req.body;
      const folder = await fDao.createFolder(cid, name);
      res.json(folder);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

  app.delete("/api/pazza/folders", async (req, res) => {
    try {
      const { folderIds } = req.body;
      const status = await fDao.deleteFolders(folderIds);
      res.json(status);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });

  app.put("/api/pazza/folders/:fid", async (req, res) => {
    try {
      const { fid } = req.params;
      const { name } = req.body;
      const status = await fDao.updateFolder(fid, name);
      res.json(status);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });
}