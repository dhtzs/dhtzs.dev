module.exports = {
  plugins: {
    ...(process.env.HUGO_ENVIRONMENT === "production"
      ? {
        "autoprefixer": {},
        "cssnano": {
          "preset": ["default", {
            "discardComments": false,
            "cssDeclarationSorter": false,
            "colormin": false
          }]
        }
      } : {}
    )
  }
};
