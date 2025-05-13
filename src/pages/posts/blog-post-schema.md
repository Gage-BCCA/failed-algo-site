---
layout: ../../layouts/PostLayout.astro
title: "Designing A Blog Post Schema Beyond Markdown"
pubDate: 2025-04-14
description: "Designing a database-friendly blog post schema that addresses the shortcomings of markdown converters."
author: "Gage Schaffer"
tags: ["javascript", "webdev", "larping"]
---
When I write blog posts, I usually want some particular section to be unique. I've toyed around with a few static site generators. One thing that I've noticed with all of them is the prevalence of markdown. It's the de facto standard in writing blog posts -- for good reason, too. It's fast. I'm writing this post in markdown right now, in fact.

# The Core Issue

Markdown is cool, and I have no qualms about it. One shortcoming, though, is what if I wanted to display a chunk of text in a special way? 

It would be really hard to do. In fact, I'm not sure it would be possible without some hacky solution. In the past, I would generate my static site and manually edit the HTML/CSS (for it only to be overwritten the next time I built my site). 

Terrible.

## Other Considerations
In addition: 
- How do you store markdown in a database cleanly? 
- Does the server process it to HTML to be rendered before shipping off the page? 
- Do we do it client side? 
- Do we store the original blog post as HTML? 

These aren't issues for purely static sites, but for anything dynamic, they present real questions that have to be addressed. 

The typical Markdown-to-HTML pipeline limits any customization on particular pieces of text. Storing raw HTML, at best, is inefficient, and at worst, is an XSS wonderland. How is styling handled? Should we just rewrite it in Rust?

In essence, I feel like there is a better way. We should be able to quickly write a document, store it nice and neatly, and make it easy to render on both clients and servers.

# The Motivation? Reinventing the Wheel
I have been working on a client project recently and one of the requirements was a simple post editor. She needed an easy, web-based way to put some words on a post. Good buttons? Green. Dangerous buttons? Red. 

And so I did. My first iteration was: 
- Title input box
- Optional subtitle input box
- Textarea

I hooked up the JavaScript to call my backend whenever the (green in color) save button was clicked. **Voila**. I went and read a blog
post from Hackernews and realized that I had no way to format text, add sections, add pictures, buttons, or anything else. I needed a way to dynamically and easily store information about the post, and allow different elements to be rendered wherever my client wanted them.

# The Solution? Overengineered, Recently Reinvented Wheel
To solve my problem, I created something kind of inspired by JSON Canvas. Instead of storing the document, why don't we just store enough information to *describe* and *recreate* the document with all the bells and whistles?

First, I defined what an individual piece of a blog looks like as an object.

```ts
// The most basic breakdown of a blog component
{
    "type": string,
    "order": int,
    "content": string,
    "style": string?
}
```

With this, I can:
- Use the `type` to see what HTML element to render
- Use `order` to insure correct... ordering.
- Actually render the words with `content`
- `style` allows for custom inline... styling

For my project, I defined a few types to begin with. They are: **bigHeader**, **smallHeader**, and **textSection**.

For an example, a `textSection` element might look like this:
```ts
{
    "type": "textSection",
    "order": 1,
    "content": "Hello, world!"
}
```

Since this is just a standard block of text, there's no styling.

## Building Out the Blog Post
The great thing about describing a document in this way is that we can just **1.) Create our objects** and then **2.) store them in a JSON array**.

```ts
[
    {
       "type": "bigHeader",
       "order": 1,
       "content": "Hello, world!",
       "style": "padding:5rem;"
    },
    {
       "type": "smallHeader",
       "order": 2,
       "content": "This is pretty nifty"
    },
    {
       "type": "textSection",
       "order": 3,
       "content": "Let's write a blog!"
       "style": "color:green;background-color:red;"
    }
]
```

## Persisting Is Easy
Another great feature is that Postgres already has a built-in JSON data type. If your flavor of SQL doesn't have this, though, we just can just store it as generic text.

Most modern programming languages have built in JSON parsers, so this makes persisting an especially easy task.

## Extendable
Since we're just describing a document, there's no tricky parsing/rendering to deal with (yet). In my misadventures, I forgot that my client also needed images. Alas:

```ts
{
    "type": "image",
    "order": 0,
    "content": "path/to/image"
}
```

There was no extra hoops to jump through to store images except that I had to update my templates to handle the new `type` I had just created out of thin air.

# Rendering
Early on, I raised a few questions about rendering that I don't have the answer to. Regardless of format, we have to serve our content to the client device in a way that browsers understand.

