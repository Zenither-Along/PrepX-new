import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/path/',
          '/explore/',
          '/classrooms/',
          '/major/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://prepx.com/sitemap.xml', // Update with your actual domain
  }
}
