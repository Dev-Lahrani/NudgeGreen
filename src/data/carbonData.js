export const carbonData = [
  // ── TRANSPORT ──────────────────────────────────────────────────────────────
  {
    id: 'cab_petrol',
    label: 'Petrol cab / Ola / Uber (5 km)',
    category: 'transport',
    co2_kg: 0.9,
    convenience_score: 5,
    keywords: ['cab', 'ola', 'uber', 'taxi', 'ride', 'book a cab', 'book cab'],
  },
  {
    id: 'auto_rickshaw',
    label: 'Auto rickshaw (5 km)',
    category: 'transport',
    co2_kg: 0.6,
    convenience_score: 4,
    keywords: ['auto', 'rickshaw', 'autorickshaw', 'tuk tuk'],
  },
  {
    id: 'metro',
    label: 'Metro / subway',
    category: 'transport',
    co2_kg: 0.1,
    convenience_score: 3,
    keywords: ['metro', 'subway', 'tube', 'underground', 'train commute'],
  },
  {
    id: 'city_bus',
    label: 'City bus',
    category: 'transport',
    co2_kg: 0.15,
    convenience_score: 2,
    keywords: ['bus', 'city bus', 'public bus', 'transit bus'],
  },
  {
    id: 'electric_cab',
    label: 'Electric cab / EV (5 km)',
    category: 'transport',
    co2_kg: 0.3,
    convenience_score: 5,
    keywords: ['electric cab', 'ev cab', 'electric car', 'ev taxi', 'electric vehicle'],
  },
  {
    id: 'motorcycle',
    label: 'Motorcycle / scooter (5 km)',
    category: 'transport',
    co2_kg: 0.4,
    convenience_score: 4,
    keywords: ['motorcycle', 'bike', 'scooter', 'two wheeler', 'two-wheeler', 'moped'],
  },
  {
    id: 'walk_cycle',
    label: 'Walking or cycling',
    category: 'transport',
    co2_kg: 0.0,
    convenience_score: 1,
    keywords: ['walk', 'walking', 'cycle', 'cycling', 'bicycle', 'on foot'],
  },
  {
    id: 'domestic_flight',
    label: 'Domestic flight (1 hr)',
    category: 'transport',
    co2_kg: 90,
    convenience_score: 5,
    keywords: ['flight', 'fly', 'airplane', 'plane', 'domestic flight', 'air travel'],
  },
  {
    id: 'long_train',
    label: 'Long-distance train (300 km)',
    category: 'transport',
    co2_kg: 0.5,
    convenience_score: 3,
    keywords: ['train', 'rail', 'railway', 'long distance train', 'intercity train'],
  },
  {
    id: 'petrol_car_solo',
    label: 'Petrol car alone (10 km)',
    category: 'transport',
    co2_kg: 2.0,
    convenience_score: 4,
    keywords: ['drive', 'driving', 'car', 'petrol car', 'my car', 'personal car', 'own car'],
  },

  // ── FOOD ───────────────────────────────────────────────────────────────────
  {
    id: 'food_delivery',
    label: 'Food delivery — Zomato / Swiggy (5 km)',
    category: 'food',
    co2_kg: 3.1,
    convenience_score: 5,
    keywords: ['zomato', 'swiggy', 'food delivery', 'order food', 'ordering food', 'delivery food', 'ordering zomato', 'ordering swiggy'],
  },
  {
    id: 'restaurant_dine',
    label: 'Dining out at restaurant',
    category: 'food',
    co2_kg: 2.0,
    convenience_score: 4,
    keywords: ['restaurant', 'dine out', 'dining out', 'eating out', 'eat out', 'cafe', 'diner'],
  },
  {
    id: 'cook_veg',
    label: 'Cooking vegetarian meal at home',
    category: 'food',
    co2_kg: 0.5,
    convenience_score: 1,
    keywords: ['cook', 'cooking', 'home cook', 'cook at home', 'vegetarian', 'veg meal', 'homemade'],
  },
  {
    id: 'cook_meat',
    label: 'Cooking meat meal at home',
    category: 'food',
    co2_kg: 2.5,
    convenience_score: 2,
    keywords: ['cook meat', 'chicken', 'mutton', 'meat meal', 'non veg', 'non-veg', 'cooking chicken'],
  },
  {
    id: 'disposable_coffee',
    label: 'Coffee in disposable cup',
    category: 'food',
    co2_kg: 0.3,
    convenience_score: 5,
    keywords: ['coffee', 'disposable cup', 'coffee cup', 'takeaway coffee', 'coffee to go', 'buying a coffee'],
  },
  {
    id: 'bottled_water',
    label: 'Buying bottled water',
    category: 'food',
    co2_kg: 0.2,
    convenience_score: 5,
    keywords: ['bottled water', 'plastic bottle', 'water bottle', 'mineral water', 'buying water'],
  },
  {
    id: 'fast_food',
    label: 'Fast food meal (burger / pizza)',
    category: 'food',
    co2_kg: 3.5,
    convenience_score: 5,
    keywords: ['burger', 'pizza', 'fast food', 'mcdonalds', 'kfc', 'dominos', 'domino', 'subway', 'junk food'],
  },
  {
    id: 'beef_meal',
    label: 'Beef / red meat meal',
    category: 'food',
    co2_kg: 6.0,
    convenience_score: 3,
    keywords: ['beef', 'steak', 'red meat', 'lamb', 'pork', 'hamburger'],
  },
  {
    id: 'plant_based',
    label: 'Plant-based / vegan meal',
    category: 'food',
    co2_kg: 0.4,
    convenience_score: 2,
    keywords: ['vegan', 'plant based', 'plant-based', 'salad', 'tofu', 'lentils', 'dal'],
  },
  {
    id: 'grocery_car',
    label: 'Grocery shopping by car',
    category: 'food',
    co2_kg: 1.5,
    convenience_score: 4,
    keywords: ['grocery', 'groceries', 'supermarket', 'mall', 'shopping by car', 'grocery store'],
  },

  // ── SHOPPING ───────────────────────────────────────────────────────────────
  {
    id: 'same_day_delivery',
    label: 'Same-day delivery (Amazon / Flipkart)',
    category: 'shopping',
    co2_kg: 1.8,
    convenience_score: 5,
    keywords: ['same day delivery', 'same-day delivery', 'amazon', 'flipkart', 'quick delivery', 'instant delivery', 'express delivery'],
  },
  {
    id: 'fast_fashion',
    label: 'Fast fashion clothing purchase',
    category: 'shopping',
    co2_kg: 10.0,
    convenience_score: 4,
    keywords: ['fast fashion', 'h&m', 'zara', 'shein', 'fashion', 'clothes', 'clothing', 'shirt', 'dress', 'jeans', 'buying clothes'],
  },
  {
    id: 'second_hand',
    label: 'Second-hand / thrifted clothing',
    category: 'shopping',
    co2_kg: 0.5,
    convenience_score: 2,
    keywords: ['second hand', 'secondhand', 'thrift', 'thrifted', 'used clothes', 'pre-owned', 'preloved'],
  },
  {
    id: 'local_market',
    label: 'Shopping at local market (walk)',
    category: 'shopping',
    co2_kg: 0.3,
    convenience_score: 2,
    keywords: ['local market', 'local shop', 'nearby shop', 'corner store', 'kirana', 'dukaan', 'sabzi mandi'],
  },
  {
    id: 'online_standard',
    label: 'Standard online delivery (3-5 days)',
    category: 'shopping',
    co2_kg: 0.8,
    convenience_score: 3,
    keywords: ['online shopping', 'online order', 'standard delivery', 'e-commerce', 'order online'],
  },
  {
    id: 'new_smartphone',
    label: 'Buying a new smartphone',
    category: 'shopping',
    co2_kg: 70.0,
    convenience_score: 5,
    keywords: ['smartphone', 'phone', 'iphone', 'android', 'new phone', 'mobile phone', 'buying a phone'],
  },
  {
    id: 'plastic_bag',
    label: 'Using a plastic bag',
    category: 'shopping',
    co2_kg: 0.05,
    convenience_score: 5,
    keywords: ['plastic bag', 'polythene', 'carry bag', 'shopping bag', 'polybag'],
  },

  // ── ENERGY ─────────────────────────────────────────────────────────────────
  {
    id: 'ac_8hr',
    label: 'Running AC for 8 hours',
    category: 'energy',
    co2_kg: 1.4,
    convenience_score: 5,
    keywords: ['ac', 'air conditioner', 'air conditioning', 'running ac', 'turn on ac', 'ac on'],
  },
  {
    id: 'lights_on',
    label: 'Leaving lights on all day',
    category: 'energy',
    co2_kg: 0.5,
    convenience_score: 5,
    keywords: ['lights on', 'leaving lights', 'forget lights', 'light on', 'electricity lights'],
  },
  {
    id: 'long_shower',
    label: 'Long hot shower (15 min)',
    category: 'energy',
    co2_kg: 0.3,
    convenience_score: 5,
    keywords: ['shower', 'hot shower', 'long shower', 'bath', 'bathing'],
  },
  {
    id: 'washing_machine_hot',
    label: 'Washing machine on hot cycle',
    category: 'energy',
    co2_kg: 0.7,
    convenience_score: 4,
    keywords: ['washing machine', 'laundry', 'clothes wash', 'washing clothes', 'dryer'],
  },
  {
    id: 'video_streaming',
    label: 'Streaming video 2 hours (HD)',
    category: 'energy',
    co2_kg: 0.04,
    convenience_score: 5,
    keywords: ['streaming', 'netflix', 'youtube', 'hotstar', 'amazon prime', 'watching movie', 'watching online', 'watch a movie online'],
  },
  {
    id: 'crypto_mining',
    label: 'Crypto transaction / mining (1 hr)',
    category: 'energy',
    co2_kg: 0.8,
    convenience_score: 3,
    keywords: ['crypto', 'bitcoin', 'ethereum', 'mining', 'blockchain', 'nft'],
  },
]

/**
 * Find the closest matching entry for a user's decision string.
 * Returns the matched entry or null if no keyword matches.
 */
export function findMatch(userDecision) {
  const input = userDecision.toLowerCase()
  let bestMatch = null
  let bestScore = 0

  for (const entry of carbonData) {
    let score = 0
    for (const keyword of entry.keywords) {
      if (input.includes(keyword.toLowerCase())) {
        // Longer keyword matches score higher (more specific)
        score += keyword.length
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = entry
    }
  }

  return bestScore > 0 ? bestMatch : null
}
