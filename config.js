import {
  SVGBrain,
  SVGCubes,
  SVGGamepad,
  SVGVRHeadset
} from '@utils/icons';

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
 * Contains data for the entire blog. Those options are mostly for SEO.
 *
 * NOTE: It's really important that you setup the `baseURL`.
 *
 * @property {string} name - The blog's name.
 * @property {string} description - The blog's description. This will basically
 *   be used on the main page as the metadata description. It's also used when
 *   your articles are not provided any SEO description.
 * @property {string} googleAnalytics - Your Google Analytics website ID.
 */
export const Site = {

  /** Title of your blog. <meta title>. */
  name: 'David Peicho',

  /** Description of your blog. <meta description>. */
  description: 'Blog about computer graphics, rendering, game developmnent, or just computer science!',

  /** Blog keywords. <meta keywords>. */
  keywords: 'computergraphics, rendering, 3d',

  /**
   * The `baseURL` can be pretty important for SEO.
   */
  baseURL: 'davidpeicho.github.io',

  /** Your Google Analytics token. */
  googleAnalytics: 'UA-142103532-1'

};

/**
 * All tags supported by the blog.
 *
 * @type {Object.<string, Tag>}
 */
export const Tags = {
  ComputerGraphics: { text: 'Graphics', color: '#3498db', icon: SVGCubes },
  Games: { text: 'Games', color: '#9bca2f', icon: SVGGamepad },
  VR: { text: 'VR', color: '#f5b82a', icon: SVGVRHeadset },
  AI: { text: 'AI', color: '#9b59b6', icon: SVGBrain }
};

export const Colors = {
  Text: '#303030', // Gray
  Primary: '#353e44', // Dark Blue-Grayish
  Secondary: '#ef495c', // Red
  Third: '#007acc' // Light Blue
};

/**
 * @typedef {Object} Social
 * @property {string} linkedin - Your LinkedIn user id. Used mainly in `about`
 * @property {string} github - Your Github user id. Used mainly in `about`
 * @property {string} twitter - Your Twitter user id. Used mainly in `about`
 */

 /**
 * @typedef {Object} Tag
 * @property {string} color - Hexadecimal color of the tag
 * @property {{import('./src/utils/icons').IconProps}} icon - Icon of the tag.
 *   This is an object with the SVG path as well as the SVG viewbox.
 * @property {string} text - Text to display with the tag. e.g: 'games'
 */
