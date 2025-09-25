export default function EmailsSection() {
  const emails = [
    { id: 1, subject: "Nykaa Sale Alert!", from: "nykaa.com" },
    { id: 2, subject: "Meeting Reminder", from: "office@work.com" },
    { id: 3, subject: "Project Update", from: "team@collab.com" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#690031]">Recent Emails</h2>
      <ul className="space-y-3">
        {emails.map((email) => (
          <li
            key={email.id}
            className="bg-white border p-4 rounded-xl shadow"
          >
            <p className="font-semibold">{email.subject}</p>
            <p className="text-sm text-gray-500">From: {email.from}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
