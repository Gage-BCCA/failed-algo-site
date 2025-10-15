# Changelog 

All notable changes to this project will be documented in this file.

## 10/15/2025

A big effort was made to make the site work on mobile screens:
- Made several components/sections responsive to smaller screen sizes
    - Header and Navigation bar
    - Front page hero
    - Link buttons
    - Post List
    - Portfolio sections
    - Featured Projects Sections
    -

Who should control the placement of a component? As in, if I slot in a component, should the code on how that component is overall placed (i.e, how much width should this component take up?) be located on the component or on the page? I think the page, but this is inconsistent. Formatting code has been moved from the component to the page for:
    - Link Buttons

A caveat to this is a component's own children elements. It's not very friendly to access a component's children from a parent's CSS selectors, so we do handle responsiveness on the component _sometimes_:
    - Generic Page Hero
    - Large Blog Post Card
    - Featured Project Card
    - Feature
    - Alernating List

## Release
- Released site