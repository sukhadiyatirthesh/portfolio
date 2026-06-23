// Setting current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavLinks = document.querySelectorAll('.nav-links-mobile a');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenuBtn.classList.toggle('active');
  mobileNav.classList.toggle('open');
});

mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuBtn.classList.remove('active');
    mobileNav.classList.remove('open');
  });
});

// Intersection Observer for Reveal Animations
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .fade-in-up');

const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active', 'visible');
      // Optional: Stop observing once revealed
      // observer.unobserve(entry.target); 
    }
  });
};

const revealOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => revealObserver.observe(el));

// Animated Number Counter
const statNumbers = document.querySelectorAll('.stat-number');
let animated = false;

const animateNumbers = () => {
  if (animated) return;

  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    const duration = 2000; // ms
    const stepTime = Math.abs(Math.floor(duration / target));
    let current = 0;

    // For large numbers like 47000, we need a different approach
    if (target > 1000) {
      let startTime = null;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        stat.innerText = Math.floor(easeProgress * target) + (target > 1000 ? '+' : '');

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          stat.innerText = target + (target > 1000 ? '+' : '');
        }
      };
      window.requestAnimationFrame(step);
    } else {
      let now = target;
      stat.innerText = target;
    }
  });
  animated = true;
};

// Observe the hero stats container to trigger number animation
const heroStats = document.querySelector('.hero-stats');
const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateNumbers();
  }
}, { threshold: 0.5 });
if (heroStats) statsObserver.observe(heroStats);


// --- PORTFOLIO GALLERY LOGIC ---

// Vite glob import to grab all images in the portfolio folders dynamically
const images = import.meta.glob('/public/portfolio/**/*.{jpg,jpeg,png,webp,gif}', { eager: true, query: '?url' });

// Setup state
let portfolioData = [];
let currentCategory = 'all';

// Process glob data into an array we can use
for (const path in images) {
  // Path looks like /public/portfolio/folder-name/image.jpg
  const parts = path.split('/');
  const categoryFolder = parts[parts.length - 2];
  const fileName = parts[parts.length - 1];

  // Create a nice title from filename (remove extension and replace - with space)
  const title = fileName.replace(/\.[^/.]+$/, "").replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

  // Formatting category display text
  let categoryName = categoryFolder.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  if (categoryName.toLowerCase().includes('google')) categoryName = 'Google Ads';

  portfolioData.push({
    id: path,
    category: categoryFolder,
    categoryName: categoryName,
    title: title,
    src: images[path].default || images[path]
  });
}

// Fallback mock data if folders are empty
if (portfolioData.length === 0) {
  portfolioData = [
    { id: '1', category: 'google-ads', categoryName: 'Google Ads', title: 'ROAS Scaling Campaign', src: '' },
    { id: '2', category: 'lead-generation', categoryName: 'Lead Generation', title: 'B2B Service Leads', src: '' },
    { id: '3', category: 'high-traffic', categoryName: 'High Traffic', title: 'Brand Awareness Push', src: '' },
    { id: '4', category: 'local-business', categoryName: 'Local Business', title: 'Real Estate Leads', src: '' },
    { id: '5', category: 'google-ads', categoryName: 'Google Ads', title: 'E-com Holiday Sale', src: '' }
  ];
}

const portfolioGrid = document.getElementById('portfolio-grid');

// Render Portfolio items
function renderPortfolio(filterCategory) {
  if (!portfolioGrid) return;
  portfolioGrid.innerHTML = '';

  const filtered = filterCategory === 'all'
    ? portfolioData
    : portfolioData.filter(item => item.category === filterCategory);

  if (filtered.length === 0) {
    portfolioGrid.innerHTML = `
      <div class="portfolio-placeholder">
        <p>No campaign screenshots uploaded yet.</p>
        <p style="font-size: 0.9rem; margin-top: 10px; color: var(--color-primary);">Upload images to public/portfolio/${filterCategory}/</p>
      </div>`;
    return;
  }

  filtered.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'portfolio-item reveal-up active';
    el.style.transitionDelay = `${index * 0.1}s`;

    // Add data attributes for the lightbox
    el.setAttribute('data-index', portfolioData.indexOf(item));

    const imageHtml = item.src
      ? `<img src="${item.src.replace('/public', '')}" alt="${item.title}" loading="lazy">`
      : `<div class="img-placeholder">Campaign Result</div>`;

    el.innerHTML = `
      ${imageHtml}
      <div class="portfolio-overlay">
        <span class="portfolio-category">${item.categoryName}</span>
        <h3>${item.title}</h3>
      </div>
    `;

    // Add click event for Lightbox
    el.addEventListener('click', () => openLightbox(portfolioData.indexOf(item)));
    portfolioGrid.appendChild(el);
  });
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  // Give it a tiny delay to allow CSS to load nicely
  setTimeout(() => renderPortfolio('all'), 100);
});

// Filter Logic
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const filterValue = e.target.getAttribute('data-filter');
    renderPortfolio(filterValue);
  });
});

