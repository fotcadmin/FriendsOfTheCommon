# Confidential Campaign Pledge System: Tally.so & Trustee Handover Guide
**The Friends of Tunbridge Wells & Rusthall Commons (Registered Charity No. 1013975)**  
*Document prepared for working session with Lucy — October 2026*

---

## 1. Overview & Key Benefits
The website's confidential pledge form is powered by **Tally.so** (`https://tally.so/r/D4lJgj`), embedded seamlessly directly onto `campaign.html#pledge`.

* **£0 / Month Software Cost:** 100% free with **unlimited responses** and unlimited forms.
* **Non-Google Solution:** No Google account or Google Sheets required for the Trustees.
* **Instant Automatic Logging:** When a resident submits a pledge online, it is safely recorded in Lucy's Tally dashboard.
* **Instant Email Alerts:** Can alert Trustee John Barber (`johnspbarber@gmail.com`) and Lucy automatically with every pledge submitted.
* **One-Click Excel / CSV Download:** Trustees can click **"Download as CSV / Excel"** anytime for board meetings or AGM preparations.
* **GDPR & Privacy Compliant:** Hosted in Europe with strict privacy protections.
* **Seamless National Trust Aesthetic:** Form has a transparent background, dynamic auto-resizing height, and no ugly inner scrollbars.

---

## 2. Form URLs & Integration Details

* **Live Embedded Form:** Embedded on `https://friendsofthecommons.uk/campaign.html#pledge`
* **Direct Form URL:** `https://tally.so/r/D4lJgj`
* **Tally Embed URL:** `https://tally.so/embed/D4lJgj?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`
* **Form ID:** `D4lJgj`

---

## 3. How Lucy & Trustees Manage Pledges

### Viewing Incoming Pledges
1. Log in at [https://tally.so](https://tally.so) using Lucy's email.
2. Click on the form: **"Friends of the Commons — Land Acquisition Pledge"**.
3. Click the **"Submissions"** tab to see every pledge received, sorted chronologically.

### Exporting to Excel for Board Meetings
1. Inside the **Submissions** tab, click **"Download"** (or **"Export"**).
2. Choose **CSV** or **Excel (.xlsx)**.
3. The spreadsheet contains:
   * Submission Date & Time
   * Pledge Amount (£)
   * Full Name
   * Email Address
   * Telephone Number
   * Home Address & Postcode
   * Gift Aid Opt-in status
   * Supporter Message / Comments

### Setting Up Email Notifications (For John Barber & Lucy)
1. Open the form editor in Tally and click **Settings** in the top bar.
2. Select **Email notifications**.
3. Under **"Receive email notification for new responses"**, enter:
   * Lucy's email address
   * `johnspbarber@gmail.com`
4. Toggle on **"Send email to respondents"** (optional):
   * This sends an automatic, polite receipt to the supporter thanking them for pledging to protect Tunbridge Wells & Rusthall Commons, reiterating that no money is taken now and their pledge is held in strict confidence.

---

## 4. Alternative: Google Sheets Webhook (Archived Reference)
*If the charity ever wishes to route data directly to Google Sheets in future, the Google Apps Script webhook code is preserved below.*

```javascript
/**
 * THE FRIENDS OF TUNBRIDGE WELLS & RUSTHALL COMMONS
 * Confidential Campaign Pledge Webhook & Spreadsheet Logger (Optional Alternative)
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    const timestamp = new Date();
    const ref = data.ref || "FOTC-" + Math.floor(1000 + Math.random() * 9000);
    const amount = Number(data.amount) || 0;
    const name = data.name || "Anonymous";
    const email = data.email || "";
    const phone = data.phone || "";
    const postcode = data.postcode || "";

    sheet.appendRow([timestamp, ref, amount, name, email, phone, postcode, "New"]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", ref: ref }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```
