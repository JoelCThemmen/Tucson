# Wireframes & User Flows
## Investor Relationship Management Platform

### Version 1.0
### Date: September 2025

---

## 1. User Journey Maps

### 1.1 New Investor Onboarding Journey

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Landing   │────▶│     Sign     │────▶│   Profile   │────▶│ Verification │
│    Page     │     │      Up      │     │   Setup     │     │   Process    │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
       │                    │                    │                     │
       │                    ▼                    ▼                     ▼
       │            ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
       │            │    Email     │     │  Investment │     │   Document   │
       │            │ Verification │     │ Preferences │     │    Upload    │
       │            └──────────────┘     └─────────────┘     └──────────────┘
       │                                         │                     │
       ▼                                         ▼                     ▼
┌─────────────┐                          ┌─────────────┐     ┌──────────────┐
│   Public    │                          │     AI      │     │   Pending    │
│   Preview   │                          │  Assistant  │     │   Review     │
└─────────────┘                          │    Intro    │     └──────────────┘
                                         └─────────────┘              │
                                                │                     ▼
                                                ▼              ┌──────────────┐
                                         ┌─────────────┐      │   Approved   │
                                         │  Dashboard  │◀─────│   Welcome    │
                                         │   Access    │      │   Experience │
                                         └─────────────┘      └──────────────┘
```

### 1.2 Investment Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browse     │────▶│    View      │────▶│   Express    │────▶│     Due      │
│Opportunities │     │   Details    │     │   Interest   │     │  Diligence   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       ▲                    │                     │                     │
       │                    ▼                     ▼                     ▼
       │            ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
       │            │   AI Deal    │     │   Schedule   │     │   Review     │
       │            │   Analysis   │     │   Meeting    │     │  Documents   │
       │            └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │                     │
       │                    ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Portfolio  │◀───│   Complete   │◀────│     Sign     │◀────│    Commit    │
│   Updated    │    │  Investment  │     │  Documents   │     │   Capital    │
└──────────────┘    └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Key Screen Wireframes

### 2.1 Landing Page

```
┌────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  [Logo]              Home  Opportunities  Network  About    │   │
│ │                                                    [Login]  │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │                                                               │   │
│ │         WHERE SOPHISTICATED INVESTORS CONNECT                │   │
│ │                                                               │   │
│ │         Exclusive Access to Curated Opportunities            │   │
│ │                                                               │   │
│ │              [ Request Invitation ]  [ Learn More ]          │   │
│ │                                                               │   │
│ │         ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│ │         │ $2.5B+   │  │  500+    │  │  18.5%   │           │   │
│ │         │ Invested │  │ Members  │  │ Avg IRR  │           │   │
│ │         └──────────┘  └──────────┘  └──────────┘           │   │
│ │                                                               │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  TRUSTED BY EXECUTIVES FROM                                 │   │
│ │  [Logo] [Logo] [Logo] [Logo] [Logo] [Logo]                 │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  FEATURED OPPORTUNITIES                                      │   │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │   │
│ │  │ [Blur]   │  │ [Blur]   │  │ [Blur]   │                 │   │
│ │  │ Private  │  │ Private  │  │ Private  │                 │   │
│ │  │ [Lock]   │  │ [Lock]   │  │ [Lock]   │                 │   │
│ │  └──────────┘  └──────────┘  └──────────┘                 │   │
│ │  Join to View Exclusive Deals                               │   │
│ └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dashboard

