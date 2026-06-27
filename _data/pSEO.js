export default function() {
  const services = [
    { id: "performance-marketing", name: "Performance Marketing", short: "Performance Marketer" },
    { id: "google-ads", name: "Google Ads", short: "Google Ads Expert" },
    { id: "meta-ads", name: "Meta Ads", short: "Meta Ads Specialist" },
    { id: "lead-generation", name: "Lead Generation", short: "Lead Gen Expert" },
    { id: "seo", name: "SEO", short: "SEO Expert" },
    { id: "wordpress-website", name: "WordPress Website Development", short: "WordPress Developer" }
  ];

  const cities = [
    "Ahmedabad", "Mumbai", "Delhi", "Bangalore", "Pune", 
    "Hyderabad", "Chennai", "Kolkata", "Surat", "Jaipur", 
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane"
  ];

  const pages = [];

  for (const service of services) {
    for (const city of cities) {
      const slug = `${service.id}-expert-in-${city.toLowerCase()}`;
      pages.push({
        slug: slug,
        service: service.name,
        serviceShort: service.short,
        city: city,
        title: `Best ${service.short} in ${city} | Top ${service.name} Agency`,
        description: `Looking for the best ${service.short} in ${city}? Tirthesh Jain offers top-tier ${service.name} services to scale your business with massive ROI. Book a free consultation today.`,
        keyword: `${service.short.toLowerCase()} in ${city.toLowerCase()}`
      });
    }
  }

  return pages;
}
