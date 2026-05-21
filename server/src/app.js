import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { sendOtpByPurpose, sendRegistrationOtp } from './email.js';

import prisma from './db.js';
import Connection from './models/Connection.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';
import { getDistance } from './utils.js';
import groupRoutes from './routes/groups.js';
import { verifyToken } from './middleware/auth.js';
import { uploadToR2 } from './r2.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Cloudinary Configuration ---
const cloudinaryMain = cloudinary;
const cloudinaryVerify = Object.create(cloudinary);

// --- Admin Configuration ---
const ADMIN_EMAILS = ['vikaschahar9664@gmail.com', 'vikaschahar9626@gmail.com', 'vikaschahar2669@gmail.com', 'admin@clique.com']; // Add your email here

// --- Helpers to map Enums & Data ---
const calculateAge = (dob) => {
  if (!dob) return 25;
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const formatHeight = (cm) => {
  if (!cm) return "";
  const realFeet = ((cm * 0.393700) / 12);
  const feet = Math.floor(realFeet);
  const inches = Math.round((realFeet - feet) * 12);
  return `${feet}'${inches}"`;
};

const mapIdentityMode = (mode) => ({
  'real-name': 'REAL_NAME',
  'pseudonym': 'PSEUDONYM',
  'temporary': 'TEMPORARY'
}[mode] || 'REAL_NAME');

const mapGender = (g) => ({
  'male': 'MALE',
  'female': 'FEMALE',
  'non-binary': 'NON_BINARY',
  'other': 'OTHER'
}[g] || 'OTHER');

const mapLifestyle = (val) => ({
  'never': 'NEVER',
  'sometimes': 'SOMETIMES',
  'often': 'OFTEN',
  'regularly': 'REGULARLY',
  'prefer-not-to-say': 'PREFER_NOT_TO_SAY'
}[val] || 'PREFER_NOT_TO_SAY');

const mapDrugFreq = (val) => ({
  'never': 'NEVER',
  'sometimes': 'SOMETIMES',
  'often': 'OFTEN',
  'prefer-not-to-say': 'PREFER_NOT_TO_SAY'
}[val] || 'PREFER_NOT_TO_SAY');

const mapRelationshipGoal = (val) => ({
  'life-partner': 'LIFE_PARTNER',
  'long-term': 'LONG_TERM',
  'long-term-open': 'LONG_TERM_OPEN_TO_SHORT',
  'short-term-open': 'SHORT_TERM_OPEN_TO_LONG',
  'figuring-out': 'FIGURING_OUT',
  'friendship': 'FRIENDSHIP',
  'casual': 'CASUAL',
  'prefer-not-to-say': 'PREFER_NOT_TO_SAY'
}[val] || 'FIGURING_OUT');

const mapPromptQuestion = (val) => {
  if (!val) return null;
  return val.trim();
};

// --- Cloudinary Config (Profile uploads) ---
cloudinaryMain.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ddzfw66fu',
  api_key: process.env.CLOUDINARY_API_KEY || '879761226298925',
  api_secret: process.env.CLOUDINARY_SECRET,
});

// --- Cloudinary Config (Verification uploads) ---
// Uses separate Cloudinary account if *_VERIFY vars are set.
if (process.env.CLOUDINARY_SECRET_VERIFY) {
  cloudinaryVerify.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_VERIFY,
    api_key: process.env.CLOUDINARY_API_KEY_VERIFY,
    api_secret: process.env.CLOUDINARY_SECRET_VERIFY,
  });
}

// --- Multer Config ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Security & Middleware ---
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://clique-social.vercel.app'
    ];
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
    }
    
    if (
      allowedOrigins.includes(cleanOrigin) ||
      /\.vercel\.app$/.test(cleanOrigin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again after an hour' }
});

// --- Email (OTP) Verification ---
const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const hashOtp = (code) => {
  const secret = process.env.OTP_SECRET || JWT_SECRET;
  return crypto.createHash('sha256').update(`${code}:${secret}`).digest('hex');
};

const normalizePurpose = (p) => {
  const v = (p || '').toString().toLowerCase();
  if (v === 'work') return 'work';
  if (v === 'other') return 'other';
  return 'college';
};

const generateOtp = () => (Math.floor(100000 + Math.random() * 900000)).toString();