The advantage, though, is the flexibility and simplicity of this unnamed blog schema. We're not trying to parse out HTML from Markdown, nor are we trying to safely display HTML. We are re-constructing the document from a description, which let's us have total flexibility in _how_, _why_, and _when_ things are done.

## Server Side
In my particular case, I was using Django and rendering server side. Here's a snippet:
```html
{% for element in post.body %}
    {% if element.type == "bigHeader" %}
        <div class="post__header">
            <h1>{{ element.content }}</h1>
        </div>
    {% endif %}
    {% if element.type == "smallHeader" %}
        <div class="post__subheader">
            <h2>{{ element.content }}</h2>
        </div>
    {% endif %}
    {% if element.type == "textSection" %}
        <div class="post__text">
            <p>{{ element.content }}</p>
        </div>
    {% endif %}
    {% if element.type == "image" %}
        <div class="post__image">
            <img src="{{ element.content }}" height="200" width="200">
        </div>
    {% endif %}
{% endfor %}
```
That covers the entirety of the blog post. On either side of this snippet is boilerplate that is present on every page.

These elements didn't require any additional styling, but it would be as simple as:
```html
{% if element.style %}
    <p style="{{ element.style }}">{{ element.content }}</p>
{% endif %}
```

## Client Side via API
It would be almost as trivial to do this client side through an API call. I haven't written the code, though. I'm just guessing -- though I imagine it would be something like:

```js
let post = fetch(...).then(...).then(...)
for (element of post) {
    if (element.type == "bigHeader") {
        let elementNode = document.createElement("h1");
        elementNode.textValue = element.content;
        postContainer.appendChild(elementNode);
        // ... and so on.
    }
}
```
If that code is wrong, you'll have to forgive me -- I just literally wrote that when I realized it was kinda dickish of me to say "client side rendering is _super easy_" and then not actually trying it.

# The Downside
The hardest part that I have to address is that this format is _not_ easy to write. Markdown is so popular because it's easy to write, whereas this unnamed blog schema is actually pretty unfriendly.

## Custom Text Editor
For my situation, I wrote a simple text editor. First, I described a class for the objects:

```js
class DocumentObject {
  constructor(type, order, content) {
    this.type = type;
    this.order = order;
    this.content = content;
  }
}
```

Then, I elected to use a map so I can access each element quickly. The key is the `order` as an int.

```js
let documentObjectMap = new Map();
```

Create some event listeners for all my text editor buttons (big green "Big Header" button, "Small Header" button, etc.).

```js
addBigHeaderBtn.addEventListener("click", () => {
  addElementToDocument("H1");
});
addSmallHeaderBtn.addEventListener("click", () => {
  addElementToDocument("H2");
});
addTextSectionBtn.addEventListener("click", () => {
  addElementToDocument("P");
});
```

Define the function.
```js
function addElementToDocument(nodeType, text) {

    // Match our actual HTML node name to our schema name
    let documentElementTypeName;
    switch (nodeType) {
        case "H1":
        documentElementTypeName = "bigHeader";
        break;
        case "H2":
        documentElementTypeName = "smallHeader";
        break;
        case "P":
        documentElementTypeName = "textSection";
        break;
        case "img":
        documentElementTypeName = "img";
        break;
    }

    textSection = document.createElement(nodeType);

    // Add placeholder text if text argument was not provided (which is most of the time)
    textSection.textContent = !text ? textSectionText : text;

    // Set our order on a data attribute for easy matching 
    // between HTML node and DocumentObject instances
    textSection.setAttribute("data-order", documentElementMap.size);

    // -- snip lots of boring stuff --

    // Append to the map
    documentElementMap.set(
    documentElementMap.size,
    new DocumentObject(
      documentElementTypeName,
      documentElementMap.size,
      textSection.textContent
    )
  );
}
```

In the above code, in the snipped part, we handled actually adding the HTML to the text. It got kind of messy, and it's not super important to this blog post, so I left it out. If this code is confusing you -- I just wanted to clarify a little.

Now, we can submit the text. I wasn't using a form, so I had to play around a little bit. The "save" button, for example, sends a POST request, listens for a response, and then redirects after a success.

```js
function savePost() {
    
    // This method opens an error dialog if something is wrong
    // so we can just fail out of the save function
    if (!validatePostInputFields()) {
        return;
    }

    // Pretty descriptive name, huh?
    let documentElementList = extractListFromDocumentElementMap();
    fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(documentElementList),
    })
        .then((response) => {
        if (response.ok) {
            window.location.href = "/url";
        }
        })
        .catch((error) => {
            console.error("Error");
        });
}
```

