"use server";
import { google } from "googleapis";
import { clerkClient } from "@clerk/nextjs/server";

export async function getCalendarClient(userId) {
  const client = await clerkClient();
  const { data } = await client.users.getUserOauthAccessToken(userId, "google");
  const token = data[0]?.token;

  if (!token) throw new Error("Google Calendar not connected");

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  return google.calendar({ version: "v3", auth: oauth2Client });
}