// --- Signup Email OTP (pre-registration) ---
app.post('/api/auth/send-otp', emailLimiter, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    // Check if already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const code = generateOtp();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailVerification.create({
      data: { userId: null, purpose: 'registration', email, codeHash, expiresAt }
    });

    console.log(`🔑 [OTP Verification] Registration code for ${email} is: ${code}`);

    await sendRegistrationOtp(email, code);

    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) { next(error); }
});

app.post('/api/auth/verify-otp', emailLimiter, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const code = (req.body.code || '').toString().trim();

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const codeHash = hashOtp(code);
    const record = await prisma.emailVerification.findFirst({
      where: {
        userId: null,
        purpose: 'registration',
        email,
        codeHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Mark as consumed
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) { next(error); }
});

app.post('/api/verify/email/send', verifyToken, emailLimiter, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const purpose = normalizePurpose(req.body.purpose);
    const email = (req.body.email || '').toString().trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const code = generateOtp();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailVerification.create({
      data: { userId, purpose, email, codeHash, expiresAt }
    });

    console.log(`🔑 [OTP Verification] Affiliation code (${purpose}) for ${email} is: ${code}`);

    // Use Resend — dispatches beautiful HTML email based on purpose
    const result = await sendOtpByPurpose(email, code, purpose);
    if (result.error) {
      console.error('Resend error:', result.error);
      return res.status(500).json({ success: false, message: 'Failed to send email. Check RESEND_API_KEY.' });
    }

    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) { next(error); }
});

app.post('/api/verify/email/confirm', verifyToken, emailLimiter, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const purpose = normalizePurpose(req.body.purpose);
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const code = (req.body.code || '').toString().trim();

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const codeHash = hashOtp(code);
    const record = await prisma.emailVerification.findFirst({
      where: {
        userId,
        purpose,
        email,
        codeHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.emailVerification.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });

      const profile = await tx.userProfile.findUnique({ where: { userId } });
      if (!profile) throw Object.assign(new Error('User profile not found'), { status: 404 });

      if (purpose === 'college') {
        await tx.userProfile.update({
          where: { userId },
          data: {
            collegeEmail: email,
            isCollegeEmailVerified: true,
            isCollegeVerified: true,
          }
        });
      } else if (purpose === 'other') {
        await tx.userProfile.update({
          where: { userId },
          data: {
            otherAffiliationEmail: email,
            isOtherAffiliationVerified: true,
          }
        });
      } else {
        await tx.userProfile.update({
          where: { userId },
          data: {
            workEmail: email,
            isWorkEmailVerified: true,
            isWorkVerified: true,
          }
        });
      }
    });

    res.json({ success: true });
  } catch (error) { next(error); }
});

// --- Middleware: Protect Routes ---
// verifyToken is now imported from middleware/auth.js

const adminOnly = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    
    // Check either the DB role column OR the hardcoded email list for safety
    if (user?.isAdmin || user?.role === 'admin' || ADMIN_EMAILS.includes(user?.email)) {
      return next();
    }
    
    return res.status(403).json({ success: false, message: 'Admin access required' });
  } catch (error) { next(error); }
};

// --- Routes ---

app.get('/', (req, res) => {
  res.send("App is running");
});

// 1. Upload Route
app.post('/api/upload', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinaryMain.uploader.upload(dataURI, { 
      folder: "user_profiles",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
});

// 1b. R2 Upload Route (profile photos)
app.post('/api/upload/r2', verifyToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    // Resize buffer via Cloudinary's in-memory transform, or just upload raw to R2
    const url = await uploadToR2(req.file.buffer, req.file.mimetype, 'profiles');
    res.json({ success: true, url });
  } catch (error) {
    console.error('R2 Upload Error:', error.message);
    // Graceful fallback: if R2 isn't configured yet, fall back to Cloudinary
    if (error.message.includes('R2 credentials not configured')) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinaryMain.uploader.upload(dataURI, {
          folder: 'user_profiles',
          transformation: [{ width: 800, height: 800, crop: 'limit' }, { quality: 'auto' }]
        });
        return res.json({ success: true, url: result.secure_url, fallback: 'cloudinary' });
      } catch (cdnErr) {
        return res.status(500).json({ success: false, message: 'Upload failed' });
      }
    }
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
});

// 2. Auth Routes
app.post('/api/auth/signup', authLimiter, async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({ data: { email, password: hashedPassword, fullName } });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, token, user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, isProfileComplete: false } });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, token, user: { id: user.id, email: user.email, fullName: user.fullName, isProfileComplete: !!user.profile } });
  } catch (error) { next(error); }
});