That's the basic idea behind my custom text editor. It got a little messy dealing with images, edge cases, and re-ordering the elements, but overall, not bad.

In review:

- Create DocumentObject class that matches our unnamed blog schema
- Add buttons to instantiate DocumentObject instances
- Keep track of DocumentObject instances in some way and make the front end match our instances
- Submit a JSON array of DocumentObject objects to be stored away when saving

## Markdown to Unnamed Blog Schema Transpiler?
I, for one, believe that every layer of abstraction is an opportunity for a new programmer to shove more code into his/her software. 

All jokes aside, I have been playing around with a Markdown parser that looks for a special style block. Something like:

```
# Hello, World! 
<style
color: red;
background-color: red;
box-shadow: 1px 1px red;
/>
```
I'm not married to the syntax, but it would just be a block of valid CSS inside some kind of fenced-in, non-markdown symbols.

Then, we can parse Markdown and create our objects. Instead of converting directly to HTML, we can instead convert to Unnamed Blog Schema, or UBS. If you haven't caught on, I'm starting to enjoy the name "Unnamed Blog Schema" the more I use it.

Of course, the new pipeline from Markdown to generated HTML is now:

```
Markdown --> UBS --> HTML
```

Which seems kind of silly. But, since we rarely publish articles (in relation to rendering them), I think the flexibility and ease of storing UBS makes it worth it.

For static sites, this pipeline would simply happen all at once. For blog posts that are stored in a datastore elsewhere, it would look more like this.

```
// Publish Article
Markdown --> UBS --> datastore

// Server side rendering
Request --> Server --> Datastore --> UBS from datastore --> Render HTML --> Response

// Client side rendering
Request --> API --> UBS response (it's just fancy JSON) --> Render HTML
```

# Expanding the Idea
So far, I've focused on simple blog posts, but I think we could expand this to really allow for more. 

## Interactive Blog Post Elements
I've just learned Javascript, and I think it's time to show the world that I can program an element to change colors upon a click event.

I want to show it in a blog post, though, and my static site generator uses Markdown.
```
blog-post.md
---------------------

Here's an example of a button that changes colors. Amazing.

# Click me!
<style
    color: red;
/>
<onclick
    this.style.color = blue;
/>
```

Let's use our imaginary UBS transpiler. I'm extrapolating a bit, but please indulge me. Let's pretend that our UBS transpiler assigns each element a unique ID. Let's just take the epoch time plus the order.
```
[
    {
        "id": "1747144534"
        "type": "textSection",
        "order": 0,
        "content": "Here's an example of a button that changes colors. Amazing."
    },
    {
        "id": "1747144535"
        "type": "bigHeader",
        "order": 1,
        "content": "Click me!",
        "style": "color:red;"
        "events": {
            "click": "this.style.color = 'blue';"
        }
    }
]
```

Now, let's render the HTML:
```html
<p>Here's an example of a button that changes colors. Amazing.</p>
<h1 style="color:red;" id="1747144535">Click me!</h1>
<script>
    let header = document.getElementById("1747144535");
    header?.addEventListener("click", function() {
        this.style.color = 'blue';
    })
</script>
```

Fantastic. We now have a way to safely and easily persist an interactive element that was originally written in a Markdown blog post, which can then be easily rendered to HTML. It's also highly configurable. 

Obviously, there is some work to be done in between each of those steps -- but I think this a good way to write, store, and show interactive blog posts.

## Caching Common Elements
What if we had a common element on every page if the user is signed-in? We're just describing elements in strucuted JSON, so let's store it in local storage.

```json
[
    {
        "id": "1747144535",
        "type": "popup",
        "content": "Complete Checkout",
        "style": "position: absolute; top: 0; left: 0;
    }
]
```
Since we're no longer describing an ordered element, we can just omit the order. We describe the styling, add events, and so on.

```js
if (user.isAuthenticated) {
    if (localStorage.getItem('checkout-button')) {
        // render checkout button
    }
    else {
        // fetch checkout button from server
    }
}
```

## Plug-and-Play Component Sharing
If someone wanted to share a component for someone else to use, all you'd have to do is:
- Copy + Paste the UBS or the Markdown into your blog (depending on your workflow)
- Transpile

By design, a UBS object is totally self-contained (because we need to describe it enough for total reconstruction).

# In Conclusion
These are just ramblings so far. I need to actually sit down and do some proof-of-concept work before digging too much further into this. More to come.




