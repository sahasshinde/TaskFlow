"use server";

import { google } from "googleapis";
import { clerkClient } from "@clerk/nextjs/server";

export async function getGmailClient(userId) {
  const client = await clerkClient();
  const { data } = await client.users.getUserOauthAccessToken(userId, "google");

  const token = data[0]?.token;
  if (!token) throw new Error("Google Gmail not connected");

  // Initialize OAuth2 client
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  // Return Gmail client
  return google.gmail({ version: "v1", auth: oauth2Client });
}