app.post('/api/auth/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: name,
          password: await bcrypt.hash(googleId + JWT_SECRET, 10),
        },
        include: { profile: true }
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        isProfileComplete: !!user.profile 
      } 
    });
  } catch (error) { 
    console.error("Google Auth Error:", error);
    next(error); 
  }
});

// 3. User & Profile Routes
app.delete('/api/user/delete', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid User ID" });

    try {
      const userProfile = await prisma.userProfile.findUnique({ where: { userId }, select: { photos: true } });
      if (userProfile?.photos?.length > 0) {
        const publicIds = userProfile.photos.map(url => {
          const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
          return match ? match[1] : null;
        }).filter(id => id);
        if (publicIds.length > 0) await cloudinary.api.delete_resources(publicIds);
      }
    } catch (e) { console.error("Cloudinary cleanup failed", e.message); }

    await prisma.user.delete({ where: { id: userId } });
    res.clearCookie('token');
    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get('/api/profiles', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, preferences: true }
    });
    
    const maxDistance = currentUser?.preferences?.maxDistance || 50;
    const myLat = currentUser?.profile?.latitude;
    const myLon = currentUser?.profile?.longitude;

    // Fetch existing connections to exclude them from the dashboard
    // Exclude if I am the sender (I already liked them)
    // OR if we are matched (they are in my chat)
    const myConnections = await Connection.find({
      $or: [
        { senderId: userId },
        { receiverId: userId, status: 'matched' }
      ]
    });

    const excludedUserIds = myConnections.map(c => 
      c.senderId === userId ? c.receiverId : c.senderId
    );
    const excludedIdsArray = [...new Set([...excludedUserIds, userId])];

    const users = await prisma.user.findMany({
      where: { 
        id: { notIn: excludedIdsArray }, 
        profile: { isNot: null } 
      },
      include: { profile: true },
    });

    const mappedProfiles = users.map(u => {
      const p = u.profile;
      const prompts = [];
      if (p.prompt1Question && p.prompt1Answer) prompts.push({ question: p.prompt1Question.replace(/_/g, ' '), answer: p.prompt1Answer });
      if (p.prompt2Question && p.prompt2Answer) prompts.push({ question: p.prompt2Question.replace(/_/g, ' '), answer: p.prompt2Answer });
      if (p.prompt3Question && p.prompt3Answer) prompts.push({ question: p.prompt3Question.replace(/_/g, ' '), answer: p.prompt3Answer });

      const distance = getDistance(myLat, myLon, p.latitude, p.longitude);

      return {
        id: u.id.toString(),
        name: p.preferredName || u.fullName.split(' ')[0],
        age: calculateAge(p.dob),
        photos: p.photos.length > 0 ? p.photos : ["https://placehold.co/600x800?text=No+Photo"],
        location: { currentCity: p.city || p.location || "Unknown", hometown: p.hometown || "Unknown" },
        distance: distance !== Infinity ? Math.round(distance) : null,
        height: formatHeight(p.height),
        work: p.work || "",
        college: p.college || "",
        aboutMe: p.aboutMe || "",
        bio: p.bio || "",
        verificationStatus: { collegeVerified: p.isCollegeVerified, workVerified: p.isWorkVerified, personVerified: p.isPersonVerified, idVerified: p.isIdVerified },
        prompts,
        interests: p.interests || [],
        lifestyle: { drinking: p.drinking?.toLowerCase() || "", smoking: p.smoking?.toLowerCase() || "", drugs: p.drugs?.toLowerCase() || "", exercise: p.exercise?.toLowerCase() || "" },
        demographics: { ethnicity: p.ethnicity || "", children: p.children || "", familyPlan: p.familyPlan || "", religion: p.religion || "", sexuality: p.sexuality || "" },
        preferences: { goal: p.datingGoal?.replace(/_/g, ' ').toLowerCase() || "" }
      };
    });

    mappedProfiles.sort((a, b) => {
      const aDist = a.distance === null ? Infinity : a.distance;
      const bDist = b.distance === null ? Infinity : b.distance;
      
      const aIsWithin = aDist <= maxDistance;
      const bIsWithin = bDist <= maxDistance;
      
      if (aIsWithin && !bIsWithin) return -1;
      if (!aIsWithin && bIsWithin) return 1;
      
      return aDist - bDist;
    });

    res.json({ success: true, profiles: mappedProfiles.slice(0, 50) });
  } catch (error) { next(error); }
});

