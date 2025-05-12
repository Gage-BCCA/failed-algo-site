---
layout: ../../layouts/PostLayout.astro
title: "The Great Migration to Astro"
pubDate: 2025-04-16
description: "I've finally bitten the bullet and migrated my site to Astro."
author: "Gage Schaffer"
tags: ["webdev", "javascript"]
---

# Welcome to the new site! 
This was a ton of fun to build. I originally built my site with 11ty, and while it was cool, I wanted to give
Astro a whirl.

I've really made an effort to make my components as generic as possible this time. All the data for my
portfolio, tools, and interesting stuff are simply stored in JSON files that generic components consume 
during building. 

## Built For The Long Haul
This makes it super easy. On the old site, here's the highlighted skills section:
```html
<div>    
  <h1># Skills</h1>
  <p>These are a few of the things that I think I'm good at.</p>
  <div class="flex-container">
    <div class="skill-card">
      <h2>Python</h2>
      <p>
        Python is one of my favorite languages. It's the one I started with,
        too!
      </p>
    </div>
    <div class="skill-card">
      <h2>Automation</h2>
      <p>
        I have been scripting and automating for most of my career, and I absolutely love 
        making the computer do my bidding.
      </p>
    </div>

    -- snip a bunch of boring html-- 

    <div class="skill-card">
      <h2>System Administration</h2>
      <p>
        I spent the first 5 years of my career managing all sorts of systems in
        all kinds of environments.
      </p>
    </div>
</div>
```

Terrible. Here's a similar section on the new site:

```javascript

import interests from "../data/interests.json";

// snip

<section class="interests">
    <BigHeader text="My Interests" />
    <AlternatingList items={interests} />
</section>

```

Much, much better. 

Obviously, I've hidden some code to exaggerate my point -- but I don't have to think about any
of it and I've kind of hidden it from myself. If I want to add a skill, I add it to the JSON file and
**boom**, skill displayed.


