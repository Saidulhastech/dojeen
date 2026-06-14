import type { Author } from '../types';

export const authors: Author[] = [
  {
    slug: 'sophia-lane',
    name: 'Sophia Lane',
    role: 'Style Editor',
    bio: 'Sophia is a style editor with over a decade of experience in fashion journalism. She specializes in sustainable fashion and capsule wardrobes, helping readers build mindful, versatile wardrobes that stand the test of time.',
    avatar: 'testimonial-image-1.webp',
  },
  {
    slug: 'marcus-reid',
    name: 'Marcus Reid',
    role: 'Fashion Writer',
    bio: 'Marcus covers the intersection of fashion, culture, and everyday life. His writing focuses on practical style advice for the modern person, blending editorial insights with real-world wearability.',
    avatar: 'testimonial-image-2.webp',
  },
  {
    slug: 'amara-wells',
    name: 'Amara Wells',
    role: 'Contributing Editor',
    bio: 'Amara is a contributing editor whose work spans fashion, beauty, and lifestyle. She believes that great style is accessible to everyone and advocates for building a wardrobe that tells your story.',
    avatar: 'testimonial-image-3.webp',
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}