// Nearby map endpoint — returns lat/lng + minimal info for all users with location set
app.get('/api/profiles/nearby', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    const myLat = currentUser?.profile?.latitude;
    const myLon = currentUser?.profile?.longitude;

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        profile: {
          isNot: null,
          NOT: [{ latitude: null }, { longitude: null }]
        }
      },
      include: { profile: true },
      take: 200,
    });

    const nearby = users.map(u => {
      const p = u.profile;
      const distance = getDistance(myLat, myLon, p.latitude, p.longitude);
      return {
        id: u.id.toString(),
        name: p.preferredName || u.fullName.split(' ')[0],
        photo: p.photos?.[0] || null,
        latitude: p.latitude,
        longitude: p.longitude,
        city: p.city || p.location || '',
        age: calculateAge(p.dob),
        distance: distance !== Infinity ? Math.round(distance) : null,
      };
    }).filter(u => u.latitude && u.longitude);

    // Sort by distance ascending (nulls last)
    nearby.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    res.json({ success: true, users: nearby, myLocation: { lat: myLat, lon: myLon } });
  } catch (error) { next(error); }
});

app.post('/api/profile/complete', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const data = req.body;

    const parsedDob = new Date(data.dob);
    const parsedHeight = data.height ? parseInt(data.height) : null;
    const parsedMaxDistance = data.maxDistance ? parseInt(data.maxDistance) : 50;
    const parsedMinAge = data.ageRange?.min ? parseInt(data.ageRange.min) : 18;
    const parsedMaxAge = data.ageRange?.max ? parseInt(data.ageRange.max) : 100;

    await prisma.$transaction(async (tx) => {
      const existingProfile = await tx.userProfile.findUnique({ where: { userId } });

      let isCollegeVerified = existingProfile ? existingProfile.isCollegeVerified : false;
      let isWorkVerified = existingProfile ? existingProfile.isWorkVerified : false;
      let isPersonVerified = existingProfile ? existingProfile.isPersonVerified : false;

      // Invalidate verification tick if college/work name has been modified
      if (existingProfile) {
        if (existingProfile.college !== data.college) {
          isCollegeVerified = false;
        }
        if (existingProfile.work !== data.work) {
          isWorkVerified = false;
        }
      } else {
        isCollegeVerified = false;
        isWorkVerified = false;
        isPersonVerified = false;
      }

      await tx.userProfile.upsert({
        where: { userId },
        update: {
          preferredName: data.preferredName,
          dob: parsedDob,
          height: parsedHeight,
          hometown: data.hometown,
          location: data.location,
          city: data.city,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          ethnicity: data.ethnicity,
          religion: data.religion,
          sexuality: data.sexuality,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
          isCollegeVerified,
          isWorkVerified,
          isPersonVerified,
          work: data.work,
          college: data.college,
          children: data.children,
          familyPlan: data.familyPlan,
          photos: data.photos || [],
          aboutMe: data.aboutMe,
          bio: data.bio,
          drinking: mapLifestyle(data.drinking),
          smoking: mapLifestyle(data.smoking),
          drugs: mapDrugFreq(data.drugs),
          exercise: mapLifestyle(data.exercise),
          pets: data.pets || [],
          language: data.languages || [],
          datingGoal: mapRelationshipGoal(data.datingGoal),
          interests: data.interests || [],
          prompt1Question: mapPromptQuestion(data.prompts?.prompt1Question),
          prompt1Answer: data.prompts?.prompt1Answer,
          prompt2Question: mapPromptQuestion(data.prompts?.prompt2Question),
          prompt2Answer: data.prompts?.prompt2Answer,
          prompt3Question: mapPromptQuestion(data.prompts?.prompt3Question),
          prompt3Answer: data.prompts?.prompt3Answer,
        },
        create: {
          userId,
          preferredName: data.preferredName,
          dob: parsedDob,
          height: parsedHeight,
          hometown: data.hometown,
          location: data.location,
          city: data.city,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          ethnicity: data.ethnicity,
          religion: data.religion,
          sexuality: data.sexuality,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
          isCollegeVerified,
          isWorkVerified,
          isPersonVerified,
          work: data.work,
          college: data.college,
          children: data.children,
          familyPlan: data.familyPlan,
          photos: data.photos || [],
          aboutMe: data.aboutMe,
          bio: data.bio,
          drinking: mapLifestyle(data.drinking),
          smoking: mapLifestyle(data.smoking),
          drugs: mapDrugFreq(data.drugs),
          exercise: mapLifestyle(data.exercise),
          pets: data.pets || [],
          language: data.languages || [],
          datingGoal: mapRelationshipGoal(data.datingGoal),
          interests: data.interests || [],
          prompt1Question: mapPromptQuestion(data.prompts?.prompt1Question),
          prompt1Answer: data.prompts?.prompt1Answer,
          prompt2Question: mapPromptQuestion(data.prompts?.prompt2Question),
          prompt2Answer: data.prompts?.prompt2Answer,
          prompt3Question: mapPromptQuestion(data.prompts?.prompt3Question),
          prompt3Answer: data.prompts?.prompt3Answer,
        }
      });

      await tx.userPreference.upsert({
        where: { userId },
        update: {
          interestedInGender: data.interestedInGender || [],
          ageRangeMin: parseInt(data.ageRange?.min || 18),
          ageRangeMax: parseInt(data.ageRange?.max || 99),
          maxDistance: parseInt(data.maxDistance || 50),
        },
        create: {
          userId,
          interestedInGender: data.interestedInGender || [],
          ageRangeMin: parseInt(data.ageRange?.min || 18),
          ageRangeMax: parseInt(data.ageRange?.max || 99),
          maxDistance: parseInt(data.maxDistance || 50),
        }
      });
    });

    res.json({ success: true, message: "Profile completed successfully" });
  } catch (error) { next(error); }
});

