# Holiday Hornets

A sign-up page for fall and winter outings around Vancouver and the Lower Mainland.
The page is hosted free on GitHub Pages, and sign-ups are saved to a Google Sheet.

## 1. Turn on GitHub Pages

1. In this repository, open **Settings** > **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose the **main** branch and the **/ (root)** folder, then click **Save**.
4. After a minute or two the page is live at `https://<your-username>.github.io/<repo-name>/`.

## 2. Set up the Google Sheet

1. Create a new Google Sheet named **Holiday Hornets Sign-ups**.
2. Open **Extensions** > **Apps Script**.
3. Delete what's in the editor, then paste in everything from `Code.gs` in this repository. Click **Save**.
4. In the function menu at the top choose **setup**, then click **Run**. Approve the permissions Google asks for (choose your account > Advanced > Go to project).
5. Go back to the sheet. You'll see two tabs: **Signups** and **Dates**.

## 3. Deploy the script

1. In Apps Script, click **Deploy** > **New deployment**.
2. Click the gear icon and choose **Web app**.
3. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
4. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).

## 4. Connect the page

1. In this repository, open `index.html` and click the pencil icon to edit.
2. Find the line `const API_URL="";` near the bottom.
3. Paste your web app URL between the quotes, for example `const API_URL="https://script.google.com/macros/s/AKfy.../exec";`
4. Click **Commit changes**. The live page updates within a minute or two.

## Running it day to day (the Google Sheet is your admin page)

- **See who's interested:** the **Signups** tab lists every name and outing.
- **Remove someone:** delete their row in **Signups**.
- **Set a date:** type a date in column C of the **Dates** tab. The card shows "Going Saturday, December 12" and the outing moves into "Dates set."
- **Hide an outing:** type `yes` in column D of the **Dates** tab.

If you change `Code.gs` later, use **Deploy** > **Manage deployments** > edit > **New version** so the web address stays the same.
