// ATM data for Lubumbashi with real bank locations
export const lubumbashiATMs = [
  // Rawbank ATMs
  {
    id: 'rawbank_1',
    name: 'Rawbank - Avenue Mobutu',
    bank: 'Rawbank',
    coordinate: { latitude: -11.6647, longitude: 27.4794 },
    address: 'Avenue Mobutu, Lubumbashi',
    services: ['Retrait', 'Dépôt', 'Consultation'],
    isOpen: true,
    openingHours: '24h/24',
    rating: 4.2,
    logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: 'rawbank_2',
    name: 'Rawbank - Centre Ville',
    bank: 'Rawbank',
    coordinate: { latitude: -11.6598, longitude: 27.4731 },
    address: 'Centre Ville, Lubumbashi',
    services: ['Retrait', 'Consultation'],
    isOpen: true,
    openingHours: '06:00 - 22:00',
    rating: 4.0,
    logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: 'rawbank_3',
    name: 'Rawbank - Katuba',
    bank: 'Rawbank',
    coordinate: { latitude: -11.6892, longitude: 27.4523 },
    address: 'Commune de Katuba, Lubumbashi',
    services: ['Retrait', 'Dépôt', 'Consultation', 'Virement'],
    isOpen: true,
    openingHours: '24h/24',
    rating: 4.5,
    logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },

  // Equity Bank ATMs
  {
    id: 'equity_1',
    name: 'Equity Bank - Avenue Lumumba',
    bank: 'Equity Bank',
    coordinate: { latitude: -11.6612, longitude: 27.4756 },
    address: 'Avenue Patrice Lumumba, Lubumbashi',
    services: ['Retrait', 'Consultation'],
    isOpen: true,
    openingHours: '24h/24',
    rating: 4.1,
    logo: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: 'equity_2',
    name: 'Equity Bank - Kampemba',
    bank: 'Equity Bank',
    coordinate: { latitude: -11.6445, longitude: 27.4889 },
    address: 'Commune de Kampemba, Lubumbashi',
    services: ['Retrait', 'Dépôt', 'Consultation'],
    isOpen: true,
    openingHours: '06:00 - 22:00',
    rating: 3.9,
    logo: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },

  // BCDC ATMs
  {
    id: 'bcdc_1',
    name: 'BCDC - Avenue Sendwe',
    bank: 'BCDC',
    coordinate: { latitude: -11.6578, longitude: 27.4812 },
    address: 'Avenue Jason Sendwe, Lubumbashi',
    services: ['Retrait', 'Consultation', 'Virement'],
    isOpen: true,
    openingHours: '24h/24',
    rating: 4.3,
    logo: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: 'bcdc_2',
    name: 'BCDC - Ruashi',
    bank: 'BCDC',
    coordinate: { latitude: -11.6234, longitude: 27.5123 },
    address: 'Commune de Ruashi, Lubumbashi',
    services: ['Retrait', 'Dépôt', 'Consultation'],
    isOpen: true,
    openingHours: '06:00 - 20:00',
    rating: 4.0,
    logo: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },

  // TMB ATMs
  {
    id: 'tmb_1',
    name: 'TMB - Avenue Kasavubu',
    bank: 'TMB',
    coordinate: { latitude: -11.6634, longitude: 27.4723 },
    address: 'Avenue Kasavubu, Lubumbashi',
    services: ['Retrait', 'Consultation'],
    isOpen: true,
    openingHours: '24h/24',
    rating: 3.8,
    logo: 'https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: 'tmb_2',
    name: 'TMB - Annexe',
    bank: 'TMB',
    coordinate: { latitude: -11.6789, longitude: 27.4567 },
    address: 'Commune de l\'Annexe, Lubumbashi',
    services: ['Retrait', 'Dépôt', 'Consultation'],
    isOpen: false,
    openingHours: '07:00 - 19:00',
    rating: 3.7,
    logo: 'https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },

  // FBN Bank ATMs
  {
    id: 'fbn_1',
    name: 'FBN Bank - Gécamines',
    bank: 'FBN Bank',
    coordinate: { latitude: -11.6523, longitude: 27.4698 },
    address: 'Quartier Gécamines, Lubumbashi',
    services: ['Retrait', 'Consultation'],
    isOpen: true,
    openingHours: '24h/24',
    rating: 4.1,
    logo: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },

  // UBA ATMs
  {
    id: 'uba_1',
    name: 'UBA - Kenya',
    bank: 'UBA',
    coordinate: { latitude: -11.6712, longitude: 27.4834 },
    address: 'Commune de Kenya, Lubumbashi',
    services: ['Retrait', 'Dépôt', 'Consultation'],
    isOpen: true,
    openingHours: '06:00 - 22:00',
    rating: 3.9,
    logo: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },

  // Access Bank ATMs
  {
    id: 'access_1',
    name: 'Access Bank - Lubumbashi Plaza',
    bank: 'Access Bank',
    coordinate: { latitude: -11.6567, longitude: 27.4789 },
    address: 'Lubumbashi Plaza, Centre Ville',
    services: ['Retrait', 'Consultation', 'Virement'],
    isOpen: true,
    openingHours: '24h/24',
    rating: 4.2,
    logo: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },

  // Sofibanque ATMs
  {
    id: 'sofi_1',
    name: 'Sofibanque - Makomeno',
    bank: 'Sofibanque',
    coordinate: { latitude: -11.6823, longitude: 27.4612 },
    address: 'Quartier Makomeno, Lubumbashi',
    services: ['Retrait', 'Consultation'],
    isOpen: true,
    openingHours: '07:00 - 21:00',
    rating: 3.6,
    logo: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },

  // Additional strategic locations
  {
    id: 'rawbank_4',
    name: 'Rawbank - Aéroport',
    bank: 'Rawbank',
    coordinate: { latitude: -11.5912, longitude: 27.5308 },
    address: 'Aéroport International de Lubumbashi',
    services: ['Retrait', 'Consultation'],
    isOpen: true,
    openingHours: '24h/24',
    rating: 4.4,
    logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: 'equity_3',
    name: 'Equity Bank - Université de Lubumbashi',
    bank: 'Equity Bank',
    coordinate: { latitude: -11.6156, longitude: 27.4723 },
    address: 'Campus Universitaire, Lubumbashi',
    services: ['Retrait', 'Consultation'],
    isOpen: true,
    openingHours: '06:00 - 20:00',
    rating: 4.0,
    logo: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  },
  {
    id: 'bcdc_3',
    name: 'BCDC - Marché Central',
    bank: 'BCDC',
    coordinate: { latitude: -11.6623, longitude: 27.4756 },
    address: 'Marché Central, Lubumbashi',
    services: ['Retrait', 'Dépôt', 'Consultation'],
    isOpen: true,
    openingHours: '05:00 - 23:00',
    rating: 3.8,
    logo: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  }
];

export const bankColors = {
  'Rawbank': '#e74c3c',
  'Equity Bank': '#2ecc71',
  'BCDC': '#3498db',
  'TMB': '#f39c12',
  'FBN Bank': '#9b59b6',
  'UBA': '#e67e22',
  'Access Bank': '#1abc9c',
  'Sofibanque': '#34495e'
};

export const getBankLogo = (bankName: string) => {
  const logos = {
    'Rawbank': 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    'Equity Bank': 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    'BCDC': 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    'TMB': 'https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    'FBN Bank': 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    'UBA': 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    'Access Bank': 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    'Sofibanque': 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
  };
  return logos[bankName] || logos['Rawbank'];
};