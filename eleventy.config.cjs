module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("robots.txt");
  
  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};
