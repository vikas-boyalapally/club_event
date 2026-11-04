require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDatabase, mongoose } = require('../config/database');
const { Admin } = require('../models');

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 8 characters.');
  }
  try {
    await connectDatabase();
    await Admin.init();
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existing = await Admin.findOne({ email });
    if (existing) throw new Error(`An admin account already exists for ${email}.`);
    const admin = await Admin.create({
      fullName: ADMIN_NAME.trim(),
      email,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12)
    });
    console.log(`Admin account created: ${admin.email}`);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin().catch((error) => {
  console.error('Admin creation failed:', error.message);
  process.exitCode = 1;
});
