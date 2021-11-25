import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'
import { v4 as uuidv4 } from 'uuid';

import Hero from '../components/hero'
import ArticlePreview from '../components/article-preview'

import * as styles from './home.module.css'

class RootIndex extends React.Component {
  render() {
    const posts = get(this, 'props.data.allContentfulBlogPost.nodes')
    const [author] = get(this, 'props.data.allContentfulPerson.nodes')
    const optimizelyDataFile = this.props.data.optimizelyDataFile;

    console.log('RootIndex props', this.props)
    console.log('optimizelyDataFile', optimizelyDataFile)

    const onClick = () => {
      console.log("click");
      optimizelyDataFile.track('purchase')
    }

    return (
      <>
        <Hero
          image={author?.heroImage.gatsbyImageData}
          title={author?.name}
          userId={uuidv4()}
          optimizelyDataFile={optimizelyDataFile}
        />
        <div className={styles.container}>
          <button onClick={onClick} className={styles.button}>
            Create An Optimizely Event
          </button>
        </div>
        <ArticlePreview posts={posts} />
      </>
    )
  }
}

export default RootIndex

export const pageQuery = graphql`
  query HomeQuery {
    allContentfulBlogPost(sort: { fields: [publishDate], order: DESC }) {
      nodes {
        title
        slug
        publishDate(formatString: "MMMM Do, YYYY")
        tags
        heroImage {
          gatsbyImageData(
            layout: FULL_WIDTH
            placeholder: BLURRED
            width: 424
            height: 212
          )
        }
        description {
          childMarkdownRemark {
            html
          }
        }
      }
    }
    allContentfulPerson(
      filter: { contentful_id: { eq: "15jwOBqpxqSAOy2eOO4S0m" } }
    ) {
      nodes {
        name
        shortBio {
          shortBio
        }
        title
        heroImage: image {
          gatsbyImageData(
            layout: CONSTRAINED
            placeholder: BLURRED
            width: 1180
          )
        }
      }
    }
  }
`
