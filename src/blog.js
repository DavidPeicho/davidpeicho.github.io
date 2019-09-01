/**
 * @typedef {Object} Social
 * @property {string}linkedin - Your LinkedIn user id. Used mainly in `about`
 * @property {string}github - Your Github user id. Used mainly in `about`
 * @property {string}twitter - Your Twitter user id. Used mainly in `about`
 */

/**
 * Contains your personal information.
 *
 * @type {Object}
 * @property {string} name - Your name (first name followed by last name).
 * @property {string} title - Current work title, e.g: 'Software Engineer', or
 *   'Research scientist', ...
 * @property {string} email - Your email adress
 * @property {string} location - The current location you are staying at. It's
 *   preferable to write it under the form '[City], [Country]', but it's up to
 *   you
 */
export const User = {
  name: 'David Peicho',
  title: 'Research Scientist',
  email: 'david.peicho@gmail.com',
  location: 'London, UK',
  social: {
    linkedin: 'david-peicho',
    github: 'DavidPeicho',
    twitter: 'DavidPeicho',
    twitterCardType: 'summary'
  },
};

/**
 * Contains data for the entire blog.
 *
 * @property {string} name - The blog's name.
 * @property {string} description - The blog's description. This will basically
 *   be used on the main page as the metadata description. It's also used when
 *   your articles are not provided any SEO description.
 * @property {string} googleAnalytics - Your Google Analytics website ID.
 */
export const Site = {
  name: 'David Peicho',
  description: 'Blog about computer graphics, rendering, game developmnent, or just computer science!',
  keywords: 'computergraphics, rendering, 3d',
  baseURL: 'davidpeicho.github.io',
  googleAnalytics: 'UA-142103532-1'
};
