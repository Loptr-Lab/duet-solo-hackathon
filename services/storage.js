const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getPlayerProfile(userId = 'guest_default') {
  const filePath = path.join(DATA_DIR, `user_${userId}.json`);

  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error reading profile for ${userId}:`, err.message);
    }
  }

  const defaultPath = path.join(DATA_DIR, 'defaultProfile.json');
  if (fs.existsSync(defaultPath)) {
    try {
      const defaultData = fs.readFileSync(defaultPath, 'utf8');
      const profile = JSON.parse(defaultData);
      profile.userId = userId;
      profile.createdAt = new Date().toISOString();
      savePlayerProfile(userId, profile);
      return profile;
    } catch (err) {
      console.error('Error loading default profile template:', err.message);
    }
  }

  return null;
}

function savePlayerProfile(userId, profileData) {
  const filePath = path.join(DATA_DIR, `user_${userId}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error saving profile for ${userId}:`, err.message);
    return false;
  }
}

module.exports = {
  getPlayerProfile,
  savePlayerProfile
};
