import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  GraduationCap,
  Film,
  HeartPulse,
  Receipt,
  Briefcase,
  Laptop,
  TrendingUp,
  MoreHorizontal,
  CircleDollarSign
} from 'lucide-react';
import { getCategoryMeta } from '../../data/categories';

const ICON_MAP = {
  Utensils,
  ShoppingBag,
  Car,
  GraduationCap,
  Film,
  HeartPulse,
  Receipt,
  Briefcase,
  Laptop,
  TrendingUp,
  MoreHorizontal,
  CircleDollarSign
};

export const CategoryIcon = ({ categoryId, size = 'md', className = '' }) => {
  const meta = getCategoryMeta(categoryId);
  const IconComponent = ICON_MAP[meta.icon] || MoreHorizontal;

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5 rounded-lg text-xs',
    md: 'w-10 h-10 p-2.5 rounded-xl text-sm',
    lg: 'w-12 h-12 p-3 rounded-2xl text-base'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{
        backgroundColor: meta.bgColor,
        color: meta.color
      }}
      title={meta.name}
    >
      <IconComponent className={iconSizes[size] || iconSizes.md} />
    </div>
  );
};

