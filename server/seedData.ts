import {
  User, Learner, Educator, Category, Skill, EducatorSkill,
  Qualification, Portfolio, Verification, LearnerRequest,
  Match, Booking, Availability, Payment, Transaction, Review,
  Message, Notification, AdminAction
} from './types.js';

export const initialCategories: Category[] = [
  { id: 'cat-fashion', name: 'Fashion & Tailoring', slug: 'fashion-tailoring', description: 'Pattern drafting, garment cutting, sewing machine maintenance, African prints & bridal couture', icon_name: 'Scissors', sort_order: 1 },
  { id: 'cat-tech', name: 'Web Development & Programming', slug: 'web-programming', description: 'Frontend, backend, React, Node.js, Python, and practical software engineering', icon_name: 'Code', sort_order: 2 },
  { id: 'cat-repair', name: 'Phone Repair & Electronics', slug: 'phone-repair-electronics', description: 'Hardware diagnostics, screen replacement, micro-soldering, PCB troubleshooting', icon_name: 'Smartphone', sort_order: 3 },
  { id: 'cat-culinary', name: 'Cooking & Baking', slug: 'cooking-baking', description: 'Commercial pastry, artisan breads, cake decoration, culinary sanitation & catering', icon_name: 'Utensils', sort_order: 4 },
  { id: 'cat-electrical', name: 'Electrical & Solar', slug: 'electrical-solar', description: 'Domestic & industrial wiring, solar inverter setups, battery storage, safety compliance', icon_name: 'Zap', sort_order: 5 },
  { id: 'cat-welding', name: 'Welding & Metalwork', slug: 'welding-metalwork', description: 'MIG, TIG, stick welding, structural gates, metal fabrication, tool handling', icon_name: 'Hammer', sort_order: 6 },
  { id: 'cat-carpentry', name: 'Carpentry & Woodwork', slug: 'carpentry-woodwork', description: 'Custom furniture design, joinery, timber selection, finishing and restoration', icon_name: 'Wrench', sort_order: 7 },
  { id: 'cat-agriculture', name: 'Agriculture & Agribusiness', slug: 'agriculture-agribusiness', description: 'Commercial poultry, greenhouse horticulture, dairy farm management, drip irrigation', icon_name: 'Sprout', sort_order: 8 },
  { id: 'cat-photography', name: 'Photography & Video', slug: 'photography-video', description: 'Studio lighting, portraiture, Premiere Pro / DaVinci editing, commercial video', icon_name: 'Camera', sort_order: 9 },
  { id: 'cat-design', name: 'Graphic Design & UI/UX', slug: 'graphic-design-ui', description: 'Photoshop, Illustrator, branding, typography, Figma UI design & layout', icon_name: 'Palette', sort_order: 10 },
  { id: 'cat-business', name: 'Accounting & Business Skills', slug: 'accounting-business', description: 'QuickBooks, tax compliance with URA, bookkeeping, financial forecasting', icon_name: 'Briefcase', sort_order: 11 },
  { id: 'cat-marketing', name: 'Digital Marketing & Social Media', slug: 'digital-marketing', description: 'Performance marketing, Meta ads, SEO, TikTok & Reels content for SME growth', icon_name: 'TrendingUp', sort_order: 12 },
  { id: 'cat-beauty', name: 'Beauty & Hair Styling', slug: 'beauty-hair', description: 'Bridal makeup, skin prep, precision hair styling, manicures, salon hygiene', icon_name: 'Sparkles', sort_order: 13 },
  { id: 'cat-plumbing', name: 'Plumbing & Pipefitting', slug: 'plumbing', description: 'Domestic plumbing, PEX piping, drainage systems, water heater installations', icon_name: 'Droplets', sort_order: 14 },
  { id: 'cat-automotive', name: 'Automotive & Mechanics', slug: 'automotive', description: 'OBD diagnostics, engine overhaul, suspension, electrical troubleshooting', icon_name: 'Car', sort_order: 15 },
  { id: 'cat-communication', name: 'Communication & Career', slug: 'communication-career', description: 'Public speaking, interview prep, grant writing, corporate business English', icon_name: 'MessageSquare', sort_order: 16 },
  { id: 'cat-music', name: 'Music & Audio Production', slug: 'music-audio', description: 'Acoustic guitar, keyboard, vocal training, FL Studio / Logic beatmaking', icon_name: 'Music', sort_order: 17 },
  { id: 'cat-construction', name: 'Construction & Masonry', slug: 'construction-masonry', description: 'Bricklaying, tiling, concrete mixing, blueprint interpretation & site supervision', icon_name: 'Building2', sort_order: 18 },
  { id: 'cat-crafts', name: 'Crafts & Handmade Goods', slug: 'crafts', description: 'Beadwork, basket weaving, leather shoes & bags, pottery', icon_name: 'Feather', sort_order: 19 },
  { id: 'cat-ai', name: 'AI & Applied Technology', slug: 'ai-technology', description: 'Practical AI tools for business, workflow automation, prompt engineering', icon_name: 'Cpu', sort_order: 20 },
];

