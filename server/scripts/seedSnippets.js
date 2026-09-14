const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Snippet = require('../models/Snippet');
const User = require('../models/User');
const Result = require('../models/Result');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/typr_db';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    // Clear existing collections
    console.log('Clearing old snippets, users, and results...');
    await Snippet.deleteMany({});
    await User.deleteMany({});
    await Result.deleteMany({});

    // Read snippets JSON
    const snippetsFilePath = path.join(__dirname, '../../src/data/snippets.json');
    if (!fs.existsSync(snippetsFilePath)) {
      throw new Error(`Snippets file not found at ${snippetsFilePath}`);
    }

    const rawData = fs.readFileSync(snippetsFilePath, 'utf-8');
    const parsed = JSON.parse(rawData);

    const snippetsToInsert = [];

    if (parsed.languages) {
      for (const [lang, buckets] of Object.entries(parsed.languages)) {
        for (const [bucket, codes] of Object.entries(buckets)) {
          if (Array.isArray(codes)) {
            codes.forEach((code) => {
              if (typeof code === 'string' && code.trim().length > 0) {
                const words = code.trim().split(/\s+/).filter(Boolean).length;
                snippetsToInsert.push({
                  language: lang,
                  bucket: bucket,
                  code: code,
                  wordCount: words,
                  charCount: code.length
                });
              }
            });
          }
        }
      }
    }

    console.log(`Parsed ${snippetsToInsert.length} code snippets.`);
    await Snippet.insertMany(snippetsToInsert);
    console.log(`Successfully seeded ${snippetsToInsert.length} snippets into MongoDB!`);

    // Seed Demo Users for showcase & leaderboard
    console.log('Seeding initial demo users and benchmark test results...');
    const demoUsers = [
      { username: 'bhavishya', email: 'bhavishya@typr.dev', password: 'password123' },
      { username: 'alex_coder', email: 'alex@typr.dev', password: 'password123' },
      { username: 'sarah_dev', email: 'sarah@typr.dev', password: 'password123' },
      { username: 'kenji_ts', email: 'kenji@typr.dev', password: 'password123' },
      { username: 'priya_cs', email: 'priya@typr.dev', password: 'password123' }
    ];

    const createdUsers = [];
    for (const u of demoUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    // Seed benchmark results
    const sampleResults = [
      { user: createdUsers[0]._id, username: createdUsers[0].username, wpm: 118, rawWpm: 122, accuracy: 98, timeTaken: 25, language: 'python', mode: 'snippet', modeDetail: 'words30' },
      { user: createdUsers[1]._id, username: createdUsers[1].username, wpm: 104, rawWpm: 108, accuracy: 96, timeTaken: 30, language: 'javascript', mode: 'time', modeDetail: '30s' },
      { user: createdUsers[2]._id, username: createdUsers[2].username, wpm: 97, rawWpm: 100, accuracy: 99, timeTaken: 28, language: 'cpp', mode: 'words', modeDetail: '50 words' },
      { user: createdUsers[3]._id, username: createdUsers[3].username, wpm: 92, rawWpm: 95, accuracy: 95, timeTaken: 32, language: 'java', mode: 'snippet', modeDetail: 'words50' },
      { user: createdUsers[4]._id, username: createdUsers[4].username, wpm: 88, rawWpm: 91, accuracy: 97, timeTaken: 30, language: 'python', mode: 'time', modeDetail: '30s' },
      { user: createdUsers[0]._id, username: createdUsers[0].username, wpm: 112, rawWpm: 115, accuracy: 99, timeTaken: 26, language: 'javascript', mode: 'snippet', modeDetail: 'words50' },
      { user: createdUsers[0]._id, username: createdUsers[0].username, wpm: 109, rawWpm: 112, accuracy: 97, timeTaken: 30, language: 'python', mode: 'time', modeDetail: '30s' },
      { user: createdUsers[1]._id, username: createdUsers[1].username, wpm: 101, rawWpm: 104, accuracy: 95, timeTaken: 15, language: 'cpp', mode: 'time', modeDetail: '15s' }
    ];

    await Result.insertMany(sampleResults);
    console.log(`Seeded ${sampleResults.length} benchmark leaderboard results!`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
