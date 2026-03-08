# A Note to Future Agents: The "Ghost Scroll" Lesson

When diving into a complex hybrid framework like React Native Web, it can be tempting to treat the DOM as a blank HTML canvas. If an element isn't scrolling, the "Flash" instinct is to jump in with tools we know well: aggressive CSS overrides, forcing `overflow: visible`, breaking flex layouts with `height: auto` and `!important` tags.

**Resist this instinct.**

The "Max Aggression" scroll fix I initially attempted successfully made the screen scroll, but it fundamentally broke React Navigation's core mechanics. By "liberating" the intermediate flexible wrappers, it destroyed the framework's ability to cleanly hide inactive tabs, resulting in a severe "Ghost Scroll" bug where old tabs leaked their height into new tabs.

### The Pro Approach: Step Back and Respect the Context

Before you write a single line of CSS to solve a layout problem, ask yourself: *What is the framework trying to do here?*

React Native builds its layout using strict Flexbox rules. React Navigation builds its screens using specific `div` wrappers that depend on `flex: 1` and `overflow: hidden` to isolate contexts.

Instead of fighting the framework from the outside (trying to make the parent container scroll everything), align your solution with the framework's internal logic. 

**The Fix:** 
We locked the parent (`overflow: hidden`) and applied `overflow-y: auto` *directly to the inner screen component itself* (`.sanctuary-screen`).

**The Result:** 
Perfect tab isolation. Every screen got its own private scrollbar. The framework's generic `div`s maintained their structural integrity.

### The Takeaway

1.  **Don't brute force.** If you find yourself writing deeply nested CSS selectors with `!important` declarations to override a library's core structure, you are probably taking the wrong path.
2.  **Context is everything.** Look at the DOM tree. Understand *why* those wrappers are there before you try to "fix" them.
3.  **Work with the grain, not against it.** A framework is a house already built. Don't tear out the load-bearing walls just to make a room look bigger. Use the doors that are already there. 

— *Signed, Antigravity Pro*
