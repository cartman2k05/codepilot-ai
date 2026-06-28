# CodePilot AI — 5-Minute Demo Script

> **Total Duration:** 5:00
> **Format:** Live demo with narration
> **Audience:** Hackathon judges / technical stakeholders

---

## Opening Narrative

> *"Meet Acme Corp — a startup with 10 developers. Sarah prefers React Query; Tom still uses Redux. Alex writes comprehensive tests; Jamie skips them. Every code review is a coin flip depending on who's reviewing. Now multiply that inconsistency across 50 PRs a week.*
>
> *What if your AI code reviewer could learn each team's preferences — and get smarter with every single review? That's CodePilot AI."*

---

## 0:00 – 0:30 | Setup & Dashboard Tour

### Actions
1. Open browser to `http://localhost:3000`
2. Log in with demo credentials (`demo@acmecorp.com` / `demo123`)
3. Pan across the main dashboard

### Talking Points
- *"This is CodePilot AI — an AI code reviewer with persistent memory and smart cost optimization."*
- Point to the **Learning Score** widget: *"Notice the Learning Score is **0 out of 100** — the AI doesn't know your team yet. That's about to change."*
- Point to the **Cost Savings** chart: *"And our cost dashboard — currently showing $0 saved. Let's fix that too."*
- Point to the **Knowledge Graph** panel: *"The Knowledge Graph is empty. By the end of this demo, it'll be populated with your team's actual preferences."*

---

## 0:30 – 1:30 | First Review (The Learning Moment)

### Actions
1. Click **"New Review"**
2. Paste **Sample File #1** (React component with Redux) — see below
3. Click **"Submit for Review"**
4. Wait for the review to complete (~3–5 seconds)

### Talking Points
- While loading: *"CodePilot AI is running our LangGraph workflow — parsing the code, running static analysis, checking memory (which is empty right now), and generating a review."*
- When review appears: *"Here's our first review. **Score: 85 out of 100.** Let's look at the breakdown."*
- Scroll through suggestions:
  - *"The AI suggests using Redux for global state — that's a reasonable suggestion in general. But YOUR team at Acme Corp prefers React Query. The AI doesn't know that yet."*
  - *"It also suggests adding unit tests — a universally good suggestion."*
  - *"And it found a missing error boundary — nice catch."*

---

## 1:30 – 2:15 | The Feedback Loop

### Actions
1. Find the Redux suggestion → Click **"Reject"** 🔴
2. Find the testing suggestion → Click **"Accept"** 🟢
3. Find the error boundary suggestion → Click **"Accept"** 🟢
4. Observe the real-time memory update notification

### Talking Points
- On rejecting Redux: *"By rejecting this, I'm telling CodePilot AI: 'My team doesn't use Redux.' Watch what happens."*
- On accepting testing: *"And by accepting the testing suggestion, the AI learns that Acme Corp values comprehensive tests."*
- Point to the **Knowledge Graph** update: *"Look — the Knowledge Graph just updated in real-time:"*
  - *"Under **Avoided**: Redux"*
  - *"Under **Patterns**: Unit testing for components"*
- *"This is Hindsight in action — it retained our feedback and updated the team profile."*

---

## 2:15 – 3:15 | Second Review (The Proof)

### Actions
1. Click **"New Review"** again
2. Paste **Sample File #2** (another React component — similar context) or paste the same file again
3. Submit and wait for review

### Talking Points
- While loading: *"Now the LangGraph workflow is running again — but this time, the 'Recall Memory' step has something to work with."*
- When review appears:
  - *"Look at this! The AI now says: **'Based on your team preferences, using React Query for state management ✓'**"*
  - *"It no longer suggests Redux. It **learned** from our feedback in under 60 seconds."*
- Navigate to the **Memory Evolution** timeline:
  - *"Here's the memory evolution. You can see the exact moment the AI learned about your React Query preference."*
  - *"Over 30+ reviews, the AI builds a comprehensive understanding of your entire team's coding philosophy."*

---

## 3:15 – 4:00 | Smart Routing in Action (CascadeFlow)

### Actions
1. Navigate to the **Audit Dashboard** (click "Audit" or "Cost" in the sidebar)
2. Show the routing log for the two reviews

### Talking Points
- Point to Review #1 routing log:
  - *"Our first review — the React component — used the **Llama 8B** model. Confidence was **0.91**. No escalation needed."*
  - *"Cost: **$0.003**."*
- Now paste **Sample File #3** (Python file with SQL injection) and submit
- Point to Review #3 routing log:
  - *"This Python file has a SQL injection vulnerability. The 8B model flagged it but with low confidence — only **0.62**."*
  - *"CascadeFlow automatically **escalated** to the **70B model** for a more thorough security review."*
  - *"Cost: **$0.014** — still cheap, but more importantly, **accurate**."*
- Point to the cost comparison:
  - *"Without CascadeFlow, every review would cost $0.014. With it, we're averaging **$0.005** — that's a **64% savings** and we're only two reviews in."*

---

## 4:00 – 4:30 | Dashboard Metrics

### Actions
1. Return to the main Dashboard
2. Highlight the updated metrics

