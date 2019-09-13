<h1 style="text-align: center;">David Peicho Blog</h1>

This is my personal blog. I am using it to post links to my projects, as well as writing some blog posts.

This blog is based upon [Svelte](https://svelte.dev) for the frontend component library, and [Sapper](https://sapper.svelte.dev) to build the entire app (routing, exporting, etc...).

<h2 style="text-align: center;">Development</h2>

First, you need to install the required dependencies using

```sh
npm install # For NPM users
yarn        # For Yarn users
```

You can start the development server using

```sh
npm run dev  # For NPM users
yarn run dev # For Yarn users
```

The development server should be listening and running at [localhost:3000](localhost:3000).

When the development server is running, you can write your
blog posts and projects file.

<h2 style="text-align: center;">Using as a Template</h2>

You would like to use this blog as a Svelte / Sapper starter?

I haven't created any starter kit, but this entire repository can be used as if it was one. You will just need to edit few files in order to make this blog yours.

### Configuration

At the root of the repository, you will find a file named [config.js](https://github.com/DavidPeicho/davidpeicho.github.io/blob/master/config.js).

This config file looks like that:

```javascript
...
export const User = {
  name: ...,
  title: ...,
  email: ...,
  location: ...
};

export const Site = {
  name: ...,
  description: ...,
  keywords: ...,
  baseURL: ...,
  googleAnalytics: ...
};
...
```

This configuration is used accross the entire blog, to reference the author, add SEO metadata, etc...

### Writing a post

A post is folder in `content/blog`, containing either a
`.md` (MDSvex), `.svelte`, or a `.HTML`.

A basic post should look like that:

```javascript
export const Metadata = {
  image: 'images/path/to/my/image',
  title: 'My Post Title',
  date: '1 of January, 1970',
  seoDescription: 'Description to help your post to be discovered by search engines'
};

## First Title

...

## Second Title

...

```

#### Adding Tags

You can add any tag you want, by following the current pattern.

You first need to edit the [icons.js files](https://github.com/DavidPeicho/davidpeicho.github.io/blob/develop/src/utils/icons.js).

Then, you can create a new tag in the config file, following the previous pattern:

```javascript
import { MyIcon } from '@utils/icons';
...
export const Tags = {
  ...
  MyTag: { text: 'MyText', color: '#ff0000', icon: MyIcon }
  ...
};
...
```

#### Structure modification

In the file `webpack/config.js`, you will find Webpack aliases used to find your blog and your list of projects.

```javascript
// `webpack/config.js` file
module.exports.UserAliases = {
  // Change this path to the content folder you have.
  '@content': path.resolve('content'),

  // Change this path to the routes folder hosting the blog.
  // This folder should be inside the `content` folder.
  '@blog': path.resolve('content', 'routes', 'blog'),

  // Change this path to the projects folder hosting the blog.
  // This folder should be inside the `content` folder.
  '@projects': path.resolve('content', 'projects'),
};
```

<h2 style="text-align: center;">How it works</h2>

### In-Depth structure

The repository is organized as follow:

```sh
$ ls -l

config.js
content
src
static
webpack
webpack.config.js
```

#### config.js

This file use is described [above](#Configuration).

### content

By default, the content of your blog is out of the `src` folder on purpose. The goal is to separate content from the components and the app in general.

* **content/routes** contains all your routes. This is
where you will create new routes as MDSvex components, such
as blog post (in **content/routes/blog**).
* **content/projects** contains all your projects metadata. Projects don't create a route as they tend to be hosted on another website (Github, etc...).

### src

Contains all the sources, Svelte components, as well as server routes (used when generating the website).

### static

Classic static folder. Should contains your assets.

### webpack

Webpack configuration for the client, and the server.
Most of the time you will only change the
`webpack/config.js` file.

### webpack.config.js

This file will less likely be changed. It exposed 3 entries,
obtained from the `webpack/` folder.

If you need an advanced Webpack configuration, you should
simply change the Webpack configuration files in `webpack.`.
