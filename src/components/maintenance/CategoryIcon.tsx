import React from 'react';
import {
  BedDouble,
  Car,
  HeartPulse,
  Laptop,
  Repeat,
  Scissors,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { MaintenanceCategory } from '@/types/database';

export function CategoryIcon({
  category,
  className = 'h-4 w-4',
}: {
  category: MaintenanceCategory;
  className?: string;
}) {
  switch (category) {
    case 'PERSONAL_CARE':
      return <Scissors className={className} />;
    case 'LAUNDRY':
      return <BedDouble className={className} />;
    case 'CLEANING':
      return <Sparkles className={className} />;
    case 'VEHICLE':
      return <Car className={className} />;
    case 'TECH':
      return <Laptop className={className} />;
    case 'HEALTH':
      return <HeartPulse className={className} />;
    case 'SUBSCRIPTION':
      return <Repeat className={className} />;
    default:
      return <Wrench className={className} />;
  }
}
