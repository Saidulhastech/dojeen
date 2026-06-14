const imageModules = import.meta.glob('../assets/images/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const videoModules = import.meta.glob('../assets/videos/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function getImageUrl(filename: string): string {
  return (imageModules[`../assets/images/${filename}`] as string) ?? '';
}

export function getVideoUrl(filename: string): string {
  return (videoModules[`../assets/videos/${filename}`] as string) ?? '';
}
