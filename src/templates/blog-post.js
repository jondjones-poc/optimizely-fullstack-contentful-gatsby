import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import { v4 as uuidv4 } from 'uuid';

import Seo from '../components/seo'
import Hero from '../components/hero'
import Tags from '../components/tags'
import * as styles from './blog-post.module.css'

class AuthorComponent extends React.Component {
  render() {
    const { data } = this.props
    return <div className={styles.authorComponent}>CONTENTFUL EXPERIMENT DATA = {data}</div>
  }
}
class BlogPostTemplate extends React.Component {
  state = {
    contentFulExperimentData: null,
    post: null,
    previous: null,
    next: null
  };

  /// Not best practice to wait for data file like this.  Better to get data file on start
  componentWillMount() {
    const post = get(this.props, 'data.contentfulBlogPost')
    const previous = get(this.props, 'data.previous')
    const next = get(this.props, 'data.next')
    const { optimizelyDataFile }= this.props.data;
    this.setState({post, previous, next});

    console.log('BlogPostTemplate -> componentWillMount', optimizelyDataFile);

    optimizelyDataFile?.onReady().then(() => {

      const key = post.author.experimentKey;

      // using uuidv4 for random user id.  use your own identifier here
      const variationId = optimizelyDataFile.activate(key, uuidv4()); 

      const contentFullOptimizelyMapping = JSON.parse(post.author.meta.internal.content);
      const contentFulId = contentFullOptimizelyMapping[variationId];

      console.log('Key:', key);
      console.log('VariationId:', variationId);
      console.log('ContentFullOptimizelyMapping:', contentFullOptimizelyMapping);
      console.log('Contentful Id:', contentFulId);
      console.log('Blog Post:', item);

      const item = post.author.variations.filter(item => item.contentful_id === contentFulId);
      const contentFulExperimentData = item[0]?.name;

      if (contentFulExperimentData) {
        this.setState({contentFulExperimentData});
        console.log('contentFulExperimentData:', contentFulExperimentData);
      }
    });
  }

  render() {
    const {post, next, previous, contentFulExperimentData}= this.state;
    const { optimizelyDataFile }= this.props.data;

    console.log('BlogIndex', this);

    if (!post) {
      return <></>
    }
  
    return (
      <>
        <Seo
          title={post.title}
          description={post.description.childMarkdownRemark.excerpt}
          image={`http:${post.heroImage.resize.src}`}
        />
        <Hero
          image={post.heroImage?.gatsbyImageData}
          title={post.title}
          content={post.description?.childMarkdownRemark?.excerpt}
          // Passing a ready warmed up call down
          optimizelyDataFile={optimizelyDataFile}
          userId={uuidv4()}
        />
        <div className={styles.container}>
          <span className={styles.meta}>
           <AuthorComponent data={contentFulExperimentData} />
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
      </>
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
