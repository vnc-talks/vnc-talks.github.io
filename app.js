const postsGrid = document.getElementById('posts-grid');
const homeView = document.getElementById('home-view');
const postView = document.getElementById('post-view');
const aboutView = document.getElementById('about-view');
const postArticle = document.getElementById('post-article');
const postDate = document.getElementById('post-date');
const postTags = document.getElementById('post-tags');
const backLink = document.getElementById('back-link');
const navLinks = document.querySelectorAll('.nav-link');

const STATE = {
  posts: [],
};

const Markdown = {
  toHtml(markdown) {
    const escapeHtml = (str) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Convert code blocks first
    let html = markdown.replace(/```([\s\S]*?)```/g, (_, code) => {
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

    // Headings
    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    // Bold / italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*)$/gm, '<ol><li>$1</li></ol>');
    // Unordered lists
    html = html.replace(/^[*-] (.*)$/gm, '<ul><li>$1</li></ul>');

    // Paragraphs
    html = html.replace(/^(?!<h\d|<blockquote|<pre|<ul|<ol|<li)(.+)$/gm, '<p>$1</p>');

    // Merge consecutive lists
    html = html.replace(/<\/ol>\s*<ol>/g, '');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    return html;
  },
};

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.text();
}

function setActiveNav(link) {
  navLinks.forEach((item) => {
    item.classList.toggle('active', item.dataset.link === link);
  });
}

function showView(view) {
  homeView.classList.toggle('hidden', view !== 'home');
  postView.classList.toggle('hidden', view !== 'post');
  aboutView.classList.toggle('hidden', view !== 'about');
  setActiveNav(view === 'about' ? 'about' : 'home');
}

function renderTags(container, tags) {
  container.innerHTML = '';
  if (!tags || !tags.length) return;
  tags.forEach((tag) => {
    const el = document.createElement('span');
    el.className = 'tag';
    el.textContent = tag;
    container.appendChild(el);
  });
}

function renderPosts(posts) {
  postsGrid.innerHTML = '';
  const template = document.getElementById('post-card-template');
  posts.forEach((post) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.post-card-date').textContent = post.date;
    clone.querySelector('.post-card-title').textContent = post.title;
    clone.querySelector('.post-card-summary').textContent = post.summary;
    renderTags(clone.querySelector('.post-card-tags'), post.tags);
    const link = clone.querySelector('.post-card-link');
    link.href = `?post=${encodeURIComponent(post.slug)}`;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      loadPost(post.slug);
    });
    postsGrid.appendChild(clone);
  });
}

async function loadPosts() {
  const manifest = await fetchJSON('posts/index.json');
  STATE.posts = manifest.posts || [];
  renderPosts(STATE.posts);
}

async function loadPost(slug) {
  const meta = STATE.posts.find((p) => p.slug === slug);
  if (!meta) {
    postArticle.innerHTML = '<p>Post not found.</p>';
    showView('post');
    history.pushState({}, '', '?post=' + encodeURIComponent(slug));
    return;
  }

  const markdown = await fetchText(`posts/${slug}.md`);
  postArticle.innerHTML = Markdown.toHtml(markdown.trim());
  postDate.textContent = meta.date;
  renderTags(postTags, meta.tags);
  showView('post');
  history.pushState({}, '', '?post=' + encodeURIComponent(slug));
}

function initNav() {
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.link;
      if (target === 'home') {
        showView('home');
        history.pushState({}, '', './');
      } else if (target === 'about') {
        showView('about');
        history.pushState({}, '', '#about');
      }
    });
  });

  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    showView('home');
    history.pushState({}, '', './');
  });
}

function hydrateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const post = params.get('post');
  const hash = window.location.hash;
  if (hash === '#about') {
    showView('about');
    return;
  }
  if (post) {
    loadPost(post);
  } else {
    showView('home');
  }
}

async function main() {
  initNav();
  await loadPosts();
  hydrateFromURL();
}

main().catch((err) => {
  console.error(err);
  postsGrid.innerHTML = `<div class="post-card">Unable to load posts: ${err.message}</div>`;
});

