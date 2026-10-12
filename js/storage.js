/**
 * FoodBridge - LocalStorage Management & Shared Data Layer
 * Handles mock data, persistence, status management, and statistics.
 */

const STORAGE_KEY = 'foodbridge_donations_v1';

// Sample Distribution Centers (Demo Centers)
const DISTRIBUTION_CENTERS = [
  {
    id: 'center-1',
    name: 'Seva Kendra Community Hub',
    address: 'Plot 42, Sector 4, Central Urban Colony (Near Metro Gate 2)',
    operatingHours: '09:30 AM - 10:30 PM',
    coordinator: 'Anjali Sharma',
    contact: '+91 98765 43210',
    capacityKg: 350,
    currentAvailableKg: 140,
    status: 'Active Distribution',
    statusBadge: 'badge-success',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=700&q=80',
    facilities: ['Refrigerated Cold Storage', 'Temperature Inspection Kit', 'Walk-in Kiosk']
  },
  {
    id: 'center-2',
    name: 'Annapurna Relief Center',
    address: 'Rainbow Shelter Complex, East Railway Station Junction',
    operatingHours: '10:00 AM - 11:00 PM',
    coordinator: 'Vikram Patel',
    contact: '+91 98234 56789',
    capacityKg: 500,
    currentAvailableKg: 210,
    status: 'Ready for Influx',
    statusBadge: 'badge-info',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=700&q=80',
    facilities: ['Rapid Pack Station', 'Warm Storage Insulators', 'Digital Availability Screen']
  },
  {
    id: 'center-3',
    name: 'Hope Care Urban Kitchen',
    address: 'Ambedkar Nagar Civic Center, Opp. Municipal High School',
    operatingHours: '11:00 AM - 09:30 PM',
    coordinator: 'Dr. Reena Sen',
    contact: '+91 97112 34567',
    capacityKg: 300,
    currentAvailableKg: 65,
    status: 'High Demand',
    statusBadge: 'badge-warning',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=700&q=80',
    facilities: ['Community Dining Area', 'Child Nutrition Corner', 'Bicycle Volunteer Fleet']
  }
];

// Realistic Pre-seeded Demo Donations
const INITIAL_DEMO_DONATIONS = [
  {
    id: 'FB-2026-1042',
    donorName: 'Chef Sanjeev Mehra',
    orgName: 'The Royal Heritage Banquet',
    phone: '9876501234',
    pickupLocation: 'Hall 3, Grand Ballroom, Ring Road Wing',
    foodItems: 'Veg Dum Biryani, Paneer Butter Masala, Fresh Rotis, Gulab Jamun',
    quantityKg: 38,
    peopleServed: 95,
    prepDateTime: '2026-10-12T15:30',
    photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    reason: 'Wedding',
    notes: 'Packed in food-grade foil containers. Kept heated in warm buffet trays until 4 PM.',
    status: 'Approved', // Already Approved -> Shows on Digital Board
    assignedCenterId: 'center-1',
    createdAt: '2026-10-12T16:10:00.000Z',
    approvedAt: '2026-10-12T16:25:00.000Z'
  },
  {
    id: 'FB-2026-1043',
    donorName: 'Priya Nambiar',
    orgName: 'Spice Route Hotel & Suites',
    phone: '9845012345',
    pickupLocation: 'Executive Kitchen, Level 1, Tech Boulevard',
    foodItems: 'Dal Makhani, Steamed Basmati Rice, Mixed Veg Pulao, Parathas',
    quantityKg: 24,
    peopleServed: 60,
    prepDateTime: '2026-10-12T16:00',
    photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    reason: 'Hotel Surplus',
    notes: 'Surplus buffet stock, immediately chilled to 4°C per food safety protocol.',
    status: 'Approved', // Already Approved -> Shows on Digital Board
    assignedCenterId: 'center-2',
    createdAt: '2026-10-12T16:30:00.000Z',
    approvedAt: '2026-10-12T16:45:00.000Z'
  },
  {
    id: 'FB-2026-1044',
    donorName: 'Kunal Deshmukh',
    orgName: 'Summit Corporate Caterers',
    phone: '9822019988',
    pickupLocation: 'Conference Pavilion B, Cyber City Block 4',
    foodItems: 'Assorted Sandwich Platters, Vegetable Wraps, Fruit Custard Bowls',
    quantityKg: 15,
    peopleServed: 40,
    prepDateTime: '2026-10-12T17:00',
    photoUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    reason: 'Event',
    notes: 'Corporate summit surplus. Individually wrapped, 100% vegetarian.',
    status: 'Pending', // Awaiting Admin Review
    assignedCenterId: null,
    createdAt: '2026-10-12T17:15:00.000Z',
    approvedAt: null
  },
  {
    id: 'FB-2026-1045',
    donorName: 'Harpreet Kaur',
    orgName: 'Golden Grain Community Hall',
    phone: '9811098765',
    pickupLocation: 'Langar / Kitchen Dock, Sector 18',
    foodItems: 'Kadhi Pakora, Jeera Rice, Whole Wheat Roti, Moong Dal Halwa',
    quantityKg: 30,
    peopleServed: 75,
    prepDateTime: '2026-10-12T17:30',
    photoUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    reason: 'Charity',
    notes: 'Freshly prepared evening batch surplus, high hygiene standards maintained.',
    status: 'Pending', // Awaiting Admin Review
    assignedCenterId: null,
    createdAt: '2026-10-12T17:45:00.000Z',
    approvedAt: null
  }
];

