export const iapConfig = {
  apple: {
    password: process.env.APPLE_SHARED_SECRET,
  },
  google: {
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY,
  },
};
