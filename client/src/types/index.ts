export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastLogin?: string;
}

export interface Charity {
  _id: string;
  name: string;
  description: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  website?: string;
  logo?: string;
  targetAmount: number;
  raisedAmount: number;
  isActive: boolean;
  registrationNumber: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  _id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  charityId: string | Charity;
  donationType: 'money' | 'food' | 'clothes' | 'books' | 'toys' | 'medicine' | 'other';
  amount: number;
  description: string;
  quantity: number;
  unit: string;
  isAnonymous: boolean;
  message?: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'online' | 'in_kind';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isPickupRequired: boolean;
  pickupDate?: string;
  pickupTime?: string;
  images?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodSlot {
  _id: string;
  charityId: string | Charity;
  title: string;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage';
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentBookings: number;
  availableSlots: number;
  servingLocation?: {
    name?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  requirements: string[];
  menu: Array<{
    itemName: string;
    description?: string;
    quantity?: number;
    unit?: string;
    isVegetarian: boolean;
    isVegan: boolean;
    allergens: string[];
  }>;
  donationGoal: number;
  raisedAmount: number;
  status: 'active' | 'completed' | 'cancelled' | 'postponed';
  isRecurring: boolean;
  recurringDays: string[];
  volunteers: Array<{
    name: string;
    email: string;
    phone?: string;
    role?: string;
  }>;
  specialInstructions?: string;
  images?: string[];
  bookings: Array<{
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    numberOfPeople: number;
    bookedAt: string;
    status: 'confirmed' | 'cancelled' | 'attended';
    specialRequests?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'donation' | 'food_slot' | 'general' | 'urgent' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: Array<{
    charityId: string;
    isRead: boolean;
    readAt?: string;
  }>;
  sender: string;
  relatedEntity?: {
    entityType: 'donation' | 'foodslot' | 'charity' | 'admin';
    entityId: string;
  };
  data?: any;
  isGlobal: boolean;
  scheduledFor: string;
  expiresAt?: string;
  isSent: boolean;
  sentAt?: string;
  deliveryMethod: string[];
  createdAt: string;
  updatedAt: string;
  isReadByCharity?: boolean;
  readAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data?: T[];
  currentPage: number;
  totalPages: number;
  total?: number;
  totalItems?: number;
}

export interface DashboardStats {
  overview: {
    totalCharities: number;
    totalDonations: number;
    totalFoodSlots: number;
    totalNotifications: number;
    activeFoodSlots: number;
    totalBookings: number;
    totalMonetaryAmount: number;
    monthlyMonetaryAmount: number;
  };
  distributions: {
    donationsByStatus: Array<{ _id: string; count: number }>;
    donationsByType: Array<{ _id: string; count: number }>;
  };
  topCharities: Array<{
    name: string;
    category: string;
    logo?: string;
    donationCount: number;
    totalAmount: number;
  }>;
  recentActivities: {
    donations: Donation[];
    foodSlots: FoodSlot[];
  };
  trends: {
    monthly: Array<{
      _id: { year: number; month: number };
      count: number;
      totalAmount: number;
    }>;
  };
}

export interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file' | 'date' | 'time';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface DropzoneFile extends File {
  preview?: string;
}

export const DONATION_TYPES = [
  { value: 'money', label: 'Money' },
  { value: 'food', label: 'Food' },
  { value: 'clothes', label: 'Clothes' },
  { value: 'books', label: 'Books' },
  { value: 'toys', label: 'Toys' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'other', label: 'Other' }
] as const;

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'beverage', label: 'Beverage' }
] as const;

export const CHARITY_CATEGORIES = [
  { value: 'Education', label: 'Education' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Poverty', label: 'Poverty' },
  { value: 'Animals', label: 'Animals' },
  { value: 'Disaster Relief', label: 'Disaster Relief' },
  { value: 'Food & Hunger', label: 'Food & Hunger' },
  { value: 'Human Rights', label: 'Human Rights' },
  { value: 'Arts & Culture', label: 'Arts & Culture' },
  { value: 'Other', label: 'Other' }
] as const;

export const DONATION_STATUS = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'info' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' }
] as const;

export const FOOD_SLOT_STATUS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'completed', label: 'Completed', color: 'primary' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' },
  { value: 'postponed', label: 'Postponed', color: 'warning' }
] as const;