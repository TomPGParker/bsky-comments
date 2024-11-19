# Bluesky Embedded Threads/Comments
*For Blog Comments or whatever you want, really*

I saw this done a few places and tried to do it myself, but most of the solutions were too complicated. Not in terms of code, but just... dependencies, and build systems, and whatever. I wanted something dirt simple that someone could embed on a neocities page if they wanted, and modify without the need of setting anything complicated up.

So this is a simple script where you pass in a thread as an `at://` protocol link, and it gives you back the entire thread (except for the initial message) as a html thread, with little cute social media metrics. *Great!*

## How to Use it

The thread embedder is simple but not without its caveats. First, you need the bluesky thread BEFORE you add comments, meaning you need to post your article, post on bluesky, then go back to add the comments now that you have a link. As such, this isn't a perfectly automatic method that you can simply set and forget.

A minimal version of the comment embed is included.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Comments</title>
        <link rel="stylesheet" href="comments.css">
        <script src="comments.js"></script>
    </head>
    <body>
        <div id="comments-container"></div>
        <script>
            loadComments("at://did:plc:scmcyemdposb4vuidhztn2ui/app.bsky.feed.post/3lbb32nb4322g")
        </script>
    </body>
</html>
```

The key point is that you call loadComments with an appropriate info. the `did:plc` bit is your actual user code, which [you could get here](https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=kayin.moe)*(using my handle as an example).*, and the last bit `3lbb32nb4322g` can be replaced by whatever is at the end of the post you want to use. The example thread is filled with different types of embedded content, some of which is or isn't supported.

Depending on your setup, sometimes you need to delay calling loadComments. On my blog I use...

```html
  <script>
    window.addEventListener('load', (event) => {
      console.log('The page has fully loaded');
      const comments = "{{ page.header.comments|e('js') }}"; // Escape the value for JS safety
      loadComments("at://did:plc:" + did + "/app.bsky.feed.post/" + comments);
    });
  </script>
```

The only other important thing is having a div with the id `comments-container`, which will get filled up once everything is pulled down and processed.

### What works

- The basic stuff works!
- Embedded images work!
- Posts hidden on a thread will be hidden here!
- Highlights and prioritizes the comments made by the original poster

### What doesn't work
- Embedded links and youtube videos
- Hiding people who don't want to be seen by offline people

### What needs to be done
- Clean up the bad LLM code that I used to get started
- Make it so someone can just provide a post URL and have the script figure out the details.
- Maybe more example implementations? 
