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


### Adding

<h2 style="text-align: center;">How it works</h2>

### Structure


