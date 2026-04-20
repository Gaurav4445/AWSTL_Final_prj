const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const makeCardImage = (title, accent, background, subtitle) => encodeSvg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${background}" />
        <stop offset="100%" stop-color="${accent}" />
      </linearGradient>
    </defs>
    <rect width="800" height="420" rx="36" fill="url(#bg)" />
    <circle cx="688" cy="108" r="92" fill="rgba(255,255,255,0.12)" />
    <circle cx="120" cy="344" r="126" fill="rgba(255,255,255,0.09)" />
    <rect x="56" y="56" width="156" height="34" rx="17" fill="rgba(255,255,255,0.16)" />
    <text x="78" y="78" fill="#fff7ed" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700">${subtitle}</text>
    <text x="56" y="210" fill="#ffffff" font-family="Georgia, serif" font-size="54" font-weight="700">${title}</text>
    <text x="56" y="258" fill="rgba(255,255,255,0.82)" font-family="Segoe UI, Arial, sans-serif" font-size="24">Ready for showcase and quick scanning</text>
  </svg>
`);

export const propertyImageForType = (propertyType = 'Apartment') => {
  const map = {
    Apartment: ['Apartment Living', '#325d79', '#7ba6c2'],
    'Independent House': ['Independent House', '#33503b', '#7ea57c'],
    Villa: ['Villa Retreat', '#6a4937', '#c28f6a'],
    Studio: ['Studio Space', '#8a6233', '#ddb27a'],
    'Row House': ['Row House', '#6d3b3b', '#cf8b85'],
    'Builder Floor': ['Builder Floor', '#454d77', '#9aa3d5'],
    Bungalow: ['Bungalow', '#2b6d67', '#74b7ae'],
  };
  const [title, accent, background] = map[propertyType] || map.Apartment;
  return makeCardImage(title, accent, background, propertyType);
};

export const vendorImageForCategory = (category = 'General Handyman') => {
  const map = {
    Plumber: ['Plumbing Team', '#2f6690', '#8cc7e8'],
    Electrician: ['Electrical Experts', '#1f7a78', '#75c9b7'],
    'AC Mechanic': ['Cooling Service', '#8a6d3b', '#e8ca8c'],
    Carpenter: ['Woodwork Crew', '#6f4f37', '#c9a27f'],
    Painter: ['Paint & Finish', '#8c3a48', '#e39aa7'],
    'Pest Control': ['Pest Control', '#546a7b', '#a7bcc7'],
    'Cleaning Service': ['Deep Cleaning', '#4a7c59', '#96c6a6'],
    'RO Technician': ['RO Specialist', '#3e7ea3', '#9fd5f0'],
    'Inverter/Battery': ['Power Backup', '#384c78', '#99addf'],
    'Gas Agency': ['Gas Support', '#a85f3d', '#efb28e'],
    Security: ['Security Systems', '#444a64', '#a1abc4'],
    'General Handyman': ['Home Handyman', '#59636f', '#bcc6d1'],
  };
  const [title, accent, background] = map[category] || map['General Handyman'];
  return makeCardImage(title, accent, background, category);
};
