import bcrypt from "bcryptjs";
import prisma from "../utils/prisma.js";
import { signToken } from "../utils/token.js";

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  company: user.company,
  address: user.address,
  phone: user.phone,
  createdAt: user.createdAt,
});

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists with this email" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashed },
    });

    const token = signToken(user);
    return res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error during signup" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
}

export async function getMe(req, res) {
  return res.json({ success: true, user: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  try {
    const { name, company, address, phone, avatarUrl } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = name;
    if (company !== undefined) data.company = company;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    return res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error updating profile" });
  }
}
