/* ═══════════════════════════════════════════════════════════
   The Weird Wanderer — Personal Content Data Module
   ═══════════════════════════════════════════════════════════ */

const DESTINATIONS = [
  {
    id: 'kutch',
    name: 'Kutch',
    region: 'Gujarat, India',
    tagline: 'Salt deserts and ancient shipyards',
    coords: '23.3°N, 69.7°E',
    lat: 23.3,
    lng: 69.7,
    storyCount: 1,
    image: 'assets/kutch-cover.jpg',
    storyUrl: 'kutch.html',
    gradient: 'linear-gradient(135deg, #a04020 0%, #c8a96e 100%)',
    color: '#c8a96e'
  },
  {
    id: 'tikona',
    name: 'Tikona Fort',
    region: 'Maharashtra, India',
    tagline: 'Vitandgad — The pyramid of Maval',
    coords: '18.6°N, 73.5°E',
    lat: 18.6,
    lng: 73.5,
    storyCount: 1,
    image: 'assets/tikona-cover.jpg',
    storyUrl: 'tikona.html',
    gradient: 'linear-gradient(135deg, #4a6741 0%, #8ca67a 100%)',
    color: '#8ca67a'
  },
  {
    id: 'barmer',
    name: 'Barmer',
    region: 'Rajasthan, India',
    tagline: "The Thar's Timeless Heart",
    coords: '25.75°N, 71.38°E',
    lat: 25.75,
    lng: 71.38,
    storyCount: 1,
    image: 'assets/barmer-cover.jpg',
    storyUrl: 'barmer.html',
    gradient: 'linear-gradient(135deg, #d4a574 0%, #a06040 100%)',
    color: '#d4a574'
  },
  {
    id: 'harishchandragad',
    name: 'Harishchandragad',
    region: 'Maharashtra, India',
    tagline: 'The Citadel of Ancient Spirits',
    coords: '19.38°N, 73.77°E',
    lat: 19.38,
    lng: 73.77,
    storyCount: 1,
    image: 'assets/harishchandragad-cover.jpg',
    storyUrl: 'harishchandragad.html',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #bdc3c7 100%)',
    color: '#bdc3c7'
  }
];

const STORIES = [
  {
    id: 'kutch-salt',
    title: 'Bhuj — Mandvi — Kutch',
    destination: 'kutch',
    category: 'solo',
    excerpt: 'Five days traversing the white desert, the ancient shipyards of Mandvi, and the resilient heart of Bhuj.',
    author: 'The Weird Wanderer',
    date: '2024-01-13',
    readTime: '15 min',
    dispatch: '№ 52',
    storyUrl: 'kutch.html'
  },
  {
    id: 'tikona-summit',
    title: 'The Pyramid of Maval — Scaling Tikona',
    destination: 'tikona',
    category: 'trek',
    excerpt: 'Ascending the near-vertical stone steps of Vitandgad to witness the Pawana valley draped in morning mist.',
    author: 'The Weird Wanderer',
    date: '2025-11-29',
    readTime: '10 min',
    dispatch: '№ 53',
    storyUrl: 'tikona.html'
  },
  {
    id: 'barmer-sands',
    title: 'The Sands of Time — Barmer',
    destination: 'barmer',
    category: 'expedition',
    excerpt: 'Drifting through the ancient corridors of Kiradu and the shifting dunes of the deep Thar.',
    author: 'The Weird Wanderer',
    date: '2025-02-02',
    readTime: '12 min',
    dispatch: '№ 54',
    storyUrl: 'barmer.html'
  },
  {
    id: 'harishchandragad-trek',
    title: 'The Midnight Ascent — Harishchandragad',
    destination: 'harishchandragad',
    category: 'trek',
    excerpt: 'Witnessing the vertical cloud burst at the legendary Konkan Kada and the mysteries of Kedareshwar.',
    author: 'The Weird Wanderer',
    date: '2025-06-15',
    readTime: '12 min',
    dispatch: '№ 55',
    storyUrl: 'harishchandragad.html'
  }
];

