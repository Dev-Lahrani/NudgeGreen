export const cities = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    multiplier: 0.9,
    transit: 'Extensive local trains + Metro',
  },
  {
    id: 'delhi',
    name: 'Delhi',
    multiplier: 0.95,
    transit: 'Large Metro network',
  },
  {
    id: 'bangalore',
    name: 'Bangalore',
    multiplier: 1.05,
    transit: 'Growing Metro, still car-heavy',
  },
  {
    id: 'chennai',
    name: 'Chennai',
    multiplier: 1.0,
    transit: 'MRTS + Metro',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    multiplier: 1.05,
    transit: 'Limited Metro coverage',
  },
  {
    id: 'pune',
    name: 'Pune',
    multiplier: 1.1,
    transit: 'Auto/bus heavy, limited transit',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    multiplier: 0.9,
    transit: 'Trams + Metro + suburban rail',
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    multiplier: 1.1,
    transit: 'BRTS but limited coverage',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    multiplier: 1.15,
    transit: 'Limited transit options',
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    multiplier: 1.1,
    transit: 'Less EV infrastructure',
  },
]

export function getCityById(id) {
  return cities.find((c) => c.id === id) ?? null
}

const STORAGE_KEY = 'nudgegreen_city'

export function getSavedCity() {
  const id = localStorage.getItem(STORAGE_KEY)
  return id ? getCityById(id) : null
}

export function saveCity(id) {
  localStorage.setItem(STORAGE_KEY, id)
}
