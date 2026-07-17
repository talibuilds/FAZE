const NATURE_IMAGES = [
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
  'https://images.unsplash.com/photo-1439405326854-014607f694d7?w=800&q=80',
  'https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
];
let hash = 0;
const id = '6a176fde-6100-431e-bc29-fc234c3720b2';
for (let i = 0; i < id.length; i++) {
  hash = id.charCodeAt(i) + ((hash << 5) - hash);
}
const index = Math.abs(hash) % NATURE_IMAGES.length;
console.log(NATURE_IMAGES[index]);