```
┌────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ [≡] InvestorPlatform    [Search...]    [AI] [🔔] [Profile] │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌───────────┬──────────────────────────────────┬──────────────┐   │
│ │           │  Welcome back, Robert             │              │   │
│ │ Dashboard │  ┌─────────┬─────────┬─────────┐ │ AI Insights  │   │
│ │           │  │ $5.2M   │ +12.8%  │ 18.5%   │ │              │   │
│ │ Portfolio │  │ Total   │ Returns │ IRR     │ │ • New opp   │   │
│ │           │  └─────────┴─────────┴─────────┘ │   matches    │   │
│ │ Invest    │                                   │   profile    │   │
│ │           │  ┌────────────────────────────┐  │              │   │
│ │ Events    │  │      Performance Chart      │  │ • Tax opt   │   │
│ │           │  │         [Graph]              │  │   strategy  │   │
│ │ Network   │  │                             │  │   available │   │
│ │           │  └────────────────────────────┘  │              │   │
│ │ Messages  │                                   │ • 3 peers   │   │
│ │           │  Recent Activity                 │   viewing    │   │
│ │ Documents │  ┌────────────────────────────┐  │   TechCo    │   │
│ │           │  │ • New investment in...     │  │              │   │
│ │ Settings  │  │ • Distribution received... │  │ [View All]  │   │
│ │           │  │ • Event registration...    │  │              │   │
│ │           │  └────────────────────────────┘  └──────────────┘   │
│ └───────────┴──────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ Quick Actions: [Invest] [Schedule] [Browse] [Network]       │   │
│ └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### 2.3 Investment Opportunity Detail

```
┌────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ← Back to Opportunities                                     │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌────────────────────────────────────┬────────────────────────┐   │
│ │                                     │                        │   │
│ │  [Company Logo]                     │  INVESTMENT CARD       │   │
│ │                                     │                        │   │
│ │  TechCo Series B                    │  Amount: [$100,000]   │   │
│ │  AI-Powered Analytics Platform      │                        │   │
│ │                                     │  Quick Select:         │   │
│ │  [Video Player]                     │  [25K] [50K] [100K]   │   │
│ │                                     │                        │   │
│ │  ┌──────┬──────┬──────┬──────┐    │  Projected Returns:    │   │
│ │  │Overview│Financials│Team│Docs│    │  Conservative: 2.1x   │   │
│ │  └──────┴──────┴──────┴──────┘    │  Expected: 3.5x        │   │
│ │                                     │  Optimistic: 5.2x      │   │
│ │  Key Metrics:                       │                        │   │
│ │  • Valuation: $50M                  │  [❤ Save] [Invest Now]│   │
│ │  • Revenue: $5M ARR                 │                        │   │
│ │  • Growth: 200% YoY                 │  ─────────────────     │   │
│ │  • Runway: 18 months                │                        │   │
│ │                                     │  Social Signals:       │   │
│ │  Investment Thesis:                 │  👁 243 views today    │   │
│ │  [Detailed description...]          │  ⭐ 89% interested     │   │
│ │                                     │  👤 12 invested        │   │
│ │  Risk Factors:                      │                        │   │
│ │  • Market competition               │  Top Investors:        │   │
│ │  • Technology risk                  │  [JD] [MS] [RK]       │   │
│ │  • Regulatory changes               │                        │   │
│ │                                     │                        │   │
│ └────────────────────────────────────┴────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### 2.4 Virtual Networking Room

```
┌────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ Executive Lounge - Series B Opportunities    👥 24 investors│   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │                         MAIN STAGE                           │   │
│ │  ┌──────────────────────────────────────────────────────┐  │   │
│ │  │                                                        │  │   │
│ │  │               [Current Speaker Video]                 │  │   │
│ │  │                                                        │  │   │
│ │  └──────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │                    NETWORKING TABLES                         │   │
│ │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │   │
│ │  │Table 1 (4/8)│  │Table 2 (6/8)│  │Table 3 (2/8)│       │   │
│ │  │ ○ ○ ○ ○     │  │ ● ● ● ○     │  │ ● ○ ○ ○     │       │   │
│ │  │ ● ● ● ●     │  │ ● ● ○ ○     │  │ ○ ○ ○ ●     │       │   │
│ │  │FinTech     │  │HealthTech  │  │ Real Estate │       │   │
│ │  └─────────────┘  └─────────────┘  └─────────────┘       │   │
│ │                        [Join Table]                         │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ Participants:                                                │   │
│ │ [Avatar][Avatar][Avatar][Avatar][Avatar][Avatar][Avatar]    │   │
│ │ [Avatar][Avatar][Avatar][Avatar][Avatar][Avatar][Avatar]    │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  [🎤 Mute] [📹 Video] [📱 Share] [💬 Chat] [Leave Room]    │   │
│ └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### 2.5 Portfolio View

```
┌────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ Portfolio Overview                        [Export] [Analyze] │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│ │  │ $5.2M    │  │ $4.1M    │  │ $1.1M    │  │ 18.5%    │   │   │
│ │  │ Total    │  │ Invested │  │ Returns  │  │ IRR      │   │   │
│ │  │ +12.8%   │  │ 12 deals │  │ +26.8%   │  │ 2.3x     │   │   │
│ │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌───────────────────────────┬───────────────────────────────┐   │
│ │  Performance Chart         │  Asset Allocation             │   │
│ │  [Line Graph]              │  [Donut Chart]                │   │
│ │                           │                               │   │
│ │                           │  Tech: 45%                    │   │
│ │                           │  Real Estate: 30%            │   │
│ │                           │  Healthcare: 15%             │   │
│ │                           │  Other: 10%                  │   │
│ └───────────────────────────┴───────────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ Holdings                                    [Grid] [List]   │   │
│ │ ┌───────────────────────────────────────────────────────┐  │   │
│ │ │ Company    | Amount  | Current | Return | Status      │  │   │
│ │ ├───────────────────────────────────────────────────────┤  │   │
│ │ │ TechCo     | $500K   | $750K   | +50%   | ● Active   │  │   │
│ │ │ HealthAI   | $250K   | $400K   | +60%   | ● Active   │  │   │
│ │ │ PropTech   | $300K   | $280K   | -6.7%  | ● Active   │  │   │
│ │ │ FinanceApp | $200K   | $450K   | +125%  | ✓ Exited   │  │   │
│ │ └───────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### 2.6 Mobile Screens

