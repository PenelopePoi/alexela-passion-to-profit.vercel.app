# ANTI-FRAUD PLAYBOOK
**XELA Creative Studio | Guardian AI / FileFlex | Personal Protection**
Last updated: 2026-04-04

---

## 1. XELA STUDIO — Business Fraud Prevention

### Stripe & Payment Fraud
- [ ] Enable Stripe Radar (fraud detection) — Settings > Fraud Protection
- [ ] Set Stripe rules: block cards from high-risk countries unless client is known
- [ ] Require CVC and ZIP match on all charges
- [ ] Enable 3D Secure for transactions over $200
- [ ] Set up Stripe webhook for `charge.dispute.created` — auto-notify on chargeback
- [ ] Keep signed contracts + delivery proof for every project (screenshot of delivered assets + email confirmation)
- [ ] Respond to chargebacks within 7 days with: contract PDF, delivery proof, client communications, IP logs
- [ ] Never refund AND accept a chargeback — pick one

### Client Impersonation Prevention
- [ ] Verify new clients via video call before starting work over $500
- [ ] Send invoices only to verified email addresses (not ones clients text you)
- [ ] Use a client portal (Firebase-authenticated) for deliverable handoff — never email final files to unverified addresses
- [ ] Add watermarks to all preview deliverables; remove only on final payment
- [ ] Require payment before delivering unwatermarked source files

### Invoice & Payment Fraud
- [ ] Use Stripe Invoicing or QuickBooks — never send invoices from personal email
- [ ] Include your Florida LLC EIN (not SSN) on all invoices
- [ ] Lock invoice templates so line items/totals cannot be edited by recipients
- [ ] Watch for fake "payment confirmation" emails — always verify in Stripe dashboard directly
- [ ] Never change wire/ACH details based on an email request without phone verification

### Domain & Online Presence
- [ ] Enable registrar lock on all domains (GoDaddy/Namecheap/Cloudflare)
- [ ] Enable 2FA on domain registrar account
- [ ] Set up domain auto-renew with backup payment method
- [ ] Monitor WHOIS changes — use domaintools.com or whoismind.com alerts
- [ ] Register common typosquat variants of your domain (xelastudio, xela-studio, etc.)
- [ ] Set Google Alerts for "XELA Creative" and your business name

