// SVGs
const heart  = '<svg xmlns="http://www.w3.org/2000/svg" fill="#71153b" viewBox="0 0 24 24" stroke-width="1.5" stroke="#71153b class="size-5" color="pink"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"></path></svg>'
const repost = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"></path></svg>`
const reply  = `<svg xmlns="http://www.w3.org/2000/svg" fill="#7FBADC" viewBox="0 0 24 24" stroke-width="1.5" stroke="#7FBADC" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"></path></svg>`

async function loadComments(rootPostId) {
  const API_URL = "https://api.bsky.app/xrpc/app.bsky.feed.getPostThread";
  let hostAuthor = ""

  async function fetchComments(postId) {
    const url = `${API_URL}?uri=${encodeURIComponent(postId)}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      console.log("Fetched comment data:", data); // Debugging
      return data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return null;
    }
  }

  function convertURI(uri) {
    const url = uri.replace("at://", "https://bsky.app/profile/").replace("/app.bsky.feed.post/", "/post/");
    return(url);
  }

  function sortCommentsByTime(comments) {
    return comments.sort((a, b) => {
      const timeA = new Date(a.post.record?.createdAt).getTime();
      const timeB = new Date(b.post.record?.createdAt).getTime();
      return timeA - timeB; // Ascending order
    });
  }

  function renderComments(comments, container, hiddenReplies) { 
    // I'm the most Important
    const prioritizedReplies = comments.filter(
      comment => comment.post?.author?.displayName === hostAuthor
    );
    const otherReplies = comments.filter(
      comment => comment.post?.author?.displayName !== hostAuthor
    );


    // Merging
    const orderedComments = [...prioritizedReplies, ...sortCommentsByTime(otherReplies)];
    
    orderedComments.forEach(comment => {
      if (!comment.post) {
        console.warn("Skipping comment without post:", comment);
        return;
      }

      // Removing posts that have been hidden from the thread.
      if (hiddenReplies.includes(comment.post.uri)) {
        console.warn("Skipping hidden post");
        return;
      }

      const commentDiv = document.createElement("div");
      commentDiv.classList.add("comment-box");
      if (comment.post.author.displayName == hostAuthor) {
        commentDiv.classList.add("comment-host");        
      }
      

      // Comment metadata (author and timestamp)
      const post = document.createElement("div");
      post.classList.add("comment-innerbox");
      const url = convertURI(comment.post.uri);

      // Create the HTML string with an anchor link and timestamp
      post.innerHTML = `
              <img class="comment-avatar" src="${comment.post.author.avatar}"><div>
              <span class="comment-meta">By <a href="https://bsky.app/profile/${comment.post.author?.handle}">
                  ${comment.post.author?.displayName || comment.post.author?.handle || "Unknown"}
              </a> on <a href="${url}">${new Date(comment.post.record?.createdAt || Date.now()).toLocaleString()}</a></span>
              <p class="comment-text">${comment.post.record?.text}<p></div>
              `;

      commentDiv.appendChild(post);
      container.appendChild(commentDiv);

      if (comment.post.embed && comment.post.embed.$type === "app.bsky.embed.images#view") {
        const images = comment.post.embed.images;
        if (images && images.length > 0) {
          const imageBox = document.createElement("div");
          imageBox.classList.add("comment-imagebox")
          images.forEach(image => {
            const img = document.createElement("img");
            const link = document.createElement("a");
            link.href = image.fullsize;
            img.src = image.thumb;
            img.alt = image.alt || "Image attachment";
            img.classList.add("comment-image");
            link.appendChild(img);
            imageBox.appendChild(link);
          });
          commentDiv.appendChild(imageBox);
        }
      }

      if (comment.post.embed && comment.post.embed.$type === "app.bsky.embed.record#view") {
          const embedded = convertURI(comment.post.embed.record.uri);
          const embedBox = document.createElement("div")
          embedBox.innerHTML = `<a href="${embedded}"><div class="comment-embedbox">[Link to Quoted Post]</div></a>`;
          commentDiv.appendChild(embedBox);
      }

      if (comment.post.embed && comment.post.embed.$type === "app.bsky.embed.external#view") {
        const embedded = comment.post.embed.external.uri;
        const embeddedTitle = comment.post.embed.external.title;
        const embedBox = document.createElement("div")
        embedBox.innerHTML = `<a href="${embedded}"><div class="comment-embedbox">[Link to <em>${embeddedTitle}<em>]</div></a>`;
        commentDiv.appendChild(embedBox);
      }

      // Recursively pull out replies to rplies
      if (comment.replies && comment.replies.length > 0) {
        const repliesContainer = document.createElement("div");
        repliesContainer.classList.add("comment-replies");
        renderComments(sortCommentsByTime(comment.replies), repliesContainer, hiddenReplies);
        container.appendChild(repliesContainer);
      }
    });
  }

  const commentData = await fetchComments(rootPostId);

  if (commentData && commentData.thread) {
    const postURL = convertURI(rootPostId);
    const commentHidden = [];
    if (commentData.threadgate?.record?.hiddenReplies) {
      commentHidden.push(...commentData.threadgate.record.hiddenReplies);
    }
    const container = document.getElementById("comments-container");
    container.innerHTML = `<p class="comment-metricsbox"><a class="comment-metricslink" href="${postURL}">
    <span class="comment-metrics">${heart } ${commentData.thread.post.likeCount} Likes</span> 
    <span class="comment-metrics">${repost} ${commentData.thread.post.repostCount + commentData.thread.post.quoteCount} Reposts</span>
    <span class="comment-metrics">${reply } ${commentData.thread.post.replyCount} Replies</span></a>
    <h3>Comments</h3>
    Reply on Bluesky <a href="${postURL}">to this post</a> to add a Comment   
    </p>`;

    // Render only replies, omitting the root post
    if (commentData.thread.replies && commentData.thread.replies.length > 0) {
      hostAuthor = commentData.thread.post.author.displayName
      renderComments(sortCommentsByTime(commentData.thread.replies), container, commentHidden);
    }
  }
}