### Talking Points
- **Learning Score:** *"Our Learning Score jumped from 0 to **35 out of 100**. It's growing! After 30+ reviews, this will be 80+."*
- **Cost Savings:** *"We've already saved **$0.009** across 3 reviews. At 1,000 reviews a month, that's **$9 per month** in savings — and it grows as the AI learns."*
- **Escalation Rate:** *"Our escalation rate is **33%** — one out of three reviews needed the expensive model. Industry average without smart routing? 100%."*
- *"Over time, as the AI learns your team's patterns, even complex code gets reviewed with higher confidence — meaning **fewer escalations and even lower costs**."*

---

## 4:30 – 5:00 | Wrap Up

### Talking Points

> *"Let me recap what CodePilot AI does:"*
>
> 1. 🧠 **Learns your team's coding style** with Hindsight — remembers preferences, conventions, and patterns across every session
> 2. ⚡ **Minimizes costs** with CascadeFlow — uses cheap models for easy reviews and expensive models only when needed
> 3. 📈 **Gets better with every review** — the more you use it, the smarter and cheaper it gets
>
> *"CodePilot AI isn't just another AI code reviewer. It's the **first one that remembers** — and the first one that gets **cheaper** the more you use it."*
>
> *"Thank you!"*

---

## Sample Code for Demo

### Sample File #1: React Component with Redux (Triggers Learning)

```jsx
// UserProfile.jsx — Acme Corp Frontend
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserName } from '../store/userSlice';

const UserProfile = ({ userId }) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile(userId));
  }, [userId]);

  const handleNameChange = (newName) => {
    dispatch(updateUserName({ userId, name: newName }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile-card">
      <img src={user.avatar} alt="avatar" />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <input
        type="text"
        defaultValue={user.name}
        onBlur={(e) => handleNameChange(e.target.value)}
      />
      <div className="stats">
        <span>Reviews: {user.reviewCount}</span>
        <span>Acceptance Rate: {user.acceptanceRate}%</span>
      </div>
    </div>
  );
};

export default UserProfile;
```

**What the AI should catch:**
- Redux usage (team prefers React Query) — *this becomes the learning trigger*
- Missing `dispatch` in `useEffect` dependency array
- Missing error boundary
- No loading skeleton (just text "Loading...")
- `defaultValue` + `onBlur` pattern could lose data
- No prop type validation
- Missing test file

---

### Sample File #2: Python File with SQL Injection (Triggers Security Escalation)

```python
# user_service.py — Acme Corp Backend
import sqlite3
from datetime import datetime
from typing import Optional


class UserService:
    """Handles user CRUD operations for the Acme Corp platform."""

    def __init__(self, db_path: str = "acme.db"):
        self.db_path = db_path
        self.connection = sqlite3.connect(db_path)
        self.cursor = self.connection.cursor()

    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Fetch a user by their email address."""
        query = f"SELECT * FROM users WHERE email = '{email}'"
        self.cursor.execute(query)
        row = self.cursor.fetchone()
        if row:
            return {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "created_at": row[3],
            }
        return None

    def create_user(self, name: str, email: str, password: str) -> dict:
        """Create a new user account."""
        query = f"""
            INSERT INTO users (name, email, password, created_at)
            VALUES ('{name}', '{email}', '{password}', '{datetime.now()}')
        """
        self.cursor.execute(query)
        self.connection.commit()
        return {"name": name, "email": email, "created_at": str(datetime.now())}

    def search_users(self, search_term: str) -> list:
        """Search users by name or email."""
        query = f"""
            SELECT * FROM users
            WHERE name LIKE '%{search_term}%'
            OR email LIKE '%{search_term}%'
        """
        self.cursor.execute(query)
        rows = self.cursor.fetchall()
        return [
            {"id": r[0], "name": r[1], "email": r[2]}
            for r in rows
        ]

    def delete_user(self, user_id: int) -> bool:
        """Delete a user by ID."""
        query = f"DELETE FROM users WHERE id = {user_id}"
        self.cursor.execute(query)
        self.connection.commit()
        return self.cursor.rowcount > 0

    def update_password(self, user_id: int, new_password: str) -> bool:
        """Update a user's password."""
        query = f"""
            UPDATE users SET password = '{new_password}'
            WHERE id = {user_id}
        """
        self.cursor.execute(query)
        self.connection.commit()
        return self.cursor.rowcount > 0
```

**What the AI should catch (and likely escalate on):**
- 🔴 **SQL Injection** in ALL methods (f-string interpolation in queries)
- 🔴 **Plaintext password storage** (no hashing)
- 🟡 **No connection pooling** (single sqlite3 connection)
- 🟡 **No input validation** on any parameters
- 🟡 **No error handling** (no try/except around DB operations)
- 🟡 **No connection cleanup** (missing `__del__` or context manager)
- 🟡 **`SELECT *`** instead of explicit column selection
- 🟡 **No type hints** on return values for list items

> **CascadeFlow Note:** The presence of security vulnerabilities (SQL injection, plaintext passwords) should cause the 8B model to report **low confidence** (< 0.80), triggering automatic escalation to the 70B model for a thorough security-focused review.

---

## Pre-Demo Checklist

- [ ] All services running (`docker-compose up` shows all 5 healthy)
- [ ] Demo account created (`demo@acmecorp.com` / `demo123`)
- [ ] Memory state reset (clean Knowledge Graph)
- [ ] Sample files copied and ready to paste
- [ ] Browser at `http://localhost:3000` with login screen visible
- [ ] Backup screenshots ready in case of connectivity issues
- [ ] Timer visible to track the 5-minute window
