const { getGmailClient } = require("@/lib/utils/googleEmails");
const Buffer = require("buffer").Buffer;

function makeEmailBody(to, subject, message) {
  const emailLines = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    `Subject: ${subject}`,
    "",
    message,
  ];
  const email = emailLines.join("\n");
  const encodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return encodedEmail;
}

async function sendEmail(to, subject, message, userId) {
  const gmail = await getGmailClient(userId);
  const raw = makeEmailBody(to, subject, message);
  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  return {
    success: true,
    id: res.data.id,
    threadId: res.data.threadId,
    message: `Email sent to ${to}`,
  };
}

async function fetchEmailsByQuery(query, maxResults = 10, userId) {
  const gmail = await getGmailClient(userId);
  const res = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX", "CATEGORY_PERSONAL"],
    q: query,
    maxResults,
  });

  const emails = [];

  for (const msg of res.data.messages || []) {
    const fullMessage = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const snippet = fullMessage.data.snippet;
    const payload = fullMessage.data.payload;
    const headers = payload.headers || [];

    const subject =
      headers.find((h) => h.name === "Subject")?.value || "No Subject";
    const from = headers.find((h) => h.name === "From")?.value || "Unknown";
    const date = headers.find((h) => h.name === "Date")?.value || "Unknown";
    const link = `https://mail.google.com/mail/u/0/#inbox/${msg.id}`;

    emails.push({
      id: msg.id,
      snippet,
      subject,
      from,
      date,
      link,
    });
  }

  return {
    emails,
  };
}

async function getEmailById(id, userId) {
  const gmail = await getGmailClient(userId);
  const res = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });
  return {
    success: true,
    email: res.data,
  };
}

async function markEmailRead(id, userId) {
  const gmail = await getGmailClient(userId);
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { removeLabelIds: ["UNREAD"] },
  });
  return { success: true, message: ` Marked email ${id} as read` };
}

async function markEmailUnread(id, userId) {
  const gmail = await getGmailClient(userId);
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { addLabelIds: ["UNREAD"] },
  });
  return { success: true, message: `Marked email ${id} as unread` };
}

async function starEmail(id, userId) {
  const gmail = await getGmailClient(userId);
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { addLabelIds: ["STARRED"] },
  });
  return { success: true, message: `Starred email ${id}` };
}

async function deleteEmail(id, userId) {
  const gmail = await getGmailClient(userId);
  await gmail.users.messages.trash({
    userId: "me",
    id,
  });
  return { success: true, message: `Email ${id} moved to trash` };
}

function buildSearchQuery({ unread, from, subject, keyword, after, before }) {
  let q = "";
  if (unread) q += "is:unread ";
  if (from) q += `from:${from} `;
  if (subject) q += `subject:${subject} `;
  if (keyword) q += `${keyword} `;
  if (after) q += `after:${after} `;
  if (before) q += `before:${before} `;
  return q.trim();
}

async function addLabelToEmail(id, labelIds = [], userId) {
  const gmail = await getGmailClient(userId);
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { addLabelIds: labelIds },
  });
  return { success: true, message: `Labels ${labelIds} added to email ${id}` };
}

async function removeLabelFromEmail(id, labelIds = [], userId) {
  const gmail = await getGmailClient(userId);
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { removeLabelIds: labelIds },
  });
  return {
    success: true,
    message: `Labels ${labelIds} removed from email ${id}`,
  };
}

async function getThreadById(threadId, userId) {
  const gmail = await getGmailClient(userId);
  const res = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
  });
  return { success: true, thread: res.data };
}

async function batchModifyEmails(
  ids = [],
  { addLabelIds = [], removeLabelIds = [] },
  userId
) {
  const gmail = await getGmailClient(userId);
  await gmail.users.messages.batchModify({
    userId: "me",
    requestBody: { ids, addLabelIds, removeLabelIds },
  });
  return { success: true, message: `Batch modified ${ids.length} emails` };
}

function buildEmailDigest(emails) {
  return emails.map((e) => ({
    id: e.id,
    subject: e.subject,
    from: e.from,
    date: e.date,
    link: e.link,
    snippet: e.snippet.slice(0, 120) + "...",
  }));
}

function groupEmailsBySender(emails) {
  const groups = {};
  for (const e of emails) {
    if (!groups[e.from]) groups[e.from] = [];
    groups[e.from].push(e);
  }
  return groups;
}

module.exports = {
  sendEmail,
  fetchEmailsByQuery,
  getEmailById,
  markEmailRead,
  markEmailUnread,
  starEmail,
  deleteEmail,
  buildSearchQuery,
  addLabelToEmail,
  removeLabelFromEmail,
  getThreadById,
  batchModifyEmails,
  buildEmailDigest,
  groupEmailsBySender,
};