export const initialSkills: Skill[] = [
  { id: 'skill-tailoring-1', category_id: 'cat-fashion', name: 'Garment Pattern Drafting & Cutting', slug: 'pattern-drafting', description: 'Learn accurate manual pattern making for suits, dresses, and traditional attire.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 20, popular: true },
  { id: 'skill-tailoring-2', category_id: 'cat-fashion', name: 'Industrial Sewing Machine Mastery', slug: 'industrial-sewing', description: 'Operating and maintaining heavy-duty straight-stitch and overlock industrial machines.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 15, popular: true },
  { id: 'skill-web-1', category_id: 'cat-tech', name: 'Full-Stack Web Development (React & Node)', slug: 'fullstack-web-dev', description: 'Modern responsive web development with React, TypeScript, APIs and databases.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 35, popular: true },
  { id: 'skill-web-2', category_id: 'cat-tech', name: 'Python for Beginners & Automation', slug: 'python-automation', description: 'Core Python fundamentals, scripting, data handling and daily task automation.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 20, popular: false },
  { id: 'skill-phone-1', category_id: 'cat-repair', name: 'Smartphone Hardware Diagnostics & Repair', slug: 'smartphone-hardware-repair', description: 'Screen replacement, battery soldering, charging port repairs, and board schematics.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 25, popular: true },
  { id: 'skill-phone-2', category_id: 'cat-repair', name: 'Micro-Soldering & Circuit Diagnostics', slug: 'microsoldering', description: 'SMD component soldering, heat gun calibration, microscope diagnostics.', level_options: ['intermediate', 'advanced'], typical_duration_hours: 20 },
  { id: 'skill-baking-1', category_id: 'cat-culinary', name: 'Commercial Pastry & Cake Decorating', slug: 'commercial-pastry-cake-decorating', description: 'Tiered wedding cakes, sharp fondant edges, Swiss meringue buttercream, and baking math.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 18, popular: true },
  { id: 'skill-electrical-1', category_id: 'cat-electrical', name: 'Solar PV System Sizing & Installation', slug: 'solar-pv-installation', description: 'Load calculation, hybrid inverter setup, lithium battery bank wiring, safety earthing.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 24, popular: true },
  { id: 'skill-electrical-2', category_id: 'cat-electrical', name: 'Domestic Single-Phase Electrical Wiring', slug: 'domestic-electrical-wiring', description: 'Conduit bending, consumer unit wiring, circuit breaker sizing to Ugandan ERA standards.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 20 },
  { id: 'skill-welding-1', category_id: 'cat-welding', name: 'Electric Arc & MIG Welding', slug: 'arc-mig-welding', description: 'Joint prep, vertical & overhead welding beads, metal gate and grille fabrication.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 25, popular: true },
  { id: 'skill-carpentry-1', category_id: 'cat-carpentry', name: 'Modern Cabinetry & Joinery', slug: 'cabinetry-joinery', description: 'Mortise & tenon joints, pocket screws, laminate finishing, kitchen carcass construction.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 30, popular: true },
  { id: 'skill-agri-1', category_id: 'cat-agriculture', name: 'Commercial Broiler & Layer Poultry Farming', slug: 'poultry-farming-management', description: 'Brooding chamber setup, feed conversion ratios, vaccination schedules, bio-security.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 16, popular: true },
  { id: 'skill-agri-2', category_id: 'cat-agriculture', name: 'Dairy Farming & Quality Milk Value Addition', slug: 'dairy-farming-value-addition', description: 'Pasture management, breed selection, silage production, hygienic milk handling.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 20, popular: true },
  { id: 'skill-photo-1', category_id: 'cat-photography', name: 'Portrait & Studio Lighting Techniques', slug: 'studio-lighting-photography', description: 'Three-point lighting, speedlights, modifiers, manual camera exposure, model direction.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 12, popular: true },
  { id: 'skill-photo-2', category_id: 'cat-photography', name: 'Video Editing in DaVinci Resolve & Premiere', slug: 'video-editing-color-grading', description: 'Rough cuts, timeline pacing, color grading, audio cleanup, social media exports.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 18 },
  { id: 'skill-design-1', category_id: 'cat-design', name: 'Brand Identity & Vector Illustration (Illustrator)', slug: 'brand-identity-vector', description: 'Logo design, vector curves, typography rules, brand guideline document creation.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 16, popular: true },
  { id: 'skill-biz-1', category_id: 'cat-business', name: 'SME Bookkeeping & QuickBooks Online', slug: 'sme-bookkeeping-quickbooks', description: 'Chart of accounts, invoices, VAT reconciliations, financial statements for Ugandan businesses.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 15, popular: true },
  { id: 'skill-biz-2', category_id: 'cat-business', name: 'Uganda Tax Compliance & URA e-Tax Filing', slug: 'ura-etax-filing', description: 'TIN registration, monthly PAYE, withholding tax, and annual corporate income returns.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 12 },
  { id: 'skill-mktg-1', category_id: 'cat-marketing', name: 'Meta & TikTok Ads for Ugandan SMEs', slug: 'meta-tiktok-ads-sme', description: 'Targeting local Ugandan audiences, MTN/Airtel payment integration, ad spend optimization.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 14, popular: true },
  { id: 'skill-beauty-1', category_id: 'cat-beauty', name: 'Bridal Makeup Artistry & Skin Preparation', slug: 'bridal-makeup-artistry', description: 'Color matching for African skin tones, high-definition bridal prep, setting techniques.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 16, popular: true }
];

import crypto from 'crypto';
import { hashPasswordSync } from './utils/security.js';

/**
 * The founder account's password comes from ADMIN_PASSWORD (see .env.example) and is only
 * used when seeding a fresh database. Without it, the account gets an unguessable random
 * password so no credential ever lives in source control.
 */
function seedAdminPasswordHash(): string {
  const configured = process.env.ADMIN_PASSWORD;
  if (configured && configured.length >= 8) return hashPasswordSync(configured);
  console.warn('[Security Warning] ADMIN_PASSWORD is not set (or shorter than 8 characters). The seeded admin account will not be able to sign in with a password until it is set and the database is re-seeded.');
  return hashPasswordSync(crypto.randomBytes(32).toString('hex'));
}

// Built on demand so the password is only hashed (and the warning only shown) when seeding.
export function createInitialUsers(): Array<User & { password_hash: string }> {
  return [
    {
      id: 'usr-admin-ashabahebwa',
      email: 'ashabahebwahassan665@gmail.com',
      password_hash: seedAdminPasswordHash(),
      role: 'admin',
      is_primary_admin: true,
      name: 'Ashabahebwa Hassan',
      phone: '+256 744 024 529',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      location: 'Mbarara City, Uganda',
      created_at: '2026-01-01T08:00:00Z',
      updated_at: '2026-01-01T08:00:00Z'
    }
  ];
}

export const initialEducators: Educator[] = [];
export const initialLearners: Learner[] = [];
export const initialEducatorSkills: EducatorSkill[] = [];
export const initialQualifications: Qualification[] = [];
export const initialPortfolios: Portfolio[] = [];
export const initialVerifications: Verification[] = [];
export const initialLearnerRequests: LearnerRequest[] = [];
export const initialMatches: Match[] = [];
export const initialBookings: Booking[] = [];
export const initialPayments: Payment[] = [];
export const initialTransactions: Transaction[] = [];
export const initialReviews: Review[] = [];
export const initialMessages: Message[] = [];

export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-admin-ashabahebwa',
    type: 'system_alert',
    title: 'iSkillLink Operations Active',
    message: 'Welcome Ashabahebwa Hassan. Platform operations and verification queue initialized for Mbarara & Uganda.',
    link: '/admin-dashboard',
    is_read: false,
    created_at: '2026-03-01T08:00:00Z'
  }
];

export const initialAdminActions: AdminAction[] = [
  {
    id: 'act-1',
    admin_id: 'usr-admin-ashabahebwa',
    admin_name: 'Ashabahebwa Hassan',
    action_type: 'INITIALIZE_PLATFORM_OPERATIONS',
    target_entity: 'Platform',
    target_id: 'HQ-MBARARA',
    details: 'Founder Ashabahebwa Hassan initialized iSkillLink Uganda operations based in Mbarara City.',
    created_at: '2026-01-01T08:00:00Z'
  }
];
