// server.js

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/comments/:postId', async (req, res) => {
  const postId = req.params.postId;
  const filePath = path.join(__dirname, 'comments', `${postId}.txt`);

  try {
    // Check if the file exists
    await fs.access(filePath);

    // If the file exists, read and send the comments
    const data = await fs.readFile(filePath, 'utf-8');
    const comments = data.split('\n').filter(comment => comment.trim() !== '');
    res.json({ comments });
  } catch (error) {
    // If the file doesn't exist, send an empty array
    res.json({ comments: [] });
  }
});

app.post('/comments/:postId', async (req, res) => {
  const postId = req.params.postId;
  const filePath = path.join(__dirname, 'comments', `${postId}.txt`);
  const { text, username } = req.body;

  try {
    // Check if the file exists
    await fs.access(filePath);

    // If the file exists, append the new comment
    const comment = `${username}: ${text}\n`;
    await fs.appendFile(filePath, comment);
    res.json({ success: true });
  } catch (error) {
    // If the file doesn't exist, create a new file and add the first comment
    const comment = `${username}: ${text}\n`;
    await fs.writeFile(filePath, comment);
    res.json({ success: true });
  }
});

// New endpoint to handle DELETE requests for removing comments
app.delete('/comments/:postId/:commentId', async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const filePath = path.join(__dirname, 'comments', `${postId}.txt`);

  try {
    // Read the existing comments
    const data = await fs.readFile(filePath, 'utf-8');
    const comments = data.split('\n').filter(comment => comment.trim() !== '');

    // Remove the comment with the specified commentId
    const updatedComments = comments.filter((comment, index) => index != commentId);

    // Write the updated comments back to the file
    await fs.writeFile(filePath, updatedComments.join('\n'));

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing comment:', error);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});