// --- LIGHTBOX & CASE STUDY LOGIC ---
const caseStudyData = {
  "home-&-bedding-brand-–-google-ads-campaign": {
    industry: "Home & Bedding (Mattress & Sleep Products)",
    platform: "Google Ads",
    campaignType: "Search Campaign",
    objective: "Increase qualified traffic and brand visibility through high-intent search queries.",
    challenge: "The client wanted to increase their visibility on Google for high-intent mattress related searches while keeping advertising costs efficient.<br><br>The main challenge was generating large scale traffic without increasing cost per click, while still targeting users who were actively searching for mattresses and bedding products.",
    strategy: "<ul><li><strong>Keyword Research & Intent Mapping</strong>: Identified high purchase-intent keywords related to mattresses and bedding products.</li><li><strong>Campaign Structure Optimization</strong>: Created tightly themed ad groups to improve ad relevance and quality score.</li><li><strong>High-CTR Ad Copy Testing</strong>: Tested multiple ad variations to identify messaging that attracted the most clicks.</li><li><strong>Negative Keyword Optimization</strong>: Filtered out irrelevant search queries to improve traffic quality.</li><li><strong>Bid & Budget Optimization</strong>: Continuously adjusted bids based on keyword performance and search demand.</li><li><strong>Ongoing Performance Monitoring</strong>: Analyzed campaign data weekly and optimized based on search term performance.</li></ul>",
    results: "<ul><li><strong>47,500+</strong> Clicks Generated</li><li><strong>748,000+</strong> Impressions</li><li>Average CPC: <strong>₹2.69</strong></li><li>Total Ad Spend: <strong>₹128K</strong></li></ul>",
    outcome: "The campaign significantly improved search visibility while maintaining a very efficient cost per click, allowing the brand to attract a large volume of potential customers searching for mattress products.<br><br>This strategy helped the business scale traffic sustainably while maintaining strong advertising efficiency.",
    takeaway: "Strategic keyword targeting, structured campaign setup, and continuous optimization allowed the campaign to deliver large scale traffic with cost-efficient performance."
  }
};

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const csIndustry = document.getElementById('cs-industry');
const csPlatform = document.getElementById('cs-platform');
const csBody = document.getElementById('cs-body');
const closeBtn = document.querySelector('.lightbox-close');
const prevBtn = document.querySelector('.lightbox-prev');
const nextBtn = document.querySelector('.lightbox-next');

let currentLightboxIndex = -1;

function openLightbox(index) {
  currentLightboxIndex = index;
  updateLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background scrolling
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  lightboxImg.classList.remove('zoomed');
}

function updateLightbox() {
  const item = portfolioData[currentLightboxIndex];

  if (item.src) {
    lightboxImg.src = item.src.replace('/public', '');
    lightboxImg.style.display = 'block';
  } else {
    // Fallback if no real image
    lightboxImg.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20600%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%2300ff66%22%3EImage%20Placeholder%3C%2Ftext%3E%3C%2Fsvg%3E';
  }

  lightboxTitle.textContent = item.title;

  // Format the folder name to match our keys (lowercase, spaces to dashes)
  const folderKey = item.category.toLowerCase().replace(/\s+/g, '-');
  const csData = caseStudyData[folderKey];

  if (csData) {
    csIndustry.textContent = csData.industry;
    csPlatform.textContent = csData.platform;
    csIndustry.style.display = 'inline-block';
    csPlatform.style.display = 'inline-block';

    csBody.innerHTML = `
        <div class="cs-section">
           <h4>Campaign Type</h4>
           <p>${csData.campaignType}</p>
        </div>
        <div class="cs-section">
           <h4>Objective</h4>
           <p>${csData.objective}</p>
        </div>
        <div class="cs-section">
           <h4>Challenge</h4>
           <p>${csData.challenge}</p>
        </div>
        <div class="cs-section">
           <h4>Strategy Implemented</h4>
           <div class="cs-list">${csData.strategy}</div>
        </div>
        <div class="cs-section">
           <h4>Results Achieved</h4>
           <div class="cs-list results-list">${csData.results}</div>
        </div>
        <div class="cs-section">
           <h4>Outcome</h4>
           <p>${csData.outcome}</p>
        </div>
        <div class="cs-section takeaway">
           <h4>Key Takeaway</h4>
           <p>${csData.takeaway}</p>
        </div>
      `;
  } else {
    // Fallback UI if there's no dedicated case study data for the folder
    csIndustry.style.display = 'none';
    csPlatform.style.display = 'none';
    csBody.innerHTML = `
        <div class="cs-section empty-state">
           <p>Detailed case study information is coming soon for this campaign.</p>
           <p>Category: <strong>${item.categoryName}</strong></p>
        </div>
     `;
  }
}

function nextImage() {
  currentLightboxIndex = (currentLightboxIndex + 1) % portfolioData.length;
  updateLightbox();
  lightboxImg.classList.remove('zoomed');
}

function prevImage() {
  currentLightboxIndex = (currentLightboxIndex - 1 + portfolioData.length) % portfolioData.length;
  updateLightbox();
  lightboxImg.classList.remove('zoomed');
}

// Lightbox Event Listeners
closeBtn.addEventListener('click', closeLightbox);
nextBtn.addEventListener('click', nextImage);
prevBtn.addEventListener('click', prevImage);
lightbox.addEventListener('click', (e) => {
  if (e.target.classList.contains('lightbox-overlay')) {
    closeLightbox();
  }
});

// Image Zoom toggle
lightboxImg.addEventListener('click', () => {
  lightboxImg.classList.toggle('zoomed');
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;

  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
});
