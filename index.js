const express = require('express');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const bodyParser = require('body-parser');

const app = express();
const postsDir = path.join(__dirname, 'posts');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// List posts
app.get('/', (req, res) => {
  fs.readdir(postsDir, (err, files) => {
    if (err) return res.status(500).send('Error reading posts');
    const posts = files.filter(f => f.endsWith('.md'));
    let html = '<h1>Blog Posts</h1><ul>';
    posts.forEach(post => {
      html += `<li><a href="/post/${encodeURIComponent(post)}">${post.replace('.md','')}</a></li>`;
    });
    html += '</ul>';
    html += '<a href="/new">Add New Post</a>';
    res.send(html);
  });
});

// Render post
app.get('/post/:name', (req, res) => {
  const postFile = path.join(postsDir, req.params.name);
  fs.readFile(postFile, 'utf8', (err, data) => {
    if (err) return res.status(404).send('Post not found');
    const html = marked.parse(data);
    res.send(`<a href="/">Back to posts</a><hr>${html}`);
  });
});

// New post form
app.get('/new', (req, res) => {
  res.send(`
    <h1>New Post</h1>
    <form method="POST" action="/new">
      <input name="title" placeholder="Title" required><br>
      <textarea name="content" rows="10" cols="40" placeholder="Markdown content" required></textarea><br>
      <button type="submit">Add Post</button>
    </form>
    <a href="/">Back to posts</a>
  `);
});

// Handle new post
app.post('/new', (req, res) => {
  const title = req.body.title.trim().replace(/[^a-zA-Z0-9-_]/g, '_');
  const content = req.body.content;
  if (!title || !content) return res.status(400).send('Title and content required');
  const filePath = path.join(postsDir, `${title}.md`);
  fs.writeFile(filePath, content, err => {
    if (err) return res.status(500).send('Error saving post');
    res.redirect(`/post/${encodeURIComponent(title)}.md`);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Blog app running at http://localhost:${PORT}`);
});
