<script context="module">

  import { User } from '$config';

  import Icon from '@components/icon';
  import ExperienceTimeline from '@components/experience-timeline';
  import ImageHeader from '@components/image-header';
  import Meta from '@components/meta';

  import {
    SVGGithub,
    SVGGraduationCap,
    SVGLinkedin,
    SVGMapMarker,
    SVGTwitter
  } from '@utils/icons';

  /**
   * @typedef {Object} Social
   * @property {string} url - URL to the social website
   * @property {string} icon - SVG path of the icon
   */

  /**
   * Creates an array of data for social links (twitter, linkedin, etc...).
   * This will be later used to display an clickable icon to those links.
   *
   * @return {Social[]} The array containing all social links to display
   */
  function createSocialLinks() {
    if (!User.social) { return []; }
    const social = [];
    const github = User.social.github;
    const linkedin = User.social.linkedin;
    const twitter = User.social.twitter;
    if (github) {
      social.push({
        url: `https://github.com/${github}`,
        icon: SVGGithub
      });
    }
    if (twitter) {
      social.push({
        url: `https://twitter.com/${twitter}`,
        icon: SVGTwitter
      });
    }
    if (linkedin) {
      social.push({
        url: `https://www.linkedin.com/in/${linkedin}`,
        icon: SVGLinkedin
      });
    }
    return social;
  }

  export const Metadata = {
    title: `${User.name}`,
    seoDescription: `Blog of ${User.name}`,
    url: ''
  };

</script>

<script>

  /**
   * This layout is used for the About page. It uses the index markdown's
   * frontmatter to feed some extra layout.
   */

  /** PROPS */

  /**
   * A list of company making up your resume.
   *
   * @type {Company[]}
   */
  export let resume = [];

  export let teaching = [];

  /**
   * Layout used by this component. This prop is forwared by MDSvex.
   */
  export let layout;

  const socials = createSocialLinks();

</script>

<!-- Blog Meta. Really important for SEO. -->
<Meta data={Metadata} />

<!-- Blog author information: name, title, company, etc.. -->
<ImageHeader image='images/me.jpg' opacity={0.8} style={'height: 60vh;'}>
  <div class='header'>
    <h1 class='textshadow'>David Peicho</h1>
    <h2 class='textshadow'>Research Scientist</h2>
    <h3 class='softtextshadow'>@ Siemens Healthineers</h3>
    <!-- Current Location. -->
    <div class='location'>
      <Icon width=25 height=25 {...SVGMapMarker} />
      <span>{User.location}</span>
    </div>
  </div>
</ImageHeader>

<!-- Injects user markdown. -->
<div class='post-content'>
  <div class='social'>
    { #each socials as social }
      <a href={social.url} target='_blank'><Icon {...social.icon} /></a>
    { /each }
  </div>
  <slot />
</div>

<!-- Displays a list of places you have worked at. -->
{ #if resume.length > 0 }
  <div class='post-content'>
    <h2>Experience</h2>
      <ExperienceTimeline {resume} />
  </div>
{ /if }

<!-- Displays a list of teaching experience. -->
{ #if teaching.length > 0 }
  <div class='post-content'>
    <h2>Teaching</h2>
    <div style='margin: auto; text-align: center;'>
      { #each teaching as experience }
        <div style='margin-bottom: 2rem;'>
          <Icon width=25 height=25 {...SVGGraduationCap} />
          <span style='font-weight: 800;'>
            {experience.date}, {experience.school},
          </span>
          <span>{experience.title}</span><br>
          <span style='font-style: italic;'>{experience.course}</span>
        </div>
      { /each }
    </div>
  </div>
{ /if }

<style>

  .header {
    width: 75%;
    float: right;
    padding-top: 1rem;
  }

  .header h1, .header h2 {
    color: white;
    margin: 0;
    font-family: Open sans, sans-serif;
  }

  .header h2 {
    margin: 1.5rem 0 0 0;
    font-weight: 400;
  }

  .header h3 {
    color: #ef495c;
    margin: 0.25rem 0 0 0;
    font-weight: 300
  }

  .header .location {
    display: inline-flex;
    color: white;
    margin: 2rem 0 0 0;
  }

  .social {
    position: fixed;
    display: flex;
    right: 0;
    flex-direction: column;
    transform: translateX(-250%);
  }

  .social a {
    transition: color .3s ease,color .3s ease;
  }

  .social a:hover {
    color: #ef495c;
  }

  @media (max-width: 1100px) {

    .social {
      position: relative;
      width: 60%;
      margin: auto;
      margin-top: 3rem;
      flex-direction: row;
      justify-content: space-evenly;
      transform: initial;
    }

  }

</style>
