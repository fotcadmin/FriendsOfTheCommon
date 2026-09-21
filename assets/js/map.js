/**
 * Interactive Landmark & Trail Map for The Friends of Tunbridge Wells & Rusthall Commons
 * Built with Leaflet.js and OpenStreetMap
 */

(function () {
  const mapElement = document.getElementById('leaflet-map');
  if (!mapElement) return;

  // Initialize Map centered between Tunbridge Wells and Rusthall Commons
  const map = L.map('leaflet-map', {
    center: [51.1310, 0.2470],
    zoom: 14,
    scrollWheelZoom: false
  });

  // Enable scroll zoom on click/focus
  map.on('click', () => map.scrollWheelZoom.enable());

  // Base Tile Layer (OpenStreetMap standard)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Landmark Dataset — Verified with OpenStreetMap Ground-Truth Coordinates
  const landmarks = [
    {
      id: 'wellington-rocks',
      name: 'Wellington Rocks',
      category: 'heritage',
      catName: 'Rocks & Heritage',
      icon: '🪨',
      lat: 51.130277,
      lng: 0.254214,
      navQuery: 'Wellington Rocks, Tunbridge Wells Common, Tunbridge Wells',
      desc: 'Iconic Ardingly Sandstone outcrop (130 million years old), shaped by prehistoric wind and ice. The premier climbing and picnic destination on Tunbridge Wells Common.'
    },
    {
      id: 'cricket-ground',
      name: 'Higher Cricket Ground (TW Common)',
      category: 'heritage',
      catName: 'Sports & Heritage',
      icon: '🏏',
      lat: 51.129431,
      lng: 0.252939,
      navQuery: 'Linden Park Cricket Club, Higher Common Ground, Tunbridge Wells TN4 8AH',
      desc: 'One of the oldest recorded cricket grounds in England (active since 1782), home to Linden Park Cricket Club in the tranquil heart of Tunbridge Wells Common.'
    },
    {
      id: 'rusthall-cricket-ground',
      name: 'Rusthall Cricket Ground',
      category: 'heritage',
      catName: 'Sports & Heritage',
      icon: '🏏',
      lat: 51.132714,
      lng: 0.235179,
      navQuery: 'Rusthall Cricket Ground, Coach Road, Rusthall, Tunbridge Wells TN4 8RD',
      desc: 'Picturesque village green cricket ground nestled in the heathland of Rusthall Common off Coach Road, framed by ancient woodland near Happy Valley. Home to Rusthall Cricket Club (est. 1887).'
    },
    {
      id: 'happy-valley',
      name: 'Happy Valley & 100 Steps',
      category: 'heritage',
      catName: 'Rocks & Heritage',
      icon: '🏞️',
      lat: 51.130285,
      lng: 0.235182,
      navQuery: 'Happy Valley, Rusthall Common, Tunbridge Wells',
      desc: 'A spectacular romantic sunken sandstone gorge on Rusthall Common featuring ancient rock-cut stone staircases (the 100 Steps), holloways, spring bluebells, and sandstone cave shelters.'
    },
    {
      id: 'toad-rock',
      name: 'Toad Rock',
      category: 'heritage',
      catName: 'Rocks & Heritage',
      icon: '🐸',
      lat: 51.133848,
      lng: 0.239909,
      navQuery: 'Toad Rock, Rusthall, Tunbridge Wells TN4 8NX',
      desc: 'A striking natural geological curiosity resembling a giant toad perched on a sandstone plinth on Rusthall Common. Protected as a historic landmark since Victorian times.'
    },
    {
      id: 'bulls-hollow',
      name: "Bull's Hollow (Quarry & Crag)",
      category: 'heritage',
      catName: 'Rocks & Heritage',
      icon: '🧗',
      lat: 51.132644,
      lng: 0.240951,
      navQuery: 'Bulls Hollow, Rusthall Park, Rusthall, Tunbridge Wells TN4 8PE',
      desc: 'Historic disused 19th-century sandstone quarry and prominent Southern Sandstone climbing crag on Rusthall Common near The Bumps. Features sheltered vertical Ardingly Sandstone faces and woodland trails restored by the Sandstone Volunteers Group.'
    },
    {
      id: 'chalybeate-spring',
      name: 'The Chalybeate Spring (1606)',
      category: 'heritage',
      catName: 'Rocks & Heritage',
      icon: '💧',
      lat: 51.126668,
      lng: 0.258623,
      navQuery: 'The Chalybeate Spring, The Pantiles, Tunbridge Wells TN2 5TE',
      desc: 'The historic mineral-rich chalybeate spring discovered in 1606 that founded Royal Tunbridge Wells. Geologically fed by rainwater filtering through the Commons sandstone strata.'
    },
    {
      id: 'high-rocks',
      name: 'High Rocks & Steam Railway (Extended Trail)',
      category: 'heritage',
      catName: 'Extended Trail',
      icon: '⛰️',
      lat: 51.122770,
      lng: 0.225516,
      navQuery: 'The High Rocks, High Rocks Lane, Tunbridge Wells TN3 9JJ',
      desc: 'Dramatic sister Ardingly Sandstone crags situated 1.5 miles SW of the Common, linked by scenic woodland trails through Broadwater Forest and the heritage Spa Valley Railway. (Privately managed SSSI).'
    },
    {
      id: 'spa-valley-west',
      name: 'Spa Valley Railway (West Station)',
      category: 'heritage',
      catName: 'Heritage Railway',
      icon: '🚂',
      lat: 51.123589,
      lng: 0.252678,
      navQuery: 'Spa Valley Railway, West Station, Nevill Terrace, Tunbridge Wells TN2 5QY',
      desc: 'Historic 1866 Victorian terminus of the heritage Spa Valley Railway, situated at the southern boundary of the Common. Regular steam and heritage diesel departures through the Weald to High Rocks and Groombridge.'
    },
    {
      id: 'fir-tree-pond',
      name: 'Fir Tree Pond',
      category: 'nature',
      catName: 'Nature & Wildlife',
      icon: '🦆',
      lat: 51.131394,
      lng: 0.244758,
      navQuery: 'Fir Tree Pond, Tunbridge Wells Common, Tunbridge Wells',
      desc: 'Restored freshwater pond on Tunbridge Wells Common supporting breeding smooth newts, great crested newts, dragonflies, and water lilies.'
    },
    {
      id: 'marlpit-pond',
      name: 'The Marlpit & Ponds',
      category: 'nature',
      catName: 'Nature & Wildlife',
      icon: '🌿',
      lat: 51.132960,
      lng: 0.236976,
      navQuery: 'Marlpit Pond, Rusthall Common, Tunbridge Wells',
      desc: 'Historic clay and marl pits on Rusthall Common transformed into serene freshwater ponds supporting damselflies, frogs, and waterfowl.'
    },
    {
      id: 'mount-edgcumbe',
      name: 'The Mount Edgcumbe (Pub & Rooms)',
      category: 'food',
      categories: ['food', 'hotels'],
      catName: 'Pubs, Dining & Rooms',
      icon: '🏰',
      lat: 51.131184,
      lng: 0.255642,
      navQuery: 'The Mount Edgcumbe, Mount Ephraim, Tunbridge Wells TN4 8BX',
      desc: 'Historic 18th-century country pub & boutique inn built directly into the living sandstone bedrock on the Common’s edge. Features 6 luxury boutique bedrooms, dog-friendly garden terrace, and seasonal British dining.'
    },
    {
      id: 'the-beau-nash',
      name: 'The Beau Nash (Mount Ephraim)',
      category: 'food',
      catName: 'Pubs & Dining',
      icon: '🍺',
      lat: 51.134747,
      lng: 0.258283,
      navQuery: 'The Beau Nash, 59 Mount Ephraim, Tunbridge Wells TN4 8AE',
      desc: 'Historic 19th-century pub named after the Georgian Master of Ceremonies, situated at 59 Mount Ephraim facing Tunbridge Wells Common. Cask ales & log fire.'
    },
    {
      id: 'the-beacon',
      name: 'The Beacon (Dining & Boutique Rooms)',
      category: 'food',
      categories: ['food', 'hotels'],
      catName: 'Pubs, Dining & Rooms',
      icon: '🍽️',
      lat: 51.130254,
      lng: 0.231831,
      navQuery: 'The Beacon, Tea Garden Lane, Tunbridge Wells TN3 9JH',
      desc: 'Acclaimed dining room, country pub, and boutique retreat perched atop Tea Garden Lane with 6 renovated luxury boutique bedrooms and breathtaking terrace views directly overlooking Happy Valley and Rusthall Common.'
    },
    {
      id: 'toad-rock-retreat',
      name: 'The Toad Rock Retreat',
      category: 'food',
      catName: 'Pubs & Dining',
      icon: '🍺',
      lat: 51.134617,
      lng: 0.239808,
      navQuery: 'The Toad Rock Retreat, 1 Upper Street, Rusthall, Tunbridge Wells TN4 8NX',
      desc: 'Cosy village pub in Rusthall right beside Toad Rock on Upper Street. Welcomes walkers, muddy boots, and dogs with local cask ales and home-cooked pub classics.'
    },
    {
      id: 'spa-hotel',
      name: 'The Spa Hotel & Terrace',
      category: 'hotels',
      categories: ['hotels', 'food'],
      catName: 'Hotels & Dining',
      icon: '🏨',
      lat: 51.130802,
      lng: 0.246222,
      navQuery: 'The Spa Hotel, Mount Ephraim, Tunbridge Wells TN4 8XJ',
      desc: 'Elegant 18th-century 4-star country-house hotel set in 14 acres bordering the Common. Features luxury spa, afternoon tea, and terrace drinks.'
    },
    {
      id: 'tunbridge-wells-hotel',
      name: 'The Tunbridge Wells Hotel',
      category: 'hotels',
      catName: 'Hotels & Stays',
      icon: '🏨',
      lat: 51.125897,
      lng: 0.257416,
      navQuery: 'The Tunbridge Wells Hotel, 58 The Pantiles, Tunbridge Wells TN2 5TD',
      desc: 'Charming boutique hotel located right in the heart of The Pantiles colonnade, a 2-minute walk from the Common. Individually styled heritage rooms.'
    },
    {
      id: 'one-warwick-park',
      name: 'One Warwick Park Hotel',
      category: 'hotels',
      catName: 'Hotels & Stays',
      icon: '🏨',
      lat: 51.126414,
      lng: 0.259607,
      navQuery: 'One Warwick Park Hotel, 1 Warwick Park, Tunbridge Wells TN2 5TA',
      desc: 'Contemporary 4-star boutique hotel in the historic Pantiles district. Combining 19th-century architecture with modern luxury, right near the Common.'
    },
    {
      id: 'premier-inn',
      name: 'Premier Inn (London Road)',
      category: 'hotels',
      catName: 'Hotels & Stays',
      icon: '🏨',
      lat: 51.129922,
      lng: 0.260373,
      navQuery: 'Premier Inn Tunbridge Wells, Merevale House, London Road, Tunbridge Wells TN1 1DZ',
      desc: 'Popular and affordable hotel situated directly opposite the Lower Common on London Road, just 3 minutes on foot from Tunbridge Wells Railway Station.'
    },
    {
      id: 'travelodge',
      name: 'Travelodge (Mount Ephraim)',
      category: 'hotels',
      catName: 'Hotels & Stays',
      icon: '🏨',
      lat: 51.131232,
      lng: 0.253081,
      navQuery: 'Travelodge Tunbridge Wells, 84 Mount Ephraim, Tunbridge Wells TN4 8BU',
      desc: 'Budget-friendly hotel located directly on Mount Ephraim with panoramic views overlooking Wellington Rocks and Tunbridge Wells Common.'
    },
    {
      id: 'royal-wells-hotel',
      name: 'The Royal Wells Hotel',
      category: 'hotels',
      categories: ['hotels', 'food'],
      catName: 'Hotels & Dining',
      icon: '🏨',
      lat: 51.134663,
      lng: 0.258655,
      navQuery: 'The Royal Wells Hotel, 59 Mount Ephraim, Tunbridge Wells TN4 8BE',
      desc: 'Historic landmark hotel on Mount Ephraim directly overlooking Tunbridge Wells Common. Named in honour of frequent visits by young Queen Victoria in the 1830s, featuring traditional rooms, Wells Bar, and conservatory dining.'
    },
    {
      id: 'russell-hotel',
      name: 'The Russell Hotel',
      category: 'hotels',
      catName: 'Hotels & Stays',
      icon: '🏨',
      lat: 51.134188,
      lng: 0.260465,
      navQuery: 'The Russell Hotel, 80 London Road, Tunbridge Wells TN1 1DZ',
      desc: 'Classic Victorian townhouse hotel situated on London Road directly facing the leafy edge of Tunbridge Wells Common, offering traditional en-suite guest accommodation.'
    },
    {
      id: 'rcp-parking',
      name: 'Fairground Car Park (Upper Pantiles)',
      category: 'parking',
      catName: 'Parking & Access',
      icon: '🅿️',
      lat: 51.126083,
      lng: 0.255391,
      navQuery: 'Upper Pantiles Car Park, Major Yorks Road, Tunbridge Wells TN4 8SR',
      desc: 'Charging surface car park (RCP Parking) at the foot of Major York’s Road between Eridge Road and Hungershall Park (TN4 8SR). RingGo / pay on foot.'
    },
    {
      id: 'lower-pantiles-parking',
      name: 'Lower Pantiles Car Park',
      category: 'parking',
      catName: 'Parking & Access',
      icon: '🅿️',
      lat: 51.125258,
      lng: 0.258003,
      navQuery: 'Lower Pantiles Car Park, Linden Park Road, Tunbridge Wells TN2 5TP',
      desc: 'Convenient council-operated car park on Linden Park Road behind The Pantiles (TN2 5TP), just 200m from the Common and Spa Valley Railway.'
    },
    {
      id: 'torrington-parking',
      name: 'Torrington Multi-Storey Car Park',
      category: 'parking',
      catName: 'Parking & Access',
      icon: '🅿️',
      lat: 51.130000,
      lng: 0.262139,
      navQuery: 'Torrington Car Park, Vale Road, Tunbridge Wells TN1 1DJ',
      desc: 'Large council multi-storey car park located next to Tunbridge Wells Station on Vale Road (TN1 1DJ), a 3-minute walk (250m) from the Common.'
    },
    {
      id: 'fir-tree-parking',
      name: 'Fir Tree Road Parking (Free 4h)',
      category: 'parking',
      catName: 'Parking & Access',
      icon: '🅿️',
      lat: 51.129523,
      lng: 0.251694,
      navQuery: 'Fir Tree Road, Tunbridge Wells Common, Tunbridge Wells TN4 8AH',
      desc: 'Free designated roadside parking area (max 4 hours) on Tunbridge Wells Common immediately adjacent to the Higher Cricket Ground.'
    },
    {
      id: 'station',
      name: 'Tunbridge Wells Station (5-min walk)',
      category: 'parking',
      catName: 'Parking & Access',
      icon: '🚉',
      lat: 51.130096,
      lng: 0.263028,
      navQuery: 'Tunbridge Wells Railway Station, Mount Pleasant Road, Tunbridge Wells TN1 1BT',
      desc: 'Southeastern mainline railway station with direct services from London Charing Cross, Waterloo East, London Bridge, and Hastings. 400m to Common.'
    },
    {
      id: 'public-toilets-rocks',
      name: 'Wellington Rocks Public Toilets',
      category: 'facilities',
      catName: 'Public Restrooms',
      icon: '🚻',
      lat: 51.130423,
      lng: 0.253302,
      navQuery: 'Wellington Rocks, Tunbridge Wells Common, Tunbridge Wells TN4 8SR',
      desc: 'Council-maintained public convenience pavilion situated right on the Common beside Wellington Rocks and the Higher Cricket Ground.'
    },
    {
      id: 'public-toilets-pantiles',
      name: 'The Pantiles Public Restrooms',
      category: 'facilities',
      catName: 'Public Restrooms',
      icon: '🚻',
      lat: 51.125652,
      lng: 0.257287,
      navQuery: 'The Pantiles, Tunbridge Wells TN2 5TE',
      desc: 'Public conveniences located at the lower colonnade of The Pantiles, just 2 minutes from the Common across the London Road pedestrian crossing.'
    }
  ];

  // Store active markers
  const markers = {};
  const markerGroup = L.featureGroup().addTo(map);

  // Custom DivIcon generator
  function createPin(icon, category) {
    return L.divIcon({
      className: 'custom-pin-wrapper',
      html: `<div class="custom-pin pin-${category}"><span class="custom-pin-inner">${icon}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32]
    });
  }

  // Populate Markers
  landmarks.forEach(lm => {
    const pin = createPin(lm.icon, lm.category);
    const destinationQuery = lm.navQuery ? encodeURIComponent(lm.navQuery) : `${lm.lat},${lm.lng}`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;

    const popupContent = `
      <div>
        <span class="popup-tag">${lm.catName}</span>
        <h4 class="popup-title">${lm.icon} ${lm.name}</h4>
        <p class="popup-desc">${lm.desc}</p>
        <a href="${directionsUrl}" target="_blank" rel="noopener" class="popup-btn">
          Google Maps Directions &rarr;
        </a>
      </div>
    `;

    const marker = L.marker([lm.lat, lm.lng], { icon: pin })
      .bindPopup(popupContent);

    marker.landmarkData = lm;
    markers[lm.id] = marker;
    markerGroup.addLayer(marker);
  });

  // Fit bounds to show all landmarks
  map.fitBounds(markerGroup.getBounds(), { padding: [40, 40] });

  // Sidebar List Rendering
  const listContainer = document.getElementById('map-places-list');

  function renderList(filteredLandmarks) {
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (filteredLandmarks.length === 0) {
      listContainer.innerHTML = '<div style="padding: 1rem; color: var(--color-text-muted); font-size: 0.9rem;">No landmarks found in this category.</div>';
      return;
    }

    filteredLandmarks.forEach(lm => {
      const item = document.createElement('div');
      item.className = 'place-item';
      item.dataset.id = lm.id;
      item.innerHTML = `
        <div class="place-icon">${lm.icon}</div>
        <div style="flex-grow: 1;">
          <div class="place-name">${lm.name}</div>
          <span class="place-tag">${lm.catName}</span>
          <p class="place-desc">${lm.desc}</p>
        </div>
      `;

      item.addEventListener('click', () => {
        // Highlight active item
        document.querySelectorAll('.place-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        // Pan and open popup
        const marker = markers[lm.id];
        if (marker) {
          map.flyTo([lm.lat, lm.lng], 16, { duration: 0.8 });
          setTimeout(() => marker.openPopup(), 400);
        }
      });

      listContainer.appendChild(item);
    });
  }

  // Initial list render
  renderList(landmarks);

  // Filter Buttons Handling
  const filterBtns = document.querySelectorAll('.map-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.dataset.filter;

      markerGroup.clearLayers();
      const filtered = [];

      landmarks.forEach(lm => {
        const matches = filter === 'all' ||
          lm.category === filter ||
          (Array.isArray(lm.categories) && lm.categories.includes(filter));
        if (matches) {
          filtered.push(lm);
          markerGroup.addLayer(markers[lm.id]);
        }
      });

      renderList(filtered);

      if (filtered.length > 0) {
        map.fitBounds(markerGroup.getBounds(), { padding: [40, 40] });
      }
    });
  });

  // Re-invalidate size on window resize / drawer toggle
  window.addEventListener('resize', () => map.invalidateSize());
})();
