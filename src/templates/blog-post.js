import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import { v4 as uuidv4 } from 'uuid';

import Seo from '../components/seo'
import Layout from '../components/layout'
import Hero from '../components/hero'
import Tags from '../components/tags'
import * as styles from './blog-post.module.css'

import {
  createInstance
} from '@optimizely/react-sdk'

if (!process.env.GATSBY_SDK_KEY) {
  throw new Error(
    "SDK Null!"
  );
}

const optimizely = createInstance({
  sdkKey: process.env.GATSBY_SDK_KEY,
})

class AuthorComponent extends React.Component {
  render() {
    const { data } = this.props
    return <div className={styles.authorComponent}>{data}</div>
  }
}
class BlogPostTemplate extends React.Component {
  state = {
    externalData: null,
    post: null,
    previous: null,
    next: null
  };

  /// Not best practice to wait for data file like this.  Better to get dat file on start
  componentWillMount() {
    const post = get(this.props, 'data.contentfulBlogPost')
    const previous = get(this.props, 'data.previous')
    const next = get(this.props, 'data.next')

    this.setState({post, previous, next});

    optimizely.onReady().then(() => {

      const key = post.author.experimentKey;
      const variationId = optimizely.activate(key, uuidv4()); // using uuidv4 for random user id.  use your own identifier here
      const contentFullOptimizelyMapping = JSON.parse(post.author.meta.internal.content);
      const contentFulId = contentFullOptimizelyMapping[variationId];

      console.log('Key:', key);
      console.log('VariationId:', variationId);
      console.log('ContentFullOptimizelyMapping:', contentFullOptimizelyMapping);
      console.log('Contentful Id:', contentFulId);

      const item = post.author.variations.filter(item => item.contentful_id === contentFulId);

      console.log('Item:', item);

      const externalData = item[0]?.name;

      if (externalData) {
        this.setState({externalData});
      }

      console.log('externalData:', externalData);
    });
  }

  render() {
    const {post, next, previous, externalData}= this.state;

    console.log('ContentFul Data', post)

    if (!post) {
      return <></>
    }
  
    return (
      <Layout location={this.props.location}>
        <Seo
          title={post.title}
          description={post.description.childMarkdownRemark.excerpt}
          image={`http:${post.heroImage.resize.src}`}
        />
        <Hero
          image={post.heroImage?.gatsbyImageData}
          title={post.title}
          content={post.description?.childMarkdownRemark?.excerpt}
        />
        <div className={styles.container}>
          <span className={styles.meta}>
           <AuthorComponent data={externalData} />
            <time dateTime={post.rawDate}>{post.publishDate}</time> –{' '}
            {post.body?.childMarkdownRemark?.timeToRead} minute read
          </span>
          <div className={styles.article}>
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{
                __html: post.body?.childMarkdownRemark?.html,
              }}
            />
            <Tags tags={post.tags} />
            {(previous || next) && (
              <nav>
                <ul className={styles.articleNavigation}>
                  {previous && (
                    <li>
                      <Link to={`/blog/${previous.slug}`} rel="prev">
                        ← {previous.title}
                      </Link>
                    </li>
                  )}
                  {next && (
                    <li>
                      <Link to={`/blog/${next.slug}`} rel="next">
                        {next.title} →
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </Layout>
    )
  }
}


export default BlogPostTemplate

export const pageQuery = graphql`
query BlogPostBySlug(
  $slug: String!
  $previousPostSlug: String
  $nextPostSlug: String
  $authorId: String
) {
  contentfulBlogPost(slug: { eq: $slug }) {
    slug
    title
    author {
      ... on ContentfulVariationContainer {
          experimentId
          experimentKey
          variations {
            name
            contentful_id
            variation_container {
              id
            }
          }
          experimentTitle
          meta {
            internal {
              content
              description
              ignoreType
              mediaType
            }
          }
      }
    }
    publishDate(formatString: "MMMM Do, YYYY")
    rawDate: publishDate
    heroImage {
      gatsbyImageData(layout: FULL_WIDTH, placeholder: BLURRED, width: 1280)
      resize(height: 630, width: 1200) {
        src
      }
    }
    body {
      childMarkdownRemark {
        html
        timeToRead
      }
    }
    tags
    description {
      childMarkdownRemark {
        excerpt
      }
    }
  },
  authorDetails: contentfulPerson(id: { eq: $authorId}) {
    name
  },
  previous: contentfulBlogPost(slug: { eq: $previousPostSlug }) {
    slug
    title
  }
  next: contentfulBlogPost(slug: { eq: $nextPostSlug }) {
    slug
    title
  }
}
`
