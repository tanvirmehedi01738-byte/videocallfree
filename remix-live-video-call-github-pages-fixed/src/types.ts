export interface CallConfig {
  profileName: string;
  profileImage: string;
  adsterraLink: string;
  headerBannerCode?: string;
  socialBarCode?: string;
  popunderCode?: string;
  inFeedBannerCode?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_CALL_CONFIG: CallConfig = {
  profileName: 'Sophia Miller',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
  adsterraLink: 'https://www.profitablecpmrate.com/example-adsterra-direct-link',
  headerBannerCode: '',
  socialBarCode: '',
  popunderCode: '',
  inFeedBannerCode: '',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export const PRESET_FEMALE_PROFILES = [
  {
    name: 'Sophia Miller',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    title: 'Model & Influencer'
  },
  {
    name: 'Emma Watson',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=85',
    title: 'Content Creator'
  },
  {
    name: 'Jessica Lee',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85',
    title: 'Live Streamer'
  },
  {
    name: 'Chloe Davis',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=85',
    title: 'Fitness Coach'
  },
  {
    name: 'Mia Rodriguez',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=85',
    title: 'Digital Creator'
  }
];
