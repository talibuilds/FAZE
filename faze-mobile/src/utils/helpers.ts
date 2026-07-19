const INDIAN_NAMES = [
  'Aarav Sharma',
  'Vivaan Patel',
  'Aditya Singh',
  'Vihaan Kumar',
  'Arjun Gupta',
  'Sai Reddy',
  'Ananya Iyer',
  'Diya Desai',
  'Priya Nair',
  'Riya Joshi',
  'Neha Rao',
  'Kavya Menon',
  'Rahul Verma',
  'Karan Malhotra',
  'Vikram Chawla',
  'Pooja Kapoor'
];

export const getIndianName = (id?: string): string => {
  let hash = 0;
  if (id) {
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  const index = Math.abs(hash) % INDIAN_NAMES.length;
  return INDIAN_NAMES[index];
};

export const getDescription = (title?: string): string => {
  return `A breathtaking capture highlighting the raw beauty and intricacies of ${title ? title.toLowerCase() : 'nature'}. Perfect for a stunning wallpaper or a creative project. This exclusive piece brings a touch of serenity and inspiration to your collection.`;
};
