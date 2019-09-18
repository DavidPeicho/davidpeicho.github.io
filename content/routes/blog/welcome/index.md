```js module
  export const Metadata = {
    title: 'Welcome to this Svelte & Sapper blog!',
    date: '31 August 2019',
    readingTime: 5,
    description: 'Blog post about how I created my static Blog using Svelte & Sapper. You may learn about a new framework!'
  };
```

## Hi

I am David Peicho, Research Scientist at [Siemens Healthineers](https://www.siemens-healthineers.com),
and this is my first blog post!

I am the currently working in the Visulization Team, where I maintain our own
WebGL renderer achieving Real-Time or close to Real-Time Medical Imaging.

If you want to know more about me, what I do, and where I work, you can follow
[this link](/).

## Why this blog?

It's been a long time I wanted to create a blog to aggregate my projects, as
well as posting some experiments.

I started computer science in middle school, and since then, I spent most of
my free time working on computer graphics stuff, or games. I just said
*"most of my free time"* because school and work were making me code a lot,
but not often on graphics or game-related topics.


I am glad you are here, and this is a little sum up of what this blog is
going to be about:
* Links to my personal projects;
* Posts about computer graphics & game development;
* Actually anything related to computer science that excites me!

## A word on this website

I will use my first write up to explain a bit about what I used to create this static
blog. It's a way to start to write a concise blog posts. I was also thinking
that this could help other folks with their static websites.

I am a software engineer, but I have never been really interested about Web
development. At least, it's not the career path I wanted to follow.

Still, I like to learn new stuff, and I in general like to do things from
scratch to get a sense of what's happening. I also wanted this blog to really
match some of my needs, so here we are! I basically decided to create this
blog using [Svelte](https://svelte.dev) & [Sapper](https://sapper.svelte.dev).

I was wondering whether I should use something like
[Hugo](https://gohugo.io), [Jekyll](https://jekyllrb.com), or even [Hexo](https://hexo.io),
but none of them really satisfied me.

Don't get me wrong: these tools are **great**.

However, they don't provide the flexibility I was looking for.
My last projects (personal or for work) have been strongly connected to
WebGL and JavaScript.
I wanted to create a blog that could easily use any other resource I make,
especially for WebGL.

Here are the main points I was trying to meet while looking for a tool helping
me to build this website:

1. Writing and running samples had to be easy without extra resources.
2. Something *modular / reusable* (enough) would was highly appreciated.
3. Basically, I wanted to be able to use any tool of my JS toolchain

Again, I am not a Web developer, I don't have much knowledge outside frontend
toolchains, and raw JavaScript. I just decided to go for a Component-Based
library, because it sounded that most of them would meet my above *"requirements"*.

### Svelte & Sapper

<p class='warn'>
  Disclaimer: I didn't dive deep enough into Svelte & Sapper to really know
  the best practices.
  I also haven't used enough any frontend component library
  to be a really good judge on best practices to use them.
  This is just my attempt to create a Blog that would fit me and my projects.
</p>

I discovered Svelte while hanging around on the internet, and it looked
pretty appealing at first.

The framework is really easy to use, because you can write components almost
like you would write raw JavaScript / HTML / CSS.

I was looking for something like that, that I could learn fast and make this blog!

Svelte is basically a compiler. You write your components in a file mixing JS,
CSS, and HTML, and the compiler takes care of wrapping everything, creating
**reactive** properties, performing DOM **invalidation**, etc...

I didn't look deeply either at how fast the compiler spits the code, nor at
how fast the final component is, because once again, I am only a random guy
making a blog to post its computer graphics stuff. I am not doing anything fancy,
and I don't extra optimization for my use case (you were wondering why your smartphone battery life isn't lasting, huh?).

There was two things I needed though: making this blog **quickly**, and maintaining it
**easily**.

If you want to learn more technical stuff about it, you can reach the
[Svelte website](https://svelte.dev). You can also play with it by using their
[playground](https://svelte.dev/examples).

After having built this blog, I think I have a better overview about what things
were good with Svelte & Sapper, and what was less positive. It's also possible
that for other cases, the weakness / strength or Svelte & Sapper could be rather
different.

#### The good

* Writing components directly in JS / HTML / CSS
* Associated to the first idea, it takes really little time to do something
* Sapper comes already well-configured via a [template](https://github.com/sveltejs/sapper-template)
You can just drop your components and route handler in the `routes/` directory
* Sapper generates the static files super quickly (my guess is that they just `curl` the pages?)
* The final bundle is pretty small

#### The less good

* Not many plugins
* I am not a huge fan of the template language, compared to raw JavaScript with
other frameworks (React)
* The documentation is a WIP right now, and some things aren't complete. Though,
I found most of my answers by looking at their sources
* It can be pretty hard sometimes to forward data from a child component to
its wrapping layout
* The provided service worker tends to over-cache some files.
For instance, it tries to cache the `.DS_Store` on MacOS

## Little sum up

This article wasn't much, but I guess it was more helpful for me, to train my
writing, rather than for you to learn new stuff.

More seriously, my goal was rather to start this blog on a different note,
and to maybe give an idea to non-Web developers about what are the tools available
to simply make a blog like that. After all, there are so many frameworks in JavaScript,
someone could be lost I guess → [daysincelastjavascriptframework](https://dayssincelastjavascriptframework.com),

Even if this post wasn't really technical, I advise you to take
a look at Svelte (especially if you don't know any of the other frameworks).
As a side note, most of the code of this blog is documented
and accessible [here](https://github.com/DavidPeicho/davidpeicho.github.io).

This achieves this first article. Next articles will be more graphics centric,
or game development centric. I plan to go back to some of my personal projects
I had to put aside to write my Master's thesis, and I will publish about them
as soon as possible.

## Thanking

I would like to thanks two people, without whom this website would look like a
flat page, and no colors. Thankfully they where there to remind me how
bad I can be in design and UI/UX.

Thanks to [Jimmy Lai](https://github.com/feedthejim/), and to Lucy Wang for their
numerous advices on the frontend look on this blog.

