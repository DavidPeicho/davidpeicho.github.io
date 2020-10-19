<h1 align="center">
  Blog
</h1>

<div align="center">
  Hugo website containing references to my projects and some articles.
</div>

<img src="./static/images/homepage.jpg" />

## Using This Blog

This blog is a modification of the [codex](https://github.com/jakewies/hugo-theme-codex) theme.

I haven't spent time to make it easy to re-use. However, if you just plan on
using it as-is, it should be really easy to modify the configuration and the content without too much hacking around.

#### Config.toml

This files contain the general information of the website, as well as the
nav bar and the ordering of its content.

#### Blog Folder

You can add / modify / remove any files from `./content/blog/`. This is
basically where you have to write your articles.

#### Projects Folder

I use the `./content/projects` to list my projects in the website. The projects
**aren't** really supposed to have a route and more details, they are simply
reference and link to GitHub for more information.


## Development

You can start the development server using:

```sh
yarn run dev
```

This will basically spawn the `hugo` process.

When working on any JavaScript files in the `src/` folder, please use the
JS development server:

```sh
yarn run dev:js
```

## Thanks

* Thanks to [jakewies](https://github.com/jakewies/hugo-theme-codex) for the awesome and minimalistic Hugo theme
* Thanks to the [hugo-book theme](https://github.com/alex-shpak/hugo-book/) for all
the free available shortcuts
* Thanks to [model-viewer](https://github.com/google/model-viewer/) for the
nice interation [prompt icon](https://github.com/DavidPeicho/davidpeicho.github.io/tree/develop/layouts/partials/interaction-prompt.html)