app.get('/api/profile/me', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
});


// --- Connections & Chat Routes ---
app.post('/api/connections/like', verifyToken, async (req, res, next) => {
  try {
    const senderId = parseInt(req.user.userId);
    const { receiverId, likeType = 'DATING' } = req.body;
    
    // Check daily limit (10 likes per day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayLikesCount = await Connection.countDocuments({
      senderId,
      createdAt: { $gte: startOfDay }
    });

    if (todayLikesCount >= 10) {
      return res.status(429).json({ success: false, message: 'Daily limit of 10 likes reached. Come back tomorrow!' });
    }

    // Check if the receiver already liked the sender
    const existingConnection = await Connection.findOne({ senderId: receiverId, receiverId: senderId });
    
    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        // Mutual like -> Match!
        existingConnection.status = 'matched';
        await existingConnection.save();
        // Create a Chat room if it doesn't exist
        const existingChat = await Chat.findOne({
          participants: { $all: [senderId, receiverId], $size: 2 }
        });
        
        if (!existingChat) {
          const newChat = new Chat({ participants: [senderId, receiverId] });
          await newChat.save();
        }
        
        return res.json({ success: true, match: true, message: "It's a match!" });
      } else {
        return res.json({ success: true, message: "Already connected" });
      }
    }
    
    // Create new pending connection
    await Connection.findOneAndUpdate(
      { senderId, receiverId },
      { status: 'pending', likeType },
      { upsert: true, new: true }
    );
    res.json({ success: true, match: false, message: "Liked successfully" });
  } catch (error) { next(error); }
});

app.post('/api/connections/pass', verifyToken, async (req, res, next) => {
  try {
    const senderId = parseInt(req.user.userId);
    const { receiverId } = req.body;
    
    await Connection.findOneAndUpdate(
      { senderId, receiverId },
      { status: 'rejected' },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, message: "Passed" });
  } catch (error) { next(error); }
});

app.get('/api/connections/likes', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    // Find who liked the current user
    const likes = await Connection.find({ receiverId: userId, status: 'pending' });
    const senderIds = likes.map(l => l.senderId);
    
    if (senderIds.length === 0) {
      return res.json({ success: true, profiles: [] });
    }
    
    // Fetch profiles from Postgres
    const users = await prisma.user.findMany({
      where: { id: { in: senderIds }, profile: { isNot: null } },
      include: { profile: true }
    });
    
    const profiles = users.map(u => ({
        id: u.id.toString(),
        name: u.profile.preferredName || u.fullName.split(' ')[0],
        photos: u.profile.photos.length > 0 ? u.profile.photos : ["https://placehold.co/600x800?text=No+Photo"],
    }));
    
    res.json({ success: true, profiles });
  } catch (error) { next(error); }
});

