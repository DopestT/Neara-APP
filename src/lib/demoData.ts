import { DemoProfile } from './types';

// Stable SVG avatar generator — abstract, no real persons
const avatar = (seed: string, hue: number) => `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
    <defs>
      <radialGradient id='g' cx='50%' cy='40%'>
        <stop offset='0%' stop-color='hsl(${hue}, 80%, 70%)'/>
        <stop offset='60%' stop-color='hsl(${hue}, 60%, 35%)'/>
        <stop offset='100%' stop-color='hsl(${hue}, 50%, 12%)'/>
      </radialGradient>
      <linearGradient id='s' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='hsl(${(hue+40)%360}, 70%, 60%)' stop-opacity='0.4'/>
        <stop offset='100%' stop-color='hsl(${hue}, 70%, 20%)' stop-opacity='0.1'/>
      </linearGradient>
    </defs>
    <rect width='200' height='200' fill='url(#g)'/>
    <circle cx='100' cy='80' r='38' fill='hsl(${hue}, 30%, 88%)' opacity='0.85'/>
    <ellipse cx='100' cy='180' rx='70' ry='55' fill='hsl(${hue}, 30%, 88%)' opacity='0.85'/>
    <rect width='200' height='200' fill='url(#s)'/>
    <text x='100' y='195' font-family='serif' font-size='10' fill='white' opacity='0.3' text-anchor='middle'>${seed}</text>
  </svg>`
)}`;

export const DEMO_PROFILES: DemoProfile[] = [
  { id: 'p1', name: 'Maya', age: 27, gender: 'woman', intent: 'open_to_chat', vibe: 'coffee_first',
    bio: 'Architect. Late-night espresso, vinyl, slow walks across bridges.',
    interests: ['Architecture', 'Jazz', 'Film'], photo: avatar('Maya', 280),
    verified: true, zone_label: 'Nearby… Almost.', display_x: 38, display_y: 42, privacy_radius: 110,
    height_cm: 168, activity: 'Active', education: 'Graduate degree', drinking: 'Socially', smoking: 'No',
    kids: 'Open to kids', zodiac: 'Capricorn', politics: 'Liberal', spirituality: 'Spiritual',
    looking_for: ['long_term', 'life_partner'], values: ['Empathy', 'Humor', 'Curiosity'],
    recently_active: true, nearby_zone: true },
  { id: 'p2', name: 'Léo', age: 31, gender: 'man', intent: 'see_where_it_goes', vibe: 'feeling_social',
    bio: 'Chef. Markets at sunrise, books at midnight.',
    interests: ['Cooking', 'Markets', 'Travel'], photo: avatar('Leo', 200),
    verified: true, zone_label: 'In your area', display_x: 62, display_y: 28, privacy_radius: 130,
    height_cm: 182, activity: 'Active', education: 'Trade school', drinking: 'Rarely', smoking: 'No',
    kids: 'Want kids', zodiac: 'Aries', politics: 'Moderate', spirituality: 'Not religious',
    looking_for: ['open_to_seeing', 'long_term'], values: ['Honesty', 'Adventure'],
    recently_active: true, nearby_zone: true },
  { id: 'p3', name: 'Aria', age: 24, gender: 'woman', intent: 'this_week', vibe: 'low_key',
    bio: 'Studio musician. Looking for someone with good taste in silence.',
    interests: ['Music', 'Coffee', 'Bookshops'], photo: avatar('Aria', 330),
    verified: false, zone_label: 'Within your circle', display_x: 25, display_y: 65, privacy_radius: 95,
    height_cm: 163, activity: 'Sometimes', education: 'Bachelors', drinking: 'Socially', smoking: 'No',
    kids: "Don't want kids", zodiac: 'Pisces', politics: 'Liberal', spirituality: 'Agnostic',
    looking_for: ['casual', 'open_to_seeing'], values: ['Creativity', 'Calm'],
    recently_active: false, nearby_zone: true },
  { id: 'p4', name: 'Sam', age: 29, gender: 'nonbinary', intent: 'casual', vibe: 'open_to_chat',
    bio: 'Photographer. Soft light and soft people.',
    interests: ['Photography', 'Hikes', 'Wine'], photo: avatar('Sam', 160),
    verified: true, zone_label: 'Nearby', display_x: 72, display_y: 58, privacy_radius: 120,
    height_cm: 175, activity: 'Active', education: 'Bachelors', drinking: 'Socially', smoking: 'No',
    kids: 'Open to kids', zodiac: 'Libra', politics: 'Liberal', spirituality: 'Spiritual',
    looking_for: ['open_to_seeing'], values: ['Empathy', 'Curiosity'],
    recently_active: true, nearby_zone: false },
  { id: 'p5', name: 'Iris', age: 33, gender: 'woman', intent: 'open_to_chat', vibe: 'maybe_tonight',
    bio: 'Design lead. Gallery openings, long dinners, honest conversation.',
    interests: ['Design', 'Art', 'Pasta'], photo: avatar('Iris', 20),
    verified: true, zone_label: 'Nearby… Almost.', display_x: 50, display_y: 74, privacy_radius: 100,
    height_cm: 170, activity: 'Active', education: 'Graduate degree', drinking: 'Socially', smoking: 'No',
    kids: 'Have kids', zodiac: 'Leo', politics: 'Liberal', spirituality: 'Spiritual',
    looking_for: ['long_term', 'life_partner', 'marriage'], values: ['Emotional intelligence', 'Humor'],
    recently_active: true, nearby_zone: true },
  { id: 'p6', name: 'Theo', age: 26, gender: 'man', intent: 'this_week', vibe: 'in_town',
    bio: 'Climber. Always chasing the next pitch.',
    interests: ['Climbing', 'Coffee', 'Films'], photo: avatar('Theo', 100),
    verified: false, zone_label: 'In your area', display_x: 18, display_y: 32, privacy_radius: 105,
    height_cm: 178, activity: 'Very active', education: 'Bachelors', drinking: 'Rarely', smoking: 'No',
    kids: "Don't want kids", zodiac: 'Sagittarius', politics: 'Moderate', spirituality: 'Not religious',
    looking_for: ['casual', 'enm'], values: ['Adventure', 'Honesty'],
    recently_active: false, nearby_zone: true },
  { id: 'p7', name: 'Noor', age: 30, gender: 'woman', intent: 'see_where_it_goes', vibe: 'just_browsing',
    bio: 'Doctor. Quiet evenings, loud laughs.',
    interests: ['Medicine', 'Yoga', 'Tea'], photo: avatar('Noor', 250),
    verified: true, zone_label: 'Within your circle', display_x: 84, display_y: 78, privacy_radius: 115,
    height_cm: 165, activity: 'Active', education: 'Graduate degree', drinking: 'Rarely', smoking: 'No',
    kids: 'Want kids', zodiac: 'Virgo', politics: 'Moderate', spirituality: 'Spiritual',
    looking_for: ['long_term', 'marriage'], values: ['Empathy', 'Emotional intelligence'],
    recently_active: true, nearby_zone: false },
];

export const INTEREST_POOL = Array.from(new Set(DEMO_PROFILES.flatMap(p => p.interests))).sort();

export const findProfile = (id: string) => DEMO_PROFILES.find(p => p.id === id);
