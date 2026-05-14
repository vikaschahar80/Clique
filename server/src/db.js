import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dns from 'dns/promises';

// Get original connection string
const connectionString = process.env.DATABASE_URL;

// Parse the URL
const url = new URL(connectionString);
const hostname = url.hostname;

// Use Google's DNS to bypass local IPv6 resolver returning REFUSED
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8']);
const addresses = await resolver.resolve4(hostname);
const ip = addresses[0];

// Update the URL to use the IP address directly
url.hostname = ip;
url.search = ''; // Clear search params like sslmode=require to prevent overriding ssl config

const pool = new pg.Pool({
  connectionString: url.toString(),
  ssl: {
    servername: hostname, // Important: Neon requires SNI to match the endpoint ID
    rejectUnauthorized: false
  }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;