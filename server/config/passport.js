const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const memberModel = require('../models/Member');

const normalizeRow = (res) => {
  if (!res) return null;
  if (Array.isArray(res)) return res[0] || null;
  return res;
};

// Debug: Log credentials yang dibaca
console.log('🔑 Google OAuth Credentials:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'SET (' + process.env.GOOGLE_CLIENT_SECRET.substring(0, 15) + '...)' : 'NOT SET');
console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase().trim();
        
        // Cek apakah user sudah ada
        const existingMemberRes = await memberModel.findByEmail(email);
        const existingMember = normalizeRow(existingMemberRes);
        
        if (existingMember) {
          // User sudah ada, langsung login
          return done(null, existingMember);
        }
        
        // Buat user baru dari Google account
        const newMember = await memberModel.create({
          name: profile.displayName || profile.name.givenName + ' ' + profile.name.familyName,
          email: email,
          phone: '', // Akan diisi nanti
          address: '', // Akan diisi nanti
          password: null, // Google auth tidak perlu password
          google_id: profile.id,
          profile_picture: profile.photos[0]?.value || null
        });
        
        const created = normalizeRow(newMember) || newMember;
        return done(null, created);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const memberRes = await memberModel.findById(id);
    const member = normalizeRow(memberRes);
    done(null, member);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
