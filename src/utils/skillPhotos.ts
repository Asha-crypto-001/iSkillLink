import carpentry480 from '../assets/photos/carpentry-480.webp';
import electronics480 from '../assets/photos/electronics-480.webp';
import baking480 from '../assets/photos/baking-480.webp';
import studentsWide from '../assets/photos/students-wide.webp';
import teacherWide from '../assets/photos/teacher-wide.webp';
import classroom from '../assets/photos/classroom.webp';

// The workshop photos we have, matched to the skills they show. Other skills get a classroom photo.
const BY_CATEGORY: Record<string, string> = {
  'cat-electrical': electronics480,
  'cat-repair': electronics480,
  'cat-tech': electronics480,
  'cat-ai': electronics480,
  'cat-culinary': baking480,
  'cat-carpentry': carpentry480,
  'cat-welding': carpentry480,
  'cat-construction': carpentry480,
  'cat-crafts': carpentry480,
  'cat-plumbing': carpentry480,
  'cat-automotive': carpentry480
};
const FALLBACKS = [studentsWide, teacherWide, classroom];

/** A photo for a skill card: by category when we have one, otherwise picked steadily from the name. */
export function skillPhoto(categoryId?: string, name = '') {
  if (categoryId && BY_CATEGORY[categoryId]) return BY_CATEGORY[categoryId];
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return FALLBACKS[hash % FALLBACKS.length];
}
