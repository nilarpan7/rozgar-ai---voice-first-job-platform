
import { User, UserRole } from '../types';
import { StorageService } from './storage';

export const AuthService = {
  login: async (phone: string, role: UserRole): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let user = StorageService.findUserByPhone(phone);
    
    // Auto-register for demo purposes if user doesn't exist
    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        name: role === UserRole.EMPLOYER ? 'New Employer' : 'New Worker',
        phone,
        role,
        location: 'Patna, Bihar', // Default
        skills: [],
        companyName: role === UserRole.EMPLOYER ? 'My Business' : undefined
      };
      StorageService.saveUser(user);
    } else {
        // Update role if switching (for demo simplicity)
        if (user.role !== role) {
             throw new Error(`Phone number already registered as ${user.role}. Please use a different number.`);
        }
    }

    StorageService.setCurrentUser(user);
    return user;
  },

  logout: () => {
    StorageService.setCurrentUser(null);
  },

  getCurrentUser: (): User | null => {
    return StorageService.getCurrentUser();
  }
};
