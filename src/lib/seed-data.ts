import { dbRef, set, push, db } from "./firebase";

export const SEED_TASKS = [
  { title:"Fix APPTS tab filter in OperatorConsole", desc:"Appointment tokens showing under Walk-In tab. Check type field serialization.", owner:"musab", cat:"Bugfix", status:"progress", priority:"high", notes:"", due:"" },
  { title:"Fix CallNext performance regression", desc:"Was <1sec, now slow after routing/lane features. Profile appointment-due query.", owner:"musab", cat:"Bugfix", status:"progress", priority:"high", notes:"", due:"" },
  { title:"Fix audio sequencing (beep + TTS overlap)", desc:"Beep and TTS announcement play simultaneously. Beep first (~300ms), pause, then TTS.", owner:"musab", cat:"Bugfix", status:"progress", priority:"medium", notes:"", due:"" },
  { title:"Fix overflow suggestion logic", desc:"Currently suggests unrelated departments. Should suggest same-named dept at other facilities.", owner:"musab", cat:"Backend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"WhatsApp Business API notifications", desc:"Roadmap priority #1. Token status updates via WhatsApp Business API.", owner:"musab", cat:"Notifications", status:"todo", priority:"high", notes:"", due:"" },
  { title:"Customer rating after service completion", desc:"1-5 star rating shown on CustomerHub after token marked Completed.", owner:"musab", cat:"Frontend", status:"todo", priority:"high", notes:"", due:"" },
  { title:"QR Code on token", desc:"Scan QR to track token on any device. Redirect to CustomerHub live tracking page.", owner:"musab", cat:"Frontend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Audio announcements polish on DisplayBoard", desc:"Text-to-speech when token called, properly sequenced.", owner:"musab", cat:"Display", status:"progress", priority:"medium", notes:"", due:"" },
  { title:"Branded display board", desc:"Facility logo, colors, custom welcome message on DisplayBoard.", owner:"musab", cat:"Display", status:"progress", priority:"medium", notes:"WIP files: BrandingContext.tsx, FacilityBranding.tsx — verify and finish", due:"" },
  { title:"Callback tokens", desc:"Customer leaves, gets notified when turn is near.", owner:"musab", cat:"Core", status:"todo", priority:"high", notes:"", due:"" },
  { title:"Token recall", desc:"Re-call a previously skipped customer. Operator action in OperatorConsole.", owner:"musab", cat:"Core", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Token sharing (family member tracking)", desc:"Generate shareable link/QR for a token so family members can track status remotely.", owner:"musab", cat:"Frontend", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Queue routing rules", desc:"Auto-assign token to least busy counter. Phase 2 routing intelligence.", owner:"musab", cat:"Backend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Walk-in vs Pre-booked lanes", desc:"Separate queue streams per token type.", owner:"musab", cat:"Core", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Counter screen view", desc:"Dedicated full-screen view for counter operator.", owner:"musab", cat:"Display", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Multiple display zones", desc:"Waiting room screen vs counter screen vs entrance — different content per zone.", owner:"musab", cat:"Display", status:"todo", priority:"low", notes:"", due:"" },
  { title:"QR code on display board", desc:"Customers scan TV screen to instantly book a token.", owner:"musab", cat:"Display", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Multi-language support (Arabic, Urdu, English)", desc:"i18n for DiscoveryPage, CustomerHub, DisplayBoard.", owner:"musab", cat:"Frontend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Accessibility mode", desc:"Large text toggle, high contrast mode, screen reader support.", owner:"musab", cat:"Frontend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Verify QR Code feature on tokens", desc:"Yusha marked done in commit 04514f0 — verify it scans correctly after merge.", owner:"yusha", cat:"Frontend", status:"progress", priority:"high", notes:"Marked done in yusha branch — needs post-merge verification", due:"" },
  { title:"Finish branding & announcement feature", desc:"Reconcile Yusha's branding commit with Musab's WIP branding files.", owner:"yusha", cat:"Display", status:"progress", priority:"high", notes:"Potential overlap with Musab's WIP — coordinate before continuing", due:"" },
  { title:"Operating hours (auto open/close)", desc:"Queue auto-opens and auto-closes by schedule.", owner:"yusha", cat:"Backend", status:"todo", priority:"high", notes:"", due:"" },
  { title:"Holiday / closure calendar", desc:"Block specific dates from accepting tokens.", owner:"yusha", cat:"Backend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Break management", desc:"Pause counter with reason, auto-resume timer.", owner:"yusha", cat:"Backend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Department capacity limits", desc:"Max tokens per day per department. Auto-close intake when limit reached.", owner:"yusha", cat:"Backend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"SMS notifications (Twilio)", desc:"Twilio SMS on token status changes as fallback.", owner:"yusha", cat:"Notifications", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Daily queue summary analytics", desc:"Total tokens, avg wait, peak hours per day.", owner:"yusha", cat:"Analytics", status:"todo", priority:"high", notes:"", due:"" },
  { title:"Peak hours heatmap", desc:"Visual grid showing busiest times of day/week per department.", owner:"yusha", cat:"Analytics", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Operator performance dashboard", desc:"Tokens served, avg service time per operator.", owner:"yusha", cat:"Analytics", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Department throughput analytics", desc:"Tokens per hour, completion rate per department.", owner:"yusha", cat:"Analytics", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Subscription & billing (Stripe)", desc:"Real Stripe checkout for monthly plans.", owner:"yusha", cat:"Billing", status:"todo", priority:"high", notes:"", due:"" },
  { title:"Usage limits per plan tier", desc:"Max tokens/day, max counters, max users enforced per subscription tier.", owner:"yusha", cat:"Billing", status:"todo", priority:"high", notes:"", due:"" },
  { title:"Audit logs", desc:"Full record of who did what and when.", owner:"yusha", cat:"Backend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Export analytics to PDF / Excel", desc:"Download reports as PDF or XLSX.", owner:"yusha", cat:"Analytics", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Scheduled email reports", desc:"Auto-email daily/weekly summary to OrgAdmin.", owner:"yusha", cat:"Analytics", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Wait time trend analysis", desc:"Historical wait time trends over weeks/months.", owner:"yusha", cat:"Analytics", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Customer visit history", desc:"Logged-in customers can see past tokens and service records.", owner:"yusha", cat:"Frontend", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Public developer API + webhooks", desc:"Rate-limited external API for third-party integrations.", owner:"yusha", cat:"Backend", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"White-label branding per org", desc:"Each org can fully customize portal look.", owner:"yusha", cat:"Display", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Google Calendar sync", desc:"Appointment tokens sync with Google Calendar.", owner:"yusha", cat:"Backend", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Customer satisfaction scores", desc:"Avg ratings per department and operator shown in analytics.", owner:"yusha", cat:"Analytics", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Comparative reports", desc:"Compare performance across departments/branches.", owner:"yusha", cat:"Analytics", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Move secrets out of appsettings.json", desc:"JWT key, Gemini API key, Twilio credentials → environment variables.", owner:"shared", cat:"Security", status:"todo", priority:"high", notes:"Roadmap priority #6", due:"" },
  { title:"Production DB migration (SQLite → MySQL/Postgres)", desc:"Current SQLite is dev-only. Plan migration and EF Core provider swap.", owner:"shared", cat:"DevOps", status:"todo", priority:"high", notes:"", due:"" },
  { title:"Email verification + password reset", desc:"Check AuthController — likely missing. Needed for real customer onboarding.", owner:"shared", cat:"Security", status:"todo", priority:"high", notes:"", due:"" },
  { title:"Rate limiting on public APIs", desc:"Booking endpoints, login endpoints — prevent abuse/spam.", owner:"shared", cat:"Security", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"Production logging & monitoring setup", desc:"Structured logging (Serilog), error tracking, uptime monitoring before going live.", owner:"shared", cat:"DevOps", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"GDPR / data export & erasure tools", desc:"Customer can request data export or account deletion.", owner:"shared", cat:"Security", status:"todo", priority:"medium", notes:"", due:"" },
  { title:"SSO / SAML integration", desc:"Enterprise login via corporate identity providers (Okta, Azure AD).", owner:"shared", cat:"Security", status:"todo", priority:"low", notes:"", due:"" },
  { title:"EHR / HMS integration", desc:"Hospital management system patient data sync.", owner:"shared", cat:"Backend", status:"todo", priority:"low", notes:"", due:"" },
  { title:"CRM integration (Salesforce, HubSpot)", desc:"Customer data sync with major CRM platforms.", owner:"shared", cat:"Backend", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Custom domain per org", desc:"org.smartqueue.com or their own domain.", owner:"shared", cat:"DevOps", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Zapier / Make integration", desc:"No-code automation platform connectors.", owner:"shared", cat:"Backend", status:"todo", priority:"low", notes:"", due:"" },
  { title:"Clean up .kiro/specs and merge leftover WIP", desc:"Decide what's still relevant after bin/obj cleanup.", owner:"shared", cat:"DevOps", status:"todo", priority:"low", notes:"", due:"" },
];

export const SEED_DONE = [
  { title:"AI wait-time prediction (Gemini)", desc:"Gemini-2.5-flash powered wait prediction with mathematical fallback.", owner:"shared", cat:"Core", status:"done", priority:"high" },
  { title:"SignalR real-time queue updates", desc:"/queueHub broadcasts QueueUpdated, TokenCalled, WaitTimeUpdated.", owner:"shared", cat:"Core", status:"done", priority:"high" },
  { title:"Web Push + Twilio SMS notifications", desc:"VAPID web push and Twilio SMS via NotificationOrchestrator.", owner:"shared", cat:"Notifications", status:"done", priority:"high" },
  { title:"Priority tokens (VIP/Elderly/Disabled/Emergency)", desc:"PriorityLevel enum, CallNext orders by Priority DESC.", owner:"musab", cat:"Core", status:"done", priority:"high" },
  { title:"Appointment booking with time slots", desc:"AppointmentSlotsController, DiscoveryPage date/slot picker.", owner:"musab", cat:"Core", status:"done", priority:"high" },
  { title:"Operator performance metrics dashboard", desc:"/admin/analytics/operators with today/week/month ranges.", owner:"yusha", cat:"Analytics", status:"done", priority:"medium" },
  { title:"Shift management (auto open/close)", desc:"Shift entity + ShiftAutoSchedulerService.", owner:"yusha", cat:"Backend", status:"done", priority:"medium" },
  { title:"Queue overflow handling (basic)", desc:"OverflowThreshold returns suggestions when queue full.", owner:"musab", cat:"Backend", status:"done", priority:"medium" },
  { title:"Counter capacity limits", desc:"MaxConcurrentTokens, CallNext is capacity-aware.", owner:"yusha", cat:"Backend", status:"done", priority:"medium" },
  { title:"Queue routing (least-busy counter auto-assign)", desc:"SuggestedCounterId assigned on booking.", owner:"musab", cat:"Backend", status:"done", priority:"medium" },
  { title:"Lane mode selector (Auto/Walk-In/Appt)", desc:"OperatorConsole segmented control.", owner:"musab", cat:"Frontend", status:"done", priority:"medium" },
  { title:"OperatorConsole Material 3 redesign", desc:"Animated queue cards, live load balancing panel.", owner:"musab", cat:"Frontend", status:"done", priority:"medium" },
  { title:"150 tokens per counter demo seed data", desc:"8 facilities, 30+ departments, 35+ users.", owner:"shared", cat:"Core", status:"done", priority:"low" },
  { title:"Demo access terminal on login page", desc:"One-click credential cards for SuperAdmin/OrgAdmin/Operators.", owner:"shared", cat:"Frontend", status:"done", priority:"low" },
  { title:".gitignore + bin/obj cleanup", desc:"Removed build artifacts from git tracking.", owner:"shared", cat:"DevOps", status:"done", priority:"low" },
  { title:"Counter Online/Offline/Paused control", desc:"Operator controls counter status in real-time.", owner:"shared", cat:"Core", status:"done", priority:"medium" },
  { title:"Full organizational hierarchy", desc:"Facilities / Departments / Counters — full tree.", owner:"shared", cat:"Core", status:"done", priority:"high" },
  { title:"Role-based access control (JWT)", desc:"SuperAdmin / OrgAdmin / Operator roles via JWT claims.", owner:"shared", cat:"Security", status:"done", priority:"high" },
  { title:"Public Display Board (TV screen)", desc:"Full-screen board showing current token being served.", owner:"musab", cat:"Display", status:"done", priority:"high" },
  { title:"AI arrival recommendation", desc:"Geolocation + Gemini = ideal departure time recommendation.", owner:"musab", cat:"Core", status:"done", priority:"high" },
  { title:"Remote token booking via web portal", desc:"Book a token from anywhere — no physical kiosk required.", owner:"musab", cat:"Core", status:"done", priority:"high" },
  { title:"Real-time token tracking (CustomerHub)", desc:"Live status updates on CustomerHub page via SignalR.", owner:"musab", cat:"Frontend", status:"done", priority:"high" },
  { title:"REST API (internal)", desc:"Full API for all platform operations.", owner:"shared", cat:"Backend", status:"done", priority:"high" },
];

export async function seedIfEmpty() {
  const all = [...SEED_DONE, ...SEED_TASKS];
  const now = Date.now();
  for (let i = 0; i < all.length; i++) {
    const newRef = push(dbRef('tasks'));
    const key = newRef.key;
    
    let ownerStr = all[i].owner;
    ownerStr = ownerStr.charAt(0).toUpperCase() + ownerStr.slice(1);
    if (ownerStr === 'Shared') ownerStr = 'Shared';

    const createdAt = now - (all.length - i) * 1000;
    const isDone = (all[i] as any).status === 'done';
    const doneAt = isDone ? createdAt + 5000 : undefined;

    await set(dbRef(`tasks/${key}`), {
      ...all[i], 
      id: key, 
      owner: ownerStr,
      description: (all[i] as any).desc || '',
      category: (all[i] as any).cat || '',
      notes: (all[i] as any).notes || '',
      dueDate: (all[i] as any).due || null, 
      comments: [],
      pushedToGitHub: false,
      assignedBy: ownerStr,
      createdAt,
      doneAt,
      updatedAt: Date.now(),
    });
  }
}
