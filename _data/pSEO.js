export default function() {
  const services = [
    { id: "performance-marketing", name: "Performance Marketing", short: "Performance Marketer" },
    { id: "google-ads", name: "Google Ads", short: "Google Ads Expert" },
    { id: "meta-ads", name: "Meta Ads", short: "Meta Ads Specialist" },
    { id: "lead-generation", name: "Lead Generation", short: "Lead Gen Expert" },
    { id: "seo", name: "SEO", short: "SEO Expert" },
    { id: "wordpress-website", name: "WordPress Website Development", short: "WordPress Developer" },
    { id: "graphic-design", name: "Graphic Design", short: "Graphic Designer" },
    { id: "video-editing", name: "Video Editing", short: "Video Editor" },
    { id: "social-media-management", name: "Social Media Management", short: "Social Media Manager" }
  ];

  const cities = [
    // Original 15
    "Ahmedabad", "Mumbai", "Delhi", "Bangalore", "Pune", 
    "Hyderabad", "Chennai", "Kolkata", "Surat", "Jaipur", 
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    // 10 Global Top Tier
    "New-York", "London", "Dubai", "Sydney", "Toronto", 
    "Singapore", "Los-Angeles", "Chicago", "Melbourne", "Brisbane",
    // 25 More Tier-2/Tier-3 Indian Cities
    "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
    "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
    "Rajkot", "Kalyan", "Varanasi", "Srinagar", "Aurangabad",
    "Dhanbad", "Amritsar", "Navi-Mumbai", "Allahabad", "Ranchi",
    "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada"
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