const PHOTOS = [
  { id: 'kutch-rann', title: 'White Rann at Dusk', destination: 'kutch', type: 'image', gradient: 'linear-gradient(145deg,#c8a96e,#f0c060)', aspect: 'wide', url: 'assets/kutch-cover.jpg' },
  { id: 'bhuj-palace', title: 'Aina Mahal Details', destination: 'kutch', type: 'image', gradient: 'linear-gradient(145deg,#8b3a3a,#d4a574)', aspect: 'tall', url: 'assets/bhuj-palace.jpg' },
  { id: 'mandvi-ships', title: 'Shipbuilding at Mandvi', destination: 'kutch', type: 'image', gradient: 'linear-gradient(145deg,#355e4a,#88b09a)', aspect: 'wide', url: 'assets/mandvi-ships.jpg' },
  { id: 'kutch-vlog', title: 'Rann Trails - Video Dispatch', destination: 'kutch', type: 'video', gradient: 'linear-gradient(145deg,#1a1a1a,#333)', aspect: 'wide', url: 'assets/kutch-vlog.mp4', thumbnail: 'assets/kutch-cover.jpg' },
  
  { id: 'tikona-sunset', title: 'Sunset at Kamshet', destination: 'tikona', type: 'image', gradient: 'linear-gradient(145deg,#a04020,#f0c060)', aspect: 'tall', url: 'assets/tikona/kamshet-sunset.jpg' },
  { id: 'tikona-river', title: 'Reflections by the River', destination: 'tikona', type: 'image', gradient: 'linear-gradient(145deg,#4a6741,#8ca67a)', aspect: 'wide', url: 'assets/tikona/river.jpg' },
  { id: 'tikona-selfie1', title: 'Night Spirits', destination: 'tikona', type: 'image', gradient: 'linear-gradient(145deg,#1a1a1a,#333)', aspect: 'wide', url: 'assets/tikona/selfie1.jpg' },
  { id: 'tikona-selfie2', title: 'Arrival at the Junction', destination: 'tikona', type: 'image', gradient: 'linear-gradient(145deg,#5d7a8c,#a0c0d0)', aspect: 'wide', url: 'assets/tikona/selfie2.jpg' },
  { id: 'tikona-friends', title: 'The Brotherhood', destination: 'tikona', type: 'image', gradient: 'linear-gradient(145deg,#8b3a3a,#d4a574)', aspect: 'tall', url: 'assets/tikona/friends.jpg' },
  { id: 'tikona-steps', title: 'The Vertical Climb', destination: 'tikona', type: 'image', gradient: 'linear-gradient(145deg,#4a6741,#8ca67a)', aspect: 'tall', url: 'assets/tikona-cover.jpg' },
  { id: 'tikona-view', title: 'Pawana Valley Vista', destination: 'tikona', type: 'image', gradient: 'linear-gradient(145deg,#5d7a8c,#a0c0d0)', aspect: 'wide', url: 'assets/tikona-bench.jpg' },
  { id: 'tikona-drone', title: 'Aerial Tikona - The Pyramid', destination: 'tikona', type: 'video', gradient: 'linear-gradient(145deg,#1a1a1a,#333)', aspect: 'wide', url: 'assets/tikona-drone.mp4', thumbnail: 'assets/tikona-cover.jpg' },
  
  { id: 'barmer-dunes', title: 'The Shifting Thar', destination: 'barmer', type: 'image', gradient: 'linear-gradient(145deg,#d4a574,#a06040)', aspect: 'wide', url: 'assets/barmer-cover.jpg' },
  { id: 'kiradu-detail', title: 'Stone Poetry — Kiradu', destination: 'barmer', type: 'image', gradient: 'linear-gradient(145deg, #8b3a3a, #d4a574)', aspect: 'tall', url: 'assets/kiradu-detail.jpg' },
  { id: 'barmer-vlog', title: 'Barmer Chronicles - Video', destination: 'barmer', type: 'video', gradient: 'linear-gradient(145deg,#1a1a1a,#333)', aspect: 'wide', url: 'assets/barmer-vlog.mp4', thumbnail: 'assets/barmer-cover.jpg' },
  { id: 'harish-konkan', title: 'The Void at Konkan Kada', destination: 'harishchandragad', type: 'image', gradient: 'linear-gradient(145deg,#2c3e50,#bdc3c7)', aspect: 'wide', url: 'assets/harishchandragad-cover.jpg' }
];

const TRAVELERS = [
  { name: 'Aditya', image: 'assets/tikona/friends.jpg', destinationId: ['tikona'], bio: 'The quiet strategist. Navigates trails like he navigates code — methodically, with occasional bursts of brilliance.' },
  { name: 'Rudra', image: 'assets/tikona/river.jpg', destinationId: ['tikona'], bio: 'Finds poetry in rivers and ruins. Always the first to spot a hidden waterfall or a forgotten temple.' },
  { name: 'Sahil', image: 'assets/tikona/selfie1.jpg', destinationId: ['tikona'], bio: 'The group\'s unofficial photographer. Carries three lenses and zero regrets about the extra weight.' },
  { name: 'Shivam AKA Babu Rao', image: 'assets/tikona/selfie2.jpg', destinationId: ['tikona'], bio: 'Legend of the campfire. His stories are 40% truth, 60% imagination, and 100% unforgettable.' },
  { name: 'Aryan', image: 'assets/tikona/sunset.jpg', destinationId: ['tikona'], bio: 'Chases sunsets like they owe him money. Has a sixth sense for golden hour lighting.' },
  { name: 'Sahil', image: 'assets/tikona/friends.jpg', destinationId: ['tikona'], bio: 'The second Sahil. Proves that great names attract great travelers. Night trail specialist.' },
  { name: 'OM', image: 'assets/tikona/river.jpg', destinationId: ['tikona'], bio: 'Walks in silence, speaks in wisdom. The kind of traveler who makes you notice things you\'d otherwise miss.' },
  { name: 'Ayush', image: 'assets/tikona/selfie1.jpg', destinationId: ['tikona'], bio: 'Energy that could power a small village. First to the summit, last to leave the campsite.' },
  { name: 'Abhay', image: 'assets/tikona/sunset.jpg', destinationId: ['tikona'], bio: 'The fearless one. If there\'s a cliff to peer over or a cave to explore, Abhay\'s already inside.' },
  { name: 'The Weird Wanderer', image: 'assets/kutch-cover.jpg', destinationId: ['kutch', 'barmer'], bio: 'Curator of strange routes and stranger stories. Believes the best journeys are the ones you can\'t explain.' },
  { name: 'Arav', image: 'assets/barmer-cover.jpg', destinationId: ['kutch', 'barmer'], bio: 'Desert soul. Finds comfort in the vast emptiness of the Thar and the silence between sand dunes.' }
];

// ── Helpers ──
function getDestination(id) { return DESTINATIONS.find(d => d.id === id); }
function getStoriesFor(destId) { return STORIES.filter(s => s.destination === destId); }
function getPhotosFor(destId) { return PHOTOS.filter(p => p.destination === destId); }
function getCategoryStories(cat) { return STORIES.filter(s => s.category === cat); }
function getTravelersFor(destId) { return TRAVELERS.filter(t => t.destinationId.includes(destId)); }
