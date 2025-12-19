# Product Requirement Document (PRD): Practice Dashboard Redesign

## 1. Executive Summary
The "Practice Dashboard" (Main Practice Page) is the entry point for users to improve their interview skills. The current design is functional but lacks visual appeal and engagement. This redesign aims to transform the page into a motivating, high-end "Command Center" for interview preparation, aligning with the application's "Glass/VisionOS" aesthetic.

## 2. Goals & Objectives
*   **Visual Alignment:** Adopt the Glassmorphism/VisionOS design language (translucency, gradients, neon accents).
*   **Motivation:** Display progress and streaks to encourage daily practice.
*   **Clarity:** clearly distinguish between "New Session" actions and "Past History".
*   **Organization:** Better filtering and sorting of past sessions (by date, score, type).

## 3. User Stories
*   **As a user,** I want to see a summary of my recent performance (e.g., average score, streaks) so I feel motivated.
*   **As a user,** I want to easily start a new session with a prominent, inviting call-to-action.
*   **As a user,** I want to filter my past sessions to find "Behavioral" or "Technical" practices.
*   **As a user,** I want to quickly resume an unfinished session without searching for it.
*   **As a user,** I want to see visual cues (like charts or rings) that show my improvement over time.

## 4. UI/UX Design Requirements

### 4.1. Layout & Theme
*   **Background:** Dark, rich gradient background (consistent with `dashboard-theme`).
*   **Container style:** `glass-panel` for all major cards (blur, subtle border, slight transparency).
*   **Typography:** Clean, modern sans-serif (Inter/Geist) with white/gray text hierarchy.

### 4.2. Key Sections

#### A. Hero / Stats Section (Top)
*   **Layout:** A row of 3-4 "Insight Cards".
*   **Content:**
    1.  **"Practice Streak":** Number of consecutive days practiced (with a fire icon/gradient).
    2.  **"Average Score":** Circular progress ring showing the user's rolling average.
    3.  **"Sessions Completed":** Total count vs. Goal.
    4.  **"Usage Limit" (Free Tier only):** Stylish progress bar showing monthly allowance.

#### B. "Quick Start" Area
*   **Design:** A large, visually distinct card or banner.
*   **Content:**
    *   **Headline:** "Ready to ace your next interview?"
    *   **Primary Action:** Large, glowing "Start New Session" button (perhaps with a microphone icon).
    *   **Secondary Option:** "Resume last session" (if applicable).

#### C. Session History (Main Content)
*   **Header:** "My STAR Practices" with Filter tabs (All, Behavioral, Technical, Leadership).
*   **View Toggle:** Option to switch between "Grid View" (Cards) and "List View" (Table).
*   **Summary Table (List View):**
    *   **Structure:** A comprehensive table similar to the Resume Library.
    *   **Columns:**
        *   **Session Name:** (e.g., "Behavioral - Leadership Focus")
        *   **Questions:** (e.g., "3 / 5 Answered")
        *   **Avg Score:** Color-coded score badge.
        *   **Duration:** Time spent practicing.
        *   **Date:** (e.g., "Oct 24, 2023")
        *   **Actions:** "View Report", "Continue", "Delete".
    *   **Data Persistence:** Ensure all session data is saved so users can resume without restarting.

*   **Grid View (Cards):**
    *   **Card Design:** Glass cards with hover effects (`hover:scale-[1.02]`).
    *   **Card Content:**
        *   **Title/Type:** e.g., "Behavioral Interview - Amazon".
        *   **Date:** Relative (e.g., "2 days ago").
        *   **Score Badge:** Color-coded (Green > 80, Yellow > 60, Red < 60).
        *   **Status:** "Completed", "In Progress" (with a pulse animation).
        *   **Action:** "View Report" or "Continue".

### 4.3. Visual Assets & Animations
*   **Animations:**
    *   Cards should fade in (`fade-in-up`) on load.
    *   Hover effects on all interactive elements.
    *   Progress rings should animate from 0 to value.
*   **Icons:** Use `lucide-react` with consistent sizing and coloring (purple/blue accents).

## 5. Functional Requirements (Frontend)
*   **State Management:**
    *   Fetch sessions from Supabase on mount.
    *   Calculate local stats (streak, average) if not provided by backend.
*   **Filtering:** Client-side filtering for responsiveness.
*   **Navigation:**
    *   Clicking "Start" -> `/dashboard/practice/new`
    *   Clicking a Session -> `/dashboard/practice/session/[id]`

## 6. Implementation Plan
1.  **Refactor Page:** Replace `app/dashboard/practice/page.tsx`.
2.  **Create Components:**
    *   `PracticeStatsCard`: Reusable glass card for top stats.
    *   `SessionCard`: Detailed card for history items.
    *   `StartSessionHero`: The main call-to-action area.
3.  **Style Integration:** Ensure use of `glass-panel`, `glow-button`, and `gradient-text` utility classes from `globals.css`.

