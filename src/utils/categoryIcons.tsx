import React from 'react';
import {
  Briefcase, Scissors, Code, Smartphone, Utensils, Zap, Hammer, Wrench, Sprout, Camera, Palette,
  TrendingUp, Sparkles, Droplets, Car, MessageSquare, Music, Building2, Feather, Cpu
} from 'lucide-react';

// One icon per seeded category (see Category.icon_name); unknown names fall back to a briefcase.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors, Code, Smartphone, Utensils, Zap, Hammer, Wrench, Sprout, Camera, Palette,
  Briefcase, TrendingUp, Sparkles, Droplets, Car, MessageSquare, Music, Building2, Feather, Cpu
};

export const CategoryIcon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className = 'w-5 h-5' }) => {
  const Icon = CATEGORY_ICONS[iconName] || Briefcase;
  return <Icon className={className} />;
};