#### Mobile Dashboard
```
┌─────────────────┐
│ ┌─────────────┐ │
│ │ 9:41 AM     │ │
│ │ ═══════════ │ │
│ └─────────────┘ │
│                 │
│ Good morning,   │
│ Robert          │
│                 │
│ ┌─────────────┐ │
│ │   $5.2M     │ │
│ │   Total     │ │
│ │   +12.8% ↑  │ │
│ └─────────────┘ │
│                 │
│ Quick Actions   │
│ ┌──────┬──────┐ │
│ │Invest│Browse│ │
│ ├──────┼──────┤ │
│ │Events│Docs  │ │
│ └──────┴──────┘ │
│                 │
│ Recent Activity │
│ ┌─────────────┐ │
│ │ • New dist..│ │
│ │ • TechCo... │ │
│ │ • Event...  │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │[Home][Port] │ │
│ │[+][Events]  │ │
│ │[Profile]    │ │
│ └─────────────┘ │
└─────────────────┘
```

#### Mobile Investment Detail
```
┌─────────────────┐
│ ┌─────────────┐ │
│ │ ← TechCo    │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │   [Logo]    │ │
│ │  TechCo B   │ │
│ │  AI Platform│ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Min: $25K   │ │
│ │ Target: $5M │ │
│ │ Raised: 72% │ │
│ │ ████████░░  │ │
│ └─────────────┘ │
│                 │
│ [Overview][Docs]│
│                 │
│ Key Highlights  │
│ • $5M ARR      │
│ • 200% Growth  │
│ • 18mo Runway  │
│                 │
│ ┌─────────────┐ │
│ │ Amount: $   │ │
│ │ [25K][50K]  │ │
│ │ [100K][250K]│ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Invest Now  │ │
│ └─────────────┘ │
└─────────────────┘
```

---

## 3. Information Architecture

### 3.1 Site Map

```
Home
├── Public
│   ├── Landing Page
│   ├── About
│   ├── How It Works
│   ├── Contact
│   └── Login/Register
│
└── Authenticated
    ├── Dashboard
    │   ├── Portfolio Summary
    │   ├── Recent Activity
    │   ├── AI Insights
    │   └── Quick Actions
    │
    ├── Investments
    │   ├── Browse Opportunities
    │   │   ├── Filter/Search
    │   │   ├── List View
    │   │   └── Map View
    │   ├── Opportunity Detail
    │   │   ├── Overview
    │   │   ├── Financials
    │   │   ├── Team
    │   │   ├── Documents
    │   │   ├── Deal Room
    │   │   └── Q&A
    │   ├── My Investments
    │   └── Watchlist
    │
    ├── Portfolio
    │   ├── Overview
    │   ├── Holdings
    │   ├── Performance
    │   ├── Transactions
    │   ├── Distributions
    │   └── Statements
    │
    ├── Network
    │   ├── My Connections
    │   ├── Find Investors
    │   ├── Messages
    │   ├── Virtual Lounges
    │   └── Groups
    │
    ├── Events
    │   ├── Upcoming Events
    │   ├── Event Calendar
    │   ├── My Registrations
    │   ├── Past Events
    │   └── Virtual Events
    │
    ├── Resources
    │   ├── Education Center
    │   ├── Market Insights
    │   ├── Documents
    │   ├── Tax Center
    │   └── Help Center
    │
    └── Profile
        ├── Personal Info
        ├── Investment Preferences
        ├── Verification Status
        ├── Security Settings
        ├── Notifications
        ├── Achievements
        └── Settings
```

