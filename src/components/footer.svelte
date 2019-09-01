<script context='module'>

  /**
   * @typedef {Object} SocialLink
   * @property {string} id - The type of link. Should be either `email`,
   *   `linkedin`, `twitter`, or `github`
   * @property {IconProps} icon - An icon associated to the link
   * @property {string} url - Url the link redirects to
   * @property {string} text - Text associated to the link. Could be empty,
   *   depending where the link is used.
   * @property {string} target - If specified, the target is used on the <a>
   *   HTML tag
   */

  import { User } from '$blog';

  import Icon from '@components/icon';

  import { SVGEmail, SVGGithub, SVGLinkedin, SVGTwitter } from '@utils/icons';

  const SocialToData = {
    github: { baseURL: 'https://github.com', icon: SVGGithub },
    twitter: { baseURL: 'https://twitter.com', icon: SVGTwitter },
    linkedin: { baseURL: 'https://www.linkedin.com/in', icon: SVGLinkedin }
  };

  /**
   * Creates a list of social links from the blog configuration.
   *
   * @return {SocialLink[]} An array of social links. This is used to easily
   *   display the links by using a Svelte loop
   */
  export function createSocialLinks() {
    const list = [];
    const social = User.social || {};

    if (User.email) {
      const url = ('mailto:' + User.email);
      list.push({ id: 'email', icon: SVGEmail, url, text: User.email, target: '' });
    }

    // Pushes all social contact links.
    for (const name in social) {
      const id = name.toLowerCase();
      const data = SocialToData[id];
      if (data) {
        const url = `${data.baseURL}/${social[id]}`;
        list.push({ id, icon: data.icon, url, text: social[id] });
      }
    }

    return list;
  }

</script>

<script>

  /**
   * This component is the footer of the blog.
   *
   * It's suppose to be used as a Singleton.
   */

  /**
   * List of social link to display.
   * Change the file pointed by `$blog` to add your own links.
   *
   * The Github logo is removed by default, as it shouldn't be displayed in the
   * 'Contact' section (at least it doesn't make sense for me).
   *
   * @type {SocialLink[]}
   */
  let contactList = createSocialLinks().filter((s) => s.id !== 'github');

</script>

<div class='footer'>
  <div class='contact'>
    <h1>Contact</h1>
    <div>
      { #each contactList as contact, i }
        <div class='contact-entry' style={i === 0 ? 'margin: 0 0 0 0;' : ''}>
          <Icon
            width={25} height={25}
            {...contact.icon}
          />
          <a
            href={contact.url}
            target={contact.target !== undefined ? contact.target : '_blank'}>
              {contact.text}
          </a>
        </div>
      { /each }
    </div>
  </div>
</div>

<style>

  .footer {
    width: 100%;
    background-color: #f1f0f0;
  }

  .footer .contact {
    max-width: 600px;
    padding: 1.5rem 0 1.5rem 0;
    margin: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
  }

  .contact h1 { margin: 0; }

  .contact .contact-entry {
    margin: 0.75rem 0 0 0;
    transition: color .3s ease,color .3s ease;
  }

  .contact-entry:hover {
    cursor: pointer;
    color: #ef495c;
  }

  .contact-entry a {
    text-decoration: none;
    margin-left: 0.5rem;
  }

  .contact-entry a:hover {
    color: initial;
  }

  @media (max-width: 600px) {

    .footer .contact { flex-direction: column; }

    .contact h1 { margin-bottom: 1.5rem; }

  }

</style>
