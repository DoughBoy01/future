export const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'organisation';

export const uniqueSlug = (name: string) => `${slugify(name)}-${crypto.randomUUID().slice(0, 6)}`;