### 3.2 Navigation Structure

#### Primary Navigation
```
┌──────────────────────────────────────────────────────┐
│  Logo   Dashboard  Invest  Portfolio  Network  Events│
│                                                       │
│                    [Search]            [AI] [🔔] [👤]│
└──────────────────────────────────────────────────────┘
```

#### Secondary Navigation (Contextual)
```
Investment Section:
[All] [Trending] [New] [Closing Soon] [My Interests]

Portfolio Section:
[Overview] [Holdings] [Performance] [Transactions] [Documents]

Network Section:
[Connections] [Discover] [Messages] [Lounges] [Groups]
```

---

## 4. User Flow Details

### 4.1 Registration & Verification Flow

```
Start
  │
  ▼
Email Entry ──── Existing? ───▶ Login Flow
  │                               
  ▼ New User                     
Password Creation
  │
  ▼
Email Verification
  │
  ▼
Basic Profile
  │
  ▼
Investment Quiz ──── Skip ───▶ Limited Access
  │                            
  ▼ Complete                   
Accreditation Type
  ├── Income Based
  │     │
  │     ▼
  │   Upload W2/Tax Returns
  │
  └── Net Worth Based
        │
        ▼
      Upload Bank/Brokerage Statements
        │
        ▼
      KYC Documents
        │
        ▼
      Review Pending ──── Manual Review ───▶ 24-72hrs
        │                                      │
        ▼ Auto-Approved                        ▼
      Full Access                          Approved/Rejected
```

### 4.2 Investment Decision Flow

```
Browse Opportunities
  │
  ▼
Filter/Search ◀──────┐
  │                  │
  ▼                  │
Select Opportunity   │
  │                  │
  ▼                  │
View Details         │
  ├── Save ──────────┤
  ├── Share ─────────┤
  └── Continue       │
        │            │
        ▼            │
  AI Analysis        │
        │            │
        ▼            │
  Express Interest   │
        │            │
        ▼            │
  Schedule Call ─────┤
        │            │
        ▼            │
  Review Documents   │
        │            │
        ▼            │
  Enter Amount       │
        │            │
        ▼            │
  Review Terms       │
        │            │
        ▼            │
  Sign Documents     │
        │            │
        ▼            │
  Payment Method     │
    ├── Wire         │
    ├── ACH          │
    └── Check        │
        │            │
        ▼            │
  Confirmation       │
        │            │
        ▼            │
  Added to Portfolio │
        │            │
        └────────────┘
```

### 4.3 Networking Flow

```
Network Hub
  │
  ├── My Connections
  │     │
  │     ├── View Profile
  │     ├── Send Message
  │     └── Schedule Meeting
  │
  ├── Discover Investors
  │     │
  │     ├── Search/Filter
  │     ├── View Profiles
  │     ├── Send Connection Request
  │     └── Follow
  │
  └── Virtual Lounges
        │
        ├── Browse Rooms
        ├── Join Room
        │     │
        │     ├── Main Stage
        │     ├── Tables (Topic-based)
        │     ├── Private Rooms
        │     └── Networking Area
        │
        └── Create Room (Premium)
```

---

## 5. Responsive Breakpoints

### 5.1 Device Specifications

```
Mobile S:  320px - 374px   (iPhone SE)
Mobile M:  375px - 424px   (iPhone 12/13)
Mobile L:  425px - 767px   (iPhone Plus)
Tablet:    768px - 1023px  (iPad)
Laptop:    1024px - 1439px (MacBook)
Desktop:   1440px - 1919px (iMac)
Wide:      1920px+         (External Display)
```

### 5.2 Layout Adaptations

```
Desktop (1440px+)
┌──────┬────────────────┬──────┐
│ Side │    Content     │ Right│
│ bar  │                │ Panel│
│ 280px│    Flexible    │ 320px│
└──────┴────────────────┴──────┘

Tablet (768px - 1023px)
┌──┬──────────────────────┐
│S │      Content         │
│i │                      │
│d │                      │
│e │                      │
└──┴──────────────────────┘

Mobile (< 768px)
┌────────────────┐
│    Content     │
│                │
│                │
├────────────────┤
│  Bottom Nav    │
└────────────────┘
```