const Storage = {
  // Initialize storage with sample data if not present
  init() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DONATIONS));
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }
  },

  // Get all donations
  getAllDonations() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading donations:', e);
      return INITIAL_DEMO_DONATIONS;
    }
  },

  // Save new donation
  addDonation(donation) {
    const list = this.getAllDonations();
    const newEntry = {
      ...donation,
      id: donation.id || this.generateId(),
      status: 'Pending',
      assignedCenterId: null,
      createdAt: new Date().toISOString(),
      approvedAt: null
    };
    list.unshift(newEntry);
    this.saveAll(list);
    return newEntry;
  },

  // Update status (Approve / Reject)
  updateStatus(id, newStatus, centerId = null) {
    const list = this.getAllDonations();
    const index = list.findIndex(d => d.id === id);
    if (index !== -1) {
      list[index].status = newStatus;
      if (newStatus === 'Approved') {
        list[index].approvedAt = new Date().toISOString();
        list[index].assignedCenterId = centerId || list[index].assignedCenterId || 'center-1';
      } else {
        list[index].assignedCenterId = null;
      }
      this.saveAll(list);
      return list[index];
    }
    return null;
  },

  // Delete donation (for demo management)
  deleteDonation(id) {
    const list = this.getAllDonations().filter(d => d.id !== id);
    this.saveAll(list);
    return true;
  },

  // Save all to localStorage
  saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      // Dispatch custom event for cross-tab or in-page synchronization
      window.dispatchEvent(new CustomEvent('foodbridge_data_updated', { detail: { list } }));
    } catch (e) {
      console.error('Error saving donations to localStorage:', e);
    }
  },

  // Generate unique Donation ID: FB-2026-XXXX
  generateId() {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FB-2026-${random}`;
  },

  // Get metrics counts
  getStats() {
    const list = this.getAllDonations();
    const total = list.length;
    const pending = list.filter(d => d.status === 'Pending').length;
    const approved = list.filter(d => d.status === 'Approved').length;
    const rejected = list.filter(d => d.status === 'Rejected').length;
    const totalKg = list.reduce((sum, d) => sum + (Number(d.quantityKg) || 0), 0);
    const approvedKg = list
      .filter(d => d.status === 'Approved')
      .reduce((sum, d) => sum + (Number(d.quantityKg) || 0), 0);
    const totalPeopleFed = list
      .filter(d => d.status === 'Approved')
      .reduce((sum, d) => sum + (Number(d.peopleServed) || 0), 0);

    return { total, pending, approved, rejected, totalKg, approvedKg, totalPeopleFed };
  },

  // Get approved donations (for digital board)
  getApprovedDonations() {
    return this.getAllDonations().filter(d => d.status === 'Approved');
  },

  // Get distribution centers
  getCenters() {
    return DISTRIBUTION_CENTERS;
  },

  getCenterById(centerId) {
    return DISTRIBUTION_CENTERS.find(c => c.id === centerId) || DISTRIBUTION_CENTERS[0];
  },

  // Reset to initial demo data
  resetDemoData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DONATIONS));
      window.dispatchEvent(new CustomEvent('foodbridge_data_updated', { detail: { list: INITIAL_DEMO_DONATIONS } }));
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Initialize right away
Storage.init();
