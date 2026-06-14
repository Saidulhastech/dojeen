export const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    href: '#',
    children: [
      { label: 'Shop with Sidebar', href: '/shop' },
      { label: 'Shop without Sidebar', href: '/shop/no-sidebar' },
    ],
  },
  {
    label: 'Pages',
    href: '#',
    isMegaMenu: true,
    columns: [
      {
        title: 'Pages',
        links: [
          { label: 'About Us', href: '/about' },
          { label: 'Blog', href: '/blog' },
          { label: 'Login & Register', href: '/auth/login' },
          { label: 'Forgot Password', href: '/auth/forgot-password' },
        ],
      },
      {
        title: 'CMS Pages',
        links: [
          { label: 'Product Details', href: '/products/fitted-classic-blue-denim-jacket' },
          { label: 'Blog Details', href: '/blog/easy-outfit-formulas-that-simplify-daily-dressing' },
        ],
      },
      {
        title: 'Template Info',
        links: [
          { label: 'Style Guide', href: '/template-info/style-guide' },
          { label: 'Licenses', href: '/template-info/licenses' },
          { label: 'Changelog', href: '/template-info/changelog' },
          { label: 'Instruction', href: '/template-info/instruction' },
        ],
      },
      {
        title: 'Utility Pages',
        links: [
          { label: '404 Page', href: '/404' },
        ],
      },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export const footerQuickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const footerUtilityLinks = [
  { label: '404 Not Found', href: '/404' },
  { label: 'Style Guide', href: '/template-info/style-guide' },
  { label: 'Licenses', href: '/template-info/licenses' },
  { label: 'Changelog', href: '/template-info/changelog' },
];
