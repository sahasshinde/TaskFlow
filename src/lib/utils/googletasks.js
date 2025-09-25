"use server";

import { google } from "googleapis";
import { clerkClient } from "@clerk/nextjs/server";

export async function getTasksClient(userId) {
  // Fetch the Clerk instance for the signed-in user
  const client = await clerkClient();
  const { data } = await client.users.getUserOauthAccessToken(
    userId,
    "oauth_google" // same provider ID used when enabling Google OAuth in Clerk
  );

  const token = data[0]?.token;
  if (!token) throw new Error("Google Tasks not connected");

  // Initialize Google OAuth2 client
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  // Return a Google Tasks client instance
  return google.tasks({ version: "v1", auth: oauth2Client });
}