---

## 6. Interaction Patterns

### 6.1 Gesture Support

```
Mobile Gestures:
- Swipe Right: Back/Previous
- Swipe Left: Next/Forward
- Swipe Down: Refresh
- Swipe Up: Load More
- Pinch: Zoom charts
- Long Press: Context Menu
- Double Tap: Quick Action

Desktop Interactions:
- Hover: Reveal details
- Right Click: Context menu
- Drag & Drop: Reorder/Upload
- Scroll: Parallax effects
- Keyboard: Shortcuts (Cmd+K search)
```

### 6.2 Micro-interactions

```
Button States:
Default → Hover (lift) → Active (press) → Loading → Success/Error

Card Interactions:
Hover → Shadow increase + Slight scale
Click → Expand animation
Loading → Skeleton screen

Form Feedback:
Input → Real-time validation
Success → Green check animation
Error → Red shake animation
Submit → Button to spinner → Result

Notifications:
Slide in → Auto-dismiss (5s) → Slide out
User hover → Pause timer
User close → Immediate dismiss
```

---

## 7. Accessibility Considerations

### 7.1 Navigation Accessibility

```
Keyboard Navigation:
- Tab: Move forward
- Shift+Tab: Move backward
- Enter: Activate button/link
- Space: Check box/button
- Arrow keys: Navigate menus
- Escape: Close modal/menu

Screen Reader Landmarks:
<nav role="navigation" aria-label="Main">
<main role="main" aria-label="Content">
<aside role="complementary" aria-label="Sidebar">
<footer role="contentinfo" aria-label="Footer">

Focus Indicators:
- 3px solid outline
- 4px offset
- High contrast color
- Visible on all interactive elements
```

### 7.2 Content Accessibility

```
Images:
- Alt text for all images
- Decorative images: alt=""
- Complex charts: Long description

Forms:
- Labels for all inputs
- Error messages linked to fields
- Required fields marked
- Instructions before form

Colors:
- WCAG AAA contrast (7:1)
- Don't rely on color alone
- Colorblind-safe palettes

Typography:
- Minimum 16px body text
- 1.5x line height
- Scalable units (rem/em)
```

---

## 8. Performance Optimizations

### 8.1 Loading Strategies

```
Initial Load:
1. Critical CSS inline
2. HTML shell
3. App shell JS
4. Above-fold content
5. Progressive enhancement

Lazy Loading:
- Images: Intersection Observer
- Components: Dynamic imports
- Routes: Code splitting
- Data: Infinite scroll

Caching:
- Service Worker
- Browser cache
- CDN cache
- API response cache
```

### 8.2 Progressive Enhancement

```
Level 1: Core Content (HTML)
- Readable without CSS
- Functional without JS
- Semantic markup

Level 2: Enhanced Design (CSS)
- Visual hierarchy
- Responsive layout
- Basic animations

Level 3: Rich Interactions (JS)
- Dynamic updates
- Real-time features
- Advanced animations

Level 4: Premium Features
- AI assistance
- 3D visualizations
- VR experiences
```

---

## Appendices

### A. Component States Documentation

| Component | States | Transitions |
|-----------|--------|------------|
| Button | Default, Hover, Active, Disabled, Loading | 200ms ease |
| Card | Default, Hover, Selected, Loading | 300ms ease-out |
| Input | Empty, Focused, Filled, Error, Success | 150ms ease |
| Modal | Closed, Opening, Open, Closing | 400ms ease-in-out |

### B. Icon Library

```
Navigation: ☰ 🏠 💼 📊 👥 📅 💬 ⚙️
Actions: ➕ ✏️ 🗑️ 💾 📤 📥 🔄 ⭐
Status: ✓ ✗ ⚠️ ℹ️ 🔒 🔓 🎯 🏆
Finance: 💵 📈 📉 💰 🏦 💳 📊 💹
Social: 👤 👥 💬 📧 🔔 ❤️ 👍 🤝
```

### C. Animation Timing Functions

```css
--ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
--spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--bounce: cubic-bezier(0.87, -0.41, 0.19, 1.44);
```