app.get('/api/chats', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const chats = await Chat.find({ participants: userId }).populate('lastMessage');
    
    // Extract user IDs to fetch from Postgres
    const participantIds = new Set();
    chats.forEach(chat => {
      chat.participants.forEach(p => { if (p !== userId) participantIds.add(p); });
    });
    
    if (participantIds.size === 0) {
      return res.json({ success: true, chats: [] });
    }
    
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(participantIds) } },
      include: { profile: true }
    });
    
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = {
        id: u.id,
        name: u.profile?.preferredName || u.fullName.split(' ')[0],
        photo: u.profile?.photos?.[0] || "https://placehold.co/150x150?text=U"
      };
    });
    
    const formattedChats = chats.map(chat => {
      const otherParticipantId = chat.participants.find(p => p !== userId);
      return {
        _id: chat._id,
        user: userMap[otherParticipantId] || { name: 'Unknown User', photo: '' },
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt
      };
    });
    
    res.json({ success: true, chats: formattedChats });
  } catch (error) { next(error); }
});

app.get('/api/chats/:chatId/messages', verifyToken, async (req, res, next) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) { next(error); }
});

app.post('/api/chats/:chatId/messages', verifyToken, async (req, res, next) => {
  try {
    const senderId = parseInt(req.user.userId);
    const { text } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const message = new Message({
      chatId,
      senderId,
      text
    });
    await message.save();

    chat.lastMessage = message._id;
    await chat.save();

    res.json({ success: true, message });
  } catch (error) { next(error); }
});

app.get('/api/protected', verifyToken, (req, res, next) => {
  res.json({ success: true, message: `Welcome back, user ${req.user.userId}!` });
});

app.use('/api/groups', groupRoutes);

// --- Admin Routes ---
app.get('/api/admin/users', verifyToken, adminOnly, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, users });
  } catch (error) { next(error); }
});

app.post('/api/admin/verify/:userId', verifyToken, adminOnly, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const { isVerified, isPersonVerified, isIdVerified, isCollegeVerified, isWorkVerified } = req.body;
    
    // Check if profile exists
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ success: false, message: 'User profile not found' });

    const updateData = {};
    // Backward compatibility for general isVerified toggling face verification
    if (isVerified !== undefined) updateData.isPersonVerified = isVerified;

    if (isPersonVerified !== undefined) updateData.isPersonVerified = isPersonVerified;
    if (isIdVerified !== undefined) updateData.isIdVerified = isIdVerified;
    if (isCollegeVerified !== undefined) updateData.isCollegeVerified = isCollegeVerified;
    if (isWorkVerified !== undefined) updateData.isWorkVerified = isWorkVerified;

    await prisma.userProfile.update({
      where: { userId },
      data: updateData
    });
    
    res.json({ success: true });
  } catch (error) { next(error); }
});

