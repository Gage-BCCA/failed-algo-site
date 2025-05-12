---
layout: ../../layouts/PostLayout.astro
title: "Designing a Schema for Posts"
pubDate: 2025-04-17
description: "Markdown is cool for writing posts. What about storing and rendering them?"
author: "Gage Schaffer"
tags: ["webdev"]
---
I've toyed around with a few static site generators. One thing that I've noticed with all of them is the prevalence of markdown.

Markdown is cool, though, so I have no qualms about it. It's quick and easy to format text. One shortcoming, though, is what if I wanted
to display a chunk of text in a special way? It would be really hard to do. In fact, I'm not sure it would be possible without some hacky
solution.

# The Motivation? Reinventing the Wheel
I have been working on a client project recently, and one of the requirements was a simple post editor. She needed an easy, web-based way to put some words on a post. Good buttons? Green. Dangerous buttons? Red. 

And so I did. My first iteration was: 
- Title input box
- Optional subtitle input box
- Textarea

I hooked up the javascript to call my backend whenever the (green in color) save button was clicked. Voila. Then I went and read a Hackernews blog
post and realized that I had no way to format text, add sections, add pictures, buttons, or anything else. I needed a way to dynamically and easily store information about the post, and allow different elements to be rendered wherever my client wanted them.

# The Solution? Overengineered, Recently Reinvented Wheel
To solve my problem, I created something kind of inspired by JSON Canvas. First, I defined what an individual piece of a blog looks like as an object.

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
- Have custom styling with the optional `style` string

For my project, I defined a few types to begin with. They are: **bigHeader**, **smallHeader**, and **textSection**.
