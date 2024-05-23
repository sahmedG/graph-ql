import { NavItem } from "./types"

/**
 *
 * @param items the items to display in the navbar, if null, the navbar will be empty
 * @returns the navbar element
 */
export default function Navbar(items?: NavItem[]): HTMLElement {
  const nav = document.createElement('nav')
  nav.classList.add('navbar')

  nav.appendChild(navTitleHelper())

  if (items) {
    nav.append(...navItemsHelper(items))
  }

  return nav
}

function navTitleHelper(): HTMLDivElement {

  const logoDiv = document.createElement('div')
  logoDiv.id = 'navbar-title';


  const logo = document.createElement('img')
  logo.src = '/static/logo-50.png'

  const title = document.createElement('h5')
  title.innerHTML = 'GraphQL <span>By Sahmed</span>'

  logoDiv.append(
    logo,
    title
  );

  return logoDiv
}

function navItemsHelper(items: NavItem[]): HTMLElement[] {
  const aTags: HTMLAnchorElement[] = []

  for (const item of items) {
    const a = document.createElement('a')
    a.classList.add('nav-item')
    a.href = item.slug
    a.innerText = item.title

    if (item.slug === window.location.pathname) {
      a.classList.add('active')
    }

    aTags.push(a)
  }

  return aTags
}
