const rehypeSlug = import('rehype-slug')
const rehypeAutolinkHeadings = import('rehype-autolink-headings')
const rehypeImageSize = import("rehype-image-size")

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeImageSize],
    // If you use `MDXProvider`, uncomment the following line.
    providerImportSource: "@mdx-js/react",
  },
})

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  images: {
    domains: ['v5.airtableusercontent.com']
  }
})