### Email Authentication
- [ ] Add SPF record to DNS: `v=spf1 include:_spf.google.com ~all`
- [ ] Enable DKIM signing in Google Workspace (Admin > Apps > Gmail > Authenticate email)
- [ ] Add DMARC record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100`
- [ ] Test all three at [mxtoolbox.com/emailhealth](https://mxtoolbox.com/emailhealth)
- [ ] Review DMARC aggregate reports monthly

### Florida LLC / SOS Monitoring
- [ ] Check Florida SunBiz (sunbiz.org) quarterly — confirm your LLC is active, registered agent is correct, no unauthorized amendments
- [ ] Set up SunBiz email alerts for your entity
- [ ] File your annual report on time (due by May 1 every year) — late filing = administrative dissolution
- [ ] Monitor for fraudulent UCC filings against your LLC at floridaucc.com
- [ ] Keep certified copies of Articles of Organization, Operating Agreement, and EIN letter in a fireproof safe AND cloud backup

### Vendor / Contractor Verification
- [ ] Collect W-9 from every contractor before first payment
- [ ] Verify contractor identity: match W-9 name to government ID
- [ ] Never pay contractors via Zelle/Venmo for amounts over $600 — use ACH or check for paper trail
- [ ] Review contractor access to Firebase/GitHub/Stripe quarterly — revoke immediately on project end

---

## 2. XELA STUDIO — App Security

### Firebase Rules Audit
- [ ] Open `firestore.rules` — verify NO rule says `allow read, write: if true`
- [ ] Every collection must have explicit read/write conditions tied to `request.auth != null`
- [ ] User documents: `allow read, write: if request.auth.uid == resource.data.userId`
- [ ] Admin routes: `allow write: if request.auth.token.admin == true`
- [ ] Run `firebase emulators:start` and test rules with the Rules Playground
- [ ] Check Firebase Storage rules — no public write access
- [ ] Audit Firebase Authentication providers — disable any you don't use (anonymous, phone, etc.)
- [ ] Enable Firebase App Check to block non-app traffic
- [ ] Review Firebase usage dashboard weekly for anomalous reads/writes

### API Key Exposure (CRITICAL)
- [ ] **VITE_API_KEY (Gemini) is exposed client-side** — this is visible in browser DevTools
- [ ] Restrict the Gemini API key in Google Cloud Console:
  - Go to APIs & Services > Credentials
  - Click on the key > Application restrictions > HTTP referrers
  - Add only your production domain(s)
  - Under API restrictions, restrict to only "Generative Language API"
- [ ] Set a daily quota on Gemini API usage in Google Cloud Console (Budget & Alerts)
- [ ] Consider moving Gemini calls to a Firebase Cloud Function so the key never reaches the client
- [ ] Rotate the API key now if it has ever been committed to a public repo
- [ ] Add `.env` and `.env.local` to `.gitignore` — verify with `git ls-files .env` (should return nothing)
- [ ] Scan git history for leaked keys: `git log --all -p | grep -i "VITE_API_KEY"` — if found, rotate key immediately

### PII Handling
- [ ] Audit what user data is stored in Firestore — map every field that contains PII
- [ ] Never store full credit card numbers, SSNs, or government IDs in Firestore
- [ ] If collecting email/phone for branding projects, document retention policy (delete after X days)
- [ ] Add a privacy policy page to the app referencing Florida's data breach notification statute (§501.171)

### Session & Auth Security
- [ ] Verify `sessionStorage` is used (not `localStorage`) for auth tokens — tokens clear on tab close
- [ ] Set Firebase Auth session duration to minimum needed (default is 1 hour — acceptable)
- [ ] Implement auto-logout after 30 minutes of inactivity for admin panel
- [ ] Never store auth tokens in cookies without `Secure`, `HttpOnly`, and `SameSite=Strict` flags

### XSS Prevention in Brand Content
- [ ] All user-submitted brand names, taglines, and descriptions must be sanitized before rendering
- [ ] Use React's built-in JSX escaping — never use `dangerouslySetInnerHTML` with user content
- [ ] Audit all instances of `dangerouslySetInnerHTML` in the codebase: `grep -r "dangerouslySetInnerHTML" src/`
- [ ] If rendering user-provided SVGs or HTML for branding, use DOMPurify: `DOMPurify.sanitize(userContent)`
- [ ] Set Content-Security-Policy header: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`

### Rate Limiting
- [ ] Add rate limiting to Firebase Cloud Functions (if used): max 10 requests/minute per user for AI generation
- [ ] Implement client-side throttle on "Generate" button (disable for 5 seconds after click)
- [ ] Set Firestore security rules to limit document creation rate per user
- [ ] Monitor Firebase usage dashboard for cost spikes — set budget alerts at $10, $25, $50

### File Upload Validation
- [ ] Restrict upload file types: only allow `.png`, `.jpg`, `.jpeg`, `.svg`, `.pdf`
- [ ] Validate MIME type server-side (not just file extension)
- [ ] Set max file size: 10MB for images, 25MB for PDFs
- [ ] Scan filenames for path traversal: reject any filename containing `..`, `/`, or `\`
- [ ] Store uploads in Firebase Storage with randomized filenames (UUID), not user-provided names

---

## 3. GUARDIAN AI / FILEFLEX — Banking Engagement Security

### SOC 2 / GLBA Compliance
- [ ] Document all data flows between FileFlex, Guardian AI, and credit union systems
- [ ] Maintain a data inventory: what data you receive, process, store, and return
- [ ] Ensure all data in transit uses TLS 1.2+ (verify with SSL Labs test)
- [ ] Ensure all data at rest is encrypted (AES-256 or equivalent)
- [ ] Document your SOC 2 Type II readiness — even if not yet audited, follow the Trust Services Criteria
- [ ] Under GLBA Safeguards Rule: maintain a written information security plan (WISP)
- [ ] Conduct annual risk assessment and document findings
- [ ] Keep compliance documentation in a dedicated encrypted folder, backed up offsite

### Data Segregation
- [ ] Client (credit union) data must be in its own Firebase project — never co-mingle with XELA Studio
- [ ] Use separate GCP projects for each banking client
- [ ] Implement row-level security or tenant ID on every database record
- [ ] No shared service accounts between XELA Studio and Guardian AI environments
- [ ] Verify network isolation: banking workloads should not share VPC with creative studio workloads

### Audit Trails for AI Decisions
- [ ] Log every AI inference: timestamp, input hash (not raw PII), model version, output, confidence score
- [ ] Store audit logs in append-only storage (Cloud Logging with locked retention)
- [ ] Set log retention to minimum 7 years (banking regulatory requirement)
- [ ] Tag every AI decision with a unique trace ID for regulatory inquiries
- [ ] Build a simple admin dashboard to query audit logs by date, user, or decision type
- [ ] Document model version history — when models were updated, what changed, why

### PII Tokenization
- [ ] Never pass raw PII (SSN, account numbers, DOB) to AI models
- [ ] Implement tokenization layer: replace PII with reversible tokens before AI processing
- [ ] Use a dedicated tokenization service (e.g., VGS, Basis Theory, or custom Cloud KMS solution)
- [ ] Store the token-to-PII mapping in a separate, access-restricted database
- [ ] Audit who has access to the detokenization service — limit to 2 people maximum

### Breach Notification (72-Hour Rule)
- [ ] Know your obligations: GLBA requires notification to regulators within 72 hours of discovery
- [ ] Florida statute §501.171 requires notification to individuals within 30 days
- [ ] Pre-draft breach notification templates (regulator version + customer version)
- [ ] Maintain an up-to-date contact list: client CISO, legal counsel, insurance broker, FBI field office
- [ ] Keep breach response runbook printed (not just digital) — accessible if systems are compromised
- [ ] Test breach response process quarterly with tabletop exercises

### Compute Cap Enforcement ($1K/month)
- [ ] Set GCP budget alert at $500 (50%), $800 (80%), $950 (95%), $1,000 (hard stop)
- [ ] Configure GCP billing to auto-disable billing account at $1,000 (Budget > Actions > Disable billing)
- [ ] Set per-API quotas: Gemini API calls, Cloud Functions invocations, Firestore reads
- [ ] Review GCP billing dashboard weekly — look for unexpected spikes
- [ ] Set up PagerDuty/email alert for any single-day spend exceeding $50
- [ ] Document in the client contract: compute cap is $1K/mo, overages require written approval

---

## 4. PERSONAL PROTECTION — Owner Identity & Accounts

### Credit Freezes (DO ALL OF THESE)
- [ ] **Equifax**: Freeze at equifax.com/personal/credit-report-services/credit-freeze/ or call **888-766-0008**
- [ ] **Experian**: Freeze at experian.com/freeze/ or call **888-397-3742**
- [ ] **TransUnion**: Freeze at transunion.com/credit-freeze or call **800-680-7289**
- [ ] **Innovis**: Freeze at innovis.com/personal/securityFreeze or call **800-540-2505**
- [ ] **ChexSystems**: Freeze at chexsystems.com/security-freeze or call **800-887-7652**
- [ ] **NCTUE** (National Consumer Telecom & Utilities Exchange): Freeze at nctue.com or call **866-349-5355**
- [ ] Store all freeze PINs in your password manager AND printed in your fireproof safe
- [ ] Test freezes by running a soft pull on yourself (Credit Karma or similar) — should show frozen

### IRS Identity Protection
- [ ] Get an IRS IP PIN at irs.gov/identity-theft-fraud-scams/get-an-identity-protection-pin — call **800-908-4490** if issues
- [ ] Renew IP PIN annually (new one issued each January)
- [ ] File taxes as early as possible each year to beat fraudulent filers
- [ ] Create an IRS Online Account at irs.gov/account to monitor transcripts
- [ ] Opt out of IRS third-party data sharing

### USPS & Mail Security
- [ ] Enroll in USPS Informed Delivery at informeddelivery.usps.com — get daily scans of incoming mail
- [ ] Review Informed Delivery daily — flag any mail you didn't expect or that doesn't arrive
- [ ] Use a PO Box or UPS Store mailbox for business correspondence (not home address)
- [ ] Opt out of pre-approved credit offers: optoutprescreen.com or call **888-567-8688**

### Social Security Administration
- [ ] Create a my Social Security account at ssa.gov/myaccount
- [ ] Enable "Block Electronic Access" to prevent anyone from changing your info online or by phone
- [ ] Review your earnings statement annually — unexplained earnings = someone using your SSN
- [ ] Set up direct deposit to your verified bank account (prevents rerouting)

### SIM Swap Protection
- [ ] Call your carrier and add a SIM swap PIN/passcode:
  - **T-Mobile**: Call 611 or 800-937-8997, ask for Account Takeover Protection
  - **AT&T**: Call 611 or 800-331-0500, ask for Extra Security passcode
  - **Verizon**: Call 611 or 800-922-0204, set up Number Lock in My Verizon app
- [ ] Move critical 2FA to authenticator app (not SMS) — Authy, Google Authenticator, or YubiKey
- [ ] Port freeze: ask carrier to add a port-out freeze so your number can't be transferred
- [ ] Set up a Google Voice number as backup for accounts that require phone verification

### Dark Web Monitoring
- [ ] Enable Google Dark Web Report (included with Google One or free for Gmail users)
- [ ] Check haveibeenpwned.com — enter all your email addresses
- [ ] Set up Firefox Monitor alerts at monitor.firefox.com
- [ ] Consider paid monitoring: Aura, IdentityForce, or LifeLock (pick one)
- [ ] Check breach results quarterly and change any compromised passwords immediately

### Bank & Financial Alerts
- [ ] Set up transaction alerts for ALL amounts on all bank accounts (not just large ones)
- [ ] Enable real-time push notifications for credit card transactions
- [ ] Set up login alerts for all bank/brokerage accounts
- [ ] Review bank statements line-by-line monthly — dispute anything unrecognized within 60 days
- [ ] Enable Zelle/Venmo/CashApp notifications for all activity

### Google Account Security
- [ ] Enable Google Advanced Protection Program (requires 2 security keys)
- [ ] Review google.com/security — resolve all warnings
- [ ] Check google.com/permissions — revoke access for unused third-party apps
- [ ] Review recent activity at myactivity.google.com — look for devices/locations you don't recognize
- [ ] Verify recovery email and phone are current and secure
- [ ] Disable "Less secure app access" if still enabled

### Apple Account Security
- [ ] Enable 2FA on Apple ID at appleid.apple.com
- [ ] Review trusted devices — remove any you no longer own
- [ ] Enable Advanced Data Protection for iCloud (Settings > Apple ID > iCloud > Advanced Data Protection)
- [ ] Set up a Recovery Key and store it in your fireproof safe
- [ ] Review app-specific passwords — revoke any you don't recognize

### Password Manager Audit
- [ ] Use 1Password, Bitwarden, or Dashlane — not browser-saved passwords
- [ ] **DELETE `~/Documents/Chrome Passwords.csv` IMMEDIATELY** — this is a plaintext export of all your passwords sitting unencrypted on disk:
  ```bash
  # Verify the file exists, then securely delete it:
  ls -la ~/Documents/Chrome\ Passwords.csv
  rm -P ~/Documents/Chrome\ Passwords.csv   # -P flag overwrites before delete on macOS
  ```
- [ ] After deleting, empty Trash (the file may still be in Trash)
- [ ] Change every password that was in that CSV — assume they are all compromised
- [ ] Disable Chrome password saving: Chrome > Settings > Passwords > "Offer to save passwords" OFF
- [ ] Import passwords into a proper password manager first if you haven't already
- [ ] Generate unique 20+ character passwords for every account
- [ ] Enable the password manager's breach monitoring feature

### Two-Factor Authentication Audit
- [ ] List every account that supports 2FA — enable it on ALL of them
- [ ] Priority accounts (must have 2FA NOW): email, bank, domain registrar, Stripe, Firebase/GCP, GitHub
- [ ] Prefer hardware keys (YubiKey) > authenticator apps > SMS (in that order)
- [ ] Store 2FA backup/recovery codes in password manager AND printed in fireproof safe
- [ ] Never use the same phone number for 2FA and account recovery

### Physical Document Security
- [ ] Store in fireproof safe: passport, SSN card, birth certificate, LLC docs, freeze PINs, 2FA recovery codes
- [ ] Shred (cross-cut) all financial documents before discarding
- [ ] Never carry your SSN card in your wallet
- [ ] Keep digital scans of critical documents in an encrypted cloud vault (1Password, Cryptomator, or Veracrypt)

---

## 5. DETECTION & MONITORING SCHEDULE

### Daily (5 minutes)
- [ ] Review USPS Informed Delivery email
- [ ] Check bank/credit card push notifications — anything unexpected?
- [ ] Glance at Firebase usage dashboard (Firestore reads, function invocations)
- [ ] Check GCP billing for Guardian AI spend

### Weekly (15 minutes)
- [ ] Review Stripe dashboard: new disputes, failed charges, unusual refund requests
- [ ] Review Firebase Authentication: new user signups — any suspicious patterns?
- [ ] Review GCP billing breakdown by service for Guardian AI
- [ ] Check Google Security dashboard for account alerts
- [ ] Review DMARC reports for email spoofing attempts

### Monthly (30 minutes)
- [ ] Review all bank and credit card statements line-by-line
- [ ] Run `firebase security-rules:test` against current Firestore rules
- [ ] Audit Firebase/GCP IAM: who has access? Remove anyone who shouldn't
- [ ] Check Credit Karma or similar for new accounts/inquiries (even with freeze, monitor)
- [ ] Review contractor/vendor access lists — revoke expired access
- [ ] Check Florida SunBiz for any changes to your LLC filing
- [ ] Review password manager breach alerts

### Quarterly (1 hour)
- [ ] Full password rotation for critical accounts (email, bank, GCP, Stripe)
- [ ] Test credit freezes — attempt a soft pull, confirm they block
- [ ] Review and update this playbook
- [ ] Conduct Guardian AI tabletop breach exercise
- [ ] Audit all API keys: rotate any that are older than 90 days
- [ ] Review IRS online account for unexpected filings
- [ ] Check SSA earnings statement for unauthorized employment
- [ ] Run `git log --all -p | grep -iE "(key|secret|password|token)"` on all repos to check for leaked secrets
- [ ] Review insurance coverage (cyber liability, E&O) — adequate for current contracts?

---

## 6. INCIDENT RESPONSE

### IMMEDIATE (First Hour)

**If you suspect any account compromise:**
1. [ ] Change password on the compromised account from a DIFFERENT device
2. [ ] Revoke all active sessions (most services have "Sign out all devices")
3. [ ] Enable 2FA if not already on
4. [ ] Check if the attacker changed recovery email/phone — revert immediately
5. [ ] Screenshot everything — timestamps, unauthorized transactions, changed settings
6. [ ] Do NOT shut down or wipe any compromised device — preserve forensic evidence

**If financial fraud is detected:**
1. [ ] Call your bank immediately — request a freeze on affected accounts
2. [ ] Call Stripe support: **888-926-2289** — report unauthorized activity
3. [ ] File a dispute for every unauthorized transaction (you have 60 days for credit cards under Reg Z)

**If identity theft is detected:**
1. [ ] File a report at IdentityTheft.gov (FTC) — this generates a recovery plan
2. [ ] File a police report with local law enforcement (get the report number)
3. [ ] Place fraud alerts at all three bureaus (only need to call one, they notify the others):
   - **Equifax**: 888-766-0008
   - **Experian**: 888-397-3742
   - **TransUnion**: 800-680-7289

**If a data breach affects Guardian AI / banking data:**
1. [ ] Isolate affected systems immediately: `gcloud compute instances stop [INSTANCE]`
2. [ ] Preserve all logs: `gcloud logging read "resource.type=cloud_function" --limit=10000 > incident_logs.json`
3. [ ] Notify your legal counsel within 1 hour
4. [ ] Begin 72-hour breach notification clock (GLBA requirement)
5. [ ] Notify the affected credit union's CISO — use pre-established secure channel

### SHORT-TERM (24 Hours)

- [ ] Document timeline: when the breach/fraud started, when discovered, what was accessed
- [ ] File FBI IC3 report at **ic3.gov** (Internet Crime Complaint Center)
- [ ] Contact Florida Attorney General: **866-966-7226** or myfloridalegal.com
- [ ] Notify IRS Identity Protection Unit: **800-908-4490** (if tax info exposed)
- [ ] Contact FTC: **877-382-4357**
- [ ] If banking data was breached: notify NCUA (credit unions) or OCC (banks) per GLBA
- [ ] Change all shared credentials (API keys, service account keys, database passwords)
- [ ] Rotate every Firebase/GCP service account key
- [ ] Review all access logs for the past 30 days
- [ ] Enable enhanced logging on all systems (Cloud Audit Logs, Firebase Debug)

### LONG-TERM (30 Days)

- [ ] Complete root cause analysis: how did the breach/fraud occur?
- [ ] Remediate the vulnerability that was exploited
- [ ] Update all security procedures based on lessons learned
- [ ] Provide written breach notification to affected individuals (Florida: within 30 days)
- [ ] Provide written breach notification to Florida Department of Legal Affairs if >500 individuals affected
- [ ] File insurance claim with cyber liability carrier (if applicable)
- [ ] Conduct a full security audit of all systems
- [ ] Update this playbook with new procedures
- [ ] Consider engaging a third-party forensics firm for banking-related breaches
- [ ] Monitor for secondary attacks — breaches often come in waves

---

## 7. RECOVERY PLAYBOOK

### Financial Recovery
- [ ] Dispute all unauthorized transactions in writing (not just phone) within 60 days
- [ ] Request new account numbers for all compromised bank/credit card accounts
- [ ] File IRS Form 14039 (Identity Theft Affidavit) if tax-related fraud occurred
- [ ] Request IRS transcript to verify no fraudulent returns were filed
- [ ] Check all three credit reports for fraudulent accounts — dispute each one in writing
- [ ] Keep copies of all dispute letters (sent via certified mail with return receipt)
- [ ] Track all fraud-related expenses (lost time, legal fees, credit monitoring) — these may be recoverable
- [ ] Review Florida's Identity Theft Victim statute (§817.568) — you may be entitled to restitution

### Identity Recovery
- [ ] Complete the IdentityTheft.gov recovery plan (generates personalized steps + pre-filled letters)
- [ ] Place extended fraud alert (7 years) at all three bureaus — requires police report
- [ ] Request free credit reports from all three bureaus (you get extras as a fraud victim)
- [ ] Contact ChexSystems to dispute fraudulent bank accounts: **800-887-7652**
- [ ] Monitor credit reports monthly for 12 months (free through annualcreditreport.com — now weekly)
- [ ] Replace compromised documents:
  - [ ] Social Security card: ssa.gov or visit local SSA office
  - [ ] Driver's license: visit Florida DHSMV office with identity theft report
  - [ ] Passport: State Department, report stolen at travel.state.gov
- [ ] If SSN is severely compromised, apply for a new SSN at your local SSA office (rare, but possible)
- [ ] Update all accounts with new information (address, phone, email) if those were compromised
- [ ] Consider an identity theft protection service for 12-24 months post-incident

### Business Continuity (XELA Studio)
- [ ] If domain was hijacked: contact registrar abuse team immediately, file ICANN UDRP complaint
- [ ] If Stripe was compromised: create new Stripe account, transfer customers, update webhook endpoints
- [ ] If Firebase was compromised: create new Firebase project, restore from backup, rotate all keys
- [ ] If client data was exposed: notify affected clients within 72 hours with a written disclosure
- [ ] Maintain business operations on backup systems while primary systems are under investigation
- [ ] Communicate with active clients: transparent but controlled messaging, no speculation
- [ ] Review and update all contracts to include updated security provisions
- [ ] Re-verify all vendor and contractor access from scratch (zero-trust reset)

### Business Continuity (Guardian AI / FileFlex)
- [ ] Activate the pre-drafted breach notification letters
- [ ] Engage pre-identified forensics firm within 24 hours
- [ ] Provide regulators with full incident timeline within 72 hours
- [ ] Offer affected credit union members identity monitoring (coordinate with the credit union)
- [ ] Preserve all evidence for potential regulatory investigation
- [ ] Document all remediation steps for SOC 2 auditors
- [ ] Prepare for potential client contract review / termination discussions
- [ ] Update the Guardian AI security architecture based on post-incident findings
- [ ] Conduct a full penetration test before resuming production services

---

## EMERGENCY CONTACTS — Quick Reference

| Entity | Phone | URL |
|---|---|---|
| **Equifax** (freeze/fraud) | 888-766-0008 | equifax.com |
| **Experian** (freeze/fraud) | 888-397-3742 | experian.com |
| **TransUnion** (freeze/fraud) | 800-680-7289 | transunion.com |
| **Innovis** (freeze) | 800-540-2505 | innovis.com |
| **ChexSystems** (freeze) | 800-887-7652 | chexsystems.com |
| **FTC** (identity theft) | 877-382-4357 | identitytheft.gov |
| **FBI IC3** (cybercrime) | — | ic3.gov |
| **IRS** (tax identity theft) | 800-908-4490 | irs.gov |
| **Florida AG** (consumer fraud) | 866-966-7226 | myfloridalegal.com |
| **Stripe Support** | 888-926-2289 | support.stripe.com |
| **Google Cloud Support** | — | cloud.google.com/support |
| **Firebase Support** | — | firebase.google.com/support |
| **Opt-Out Prescreened Offers** | 888-567-8688 | optoutprescreen.com |
| **NCTUE** (telecom freeze) | 866-349-5355 | nctue.com |

---

*This playbook should be reviewed quarterly and updated after any incident. Store a printed copy in your fireproof safe alongside your digital copy.*