app.get('/api/verify/status', verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const requests = await prisma.verificationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      isPersonVerified: profile?.isPersonVerified || false,
      isIdVerified: profile?.isIdVerified || false,
      isCollegeVerified: profile?.isCollegeVerified || false,
      isWorkVerified: profile?.isWorkVerified || false,
      college: profile?.college || null,
      work: profile?.work || null,
      requests: requests.map(r => ({
        id: r.id,
        method: r.verificationMethod,
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (error) { next(error); }
});

// --- Verification System (Hybrid) ---
app.post('/api/verify/request', verifyToken, upload.fields([{ name: 'selfie', maxCount: 1 }, { name: 'idCard', maxCount: 1 }]), async (req, res, next) => {
  try {
    const userId = parseInt(req.user.userId);
    const method = req.body?.method || 'id_document'; // face | govt_id | id_document | email

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Determine which Cloudinary to use for verification
    const uploader = process.env.CLOUDINARY_SECRET_VERIFY ? cloudinaryVerify : cloudinaryMain;

    // Helper to upload buffer to Cloudinary
    const uploadBuffer = async (fileBuffer, mimetype, folder) => {
      const b64 = Buffer.from(fileBuffer).toString('base64');
      const dataURI = `data:${mimetype};base64,${b64}`;
      return uploader.uploader.upload(dataURI, { 
        folder: folder,
        transformation: [
          { width: 1000, crop: "limit" },
          { quality: "auto:eco" },
          { fetch_format: "auto" }
        ]
      });
    };

    let selfieUrl = "";
    let idCardUrl = null;
    let affiliationEmail = null;

    // Retrieve previous request to reuse selfie if none uploaded
    const lastRequest = await prisma.verificationRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (req.files?.selfie?.[0]) {
      const selfieResult = await uploadBuffer(
        req.files.selfie[0].buffer,
        req.files.selfie[0].mimetype,
        "verification_selfies"
      );
      selfieUrl = selfieResult.secure_url;
    } else if (lastRequest?.selfieUrl) {
      selfieUrl = lastRequest.selfieUrl;
    } else {
      selfieUrl = "https://res.cloudinary.com/placeholder-selfie.png";
    }

    if (method === 'face') {
      if (!req.files?.selfie?.[0]) {
        return res.status(400).json({ success: false, message: "Selfie is required for face verification" });
      }
    } else if (method === 'govt_id') {
      if (!req.files?.idCard?.[0]) {
        return res.status(400).json({ success: false, message: "Govt ID document photo is required" });
      }
      const idResult = await uploadBuffer(
        req.files.idCard[0].buffer,
        req.files.idCard[0].mimetype,
        "verification_ids"
      );
      idCardUrl = idResult.secure_url;
    } else if (method === 'college_id') {
      if (!req.files?.idCard?.[0]) {
        return res.status(400).json({ success: false, message: "Student ID card photo is required" });
      }
      const idResult = await uploadBuffer(
        req.files.idCard[0].buffer,
        req.files.idCard[0].mimetype,
        "verification_ids"
      );
      idCardUrl = idResult.secure_url;
    } else if (method === 'id_document') {
      if (!req.files?.selfie?.[0]) {
        return res.status(400).json({ success: false, message: "Selfie is required" });
      }
      if (!req.files?.idCard?.[0]) {
        return res.status(400).json({ success: false, message: "Govt ID document photo is required" });
      }
      const idResult = await uploadBuffer(
        req.files.idCard[0].buffer,
        req.files.idCard[0].mimetype,
        "verification_ids"
      );
      idCardUrl = idResult.secure_url;
    } else if (method === 'email') {
      const profile = await prisma.userProfile.findUnique({ where: { userId } });
      if (!profile) {
        return res.status(400).json({ success: false, message: "Complete your profile before verifying" });
      }
      if (profile.isCollegeEmailVerified && profile.collegeEmail) {
        affiliationEmail = profile.collegeEmail;
      } else if (profile.isWorkEmailVerified && profile.workEmail) {
        affiliationEmail = profile.workEmail;
      } else if (profile.isOtherAffiliationVerified && profile.otherAffiliationEmail) {
        affiliationEmail = profile.otherAffiliationEmail;
      }
      if (!affiliationEmail) {
        return res.status(400).json({
          success: false,
          message: "Verify your email before submitting (email path)",
        });
      }
    }

    const requestPayload = {
      selfieUrl,
      idCardUrl,
      verificationMethod: method,
      affiliationEmail,
      fullName: user.fullName,
      email: user.email,
      status: 'pending',
    };

    // Keep it separate and clear
    await prisma.verificationRequest.create({
      data: {
        userId,
        ...requestPayload,
      }
    });

    res.json({ success: true, message: "Verification request submitted" });
  } catch (error) { next(error); }
});

app.get('/api/admin/verifications', verifyToken, adminOnly, async (req, res, next) => {
  try {
    const status = (req.query.status || 'pending').toString();
    const requests = await prisma.verificationRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, requests });
  } catch (error) { next(error); }
});

app.post('/api/admin/verifications/:id/resolve', verifyToken, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, faceVerified, idVerified } = req.body; // action: 'approve' | 'reject'

    const request = await prisma.verificationRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (action === 'approve') {
      const updateData = {};
      if (request.verificationMethod === 'face') {
        updateData.isPersonVerified = true;
      } else if (request.verificationMethod === 'govt_id') {
        updateData.isIdVerified = true;
      } else if (request.verificationMethod === 'college_id') {
        updateData.isCollegeVerified = true;
      } else if (request.verificationMethod === 'id_document') {
        updateData.isPersonVerified = !!faceVerified;
        updateData.isIdVerified = !!idVerified;
      }

      await prisma.userProfile.update({
        where: { userId: request.userId },
        data: updateData
      });
    }

    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        resolvedAt: new Date(),
        resolvedByAdminId: parseInt(req.user.userId),
        faceVerified: doFace,
        idVerified: doId,
      }
    });

    res.json({ success: true, message: `Verification ${action}ed` });
  } catch (error) { next(error); }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err);
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Something went wrong';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

export default app;