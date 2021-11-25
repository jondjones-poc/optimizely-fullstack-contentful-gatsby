import React from 'react'

import './variables.css'
import './global.css'
import Seo from './seo'
import Navigation from './navigation'
import Footer from './footer'
class Template extends React.Component {
  render() {
    const { children, optimizelyDataFile } = this.props

    console.log('Template/Layout', this.props);

    if (children.constructor !== Array) {
      children.props.data.optimizelyDataFile = optimizelyDataFile;
    }

    return (
      <>
        <Seo />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </>
    )
  }
}

export default Template
