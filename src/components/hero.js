import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'

import * as styles from './hero.module.css'

import {
  createInstance,
  OptimizelyProvider,
  OptimizelyExperiment,
  OptimizelyVariation,
  OptimizelyFeature,
} from '@optimizely/react-sdk'

const optimizely = createInstance({
  sdkKey: process.env.GATSBY_SDK_KEY,
})

const Hero = ({ image, title, userId }) => (
  <div className={styles.hero}>
    {image && (
      <GatsbyImage className={styles.image} alt={title} image={image} />
    )}
    <div className={styles.details}>

    {/* using uuidv4 for random user id.  use your own identifier here */}
    <OptimizelyProvider
        optimizely={optimizely}
        timeout={500}
        user={{id: userId}}
      > 
        <OptimizelyExperiment experiment="a_b">
          <OptimizelyVariation variation="variation_1">
            <h1>Variation One Code</h1>
          </OptimizelyVariation>
 
          <OptimizelyVariation variation="variation_2">
            <h1>Variation Two Code</h1>
          </OptimizelyVariation>

        </OptimizelyExperiment>
 
        <OptimizelyFeature feature="feature">
          {(isEnabled, variables) => (
            isEnabled 
              ? <h3>Feature Flag Enabled</h3>
              :
              <h3>Feature Flag Disabled</h3>
          )}
        </OptimizelyFeature>
      </OptimizelyProvider>
    </div>
  </div>
)

export default Hero
