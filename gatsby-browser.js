const React = require("react")
const Layout = require("./src/components/layout").default;

const reactOptimizelySDK = require('@optimizely/react-sdk');
const optimizelyDataFileReact = reactOptimizelySDK.createInstance({
  sdkKey: process.env.GATSBY_SDK_KEY
})

exports.wrapPageElement = ({ element, props }) => {

    // Add create instance to request
    props.optimizelyDataFile = optimizelyDataFileReact;
    console.log('gatsby-browser.js', props);

    return <Layout {...props} >{element}</Layout>
}
