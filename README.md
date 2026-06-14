# RageShield + FeedGuard

RageShield + FeedGuard is a privacy-first browser extension for understanding how content is trying to influence attention. It does not fact check, label content as true or false, or censor opinions. The MVP focuses on YouTube and keeps analysis local by default.
RageShield + FeedGuard is a privacy-first Chrome extension that helps people understand how online content is trying to influence their attention.

It is not a fact checker. It does not decide whether something is true or false. Instead, it highlights persuasion techniques, emotional intensity, content categories, and attention traps so the user can make a more deliberate choice.

The current MVP supports YouTube, including feeds, search results, watch pages, recommendations, comments, and Shorts.

## What It Does

- Scores visible YouTube content with a local emotional intensity score from 0 to 100.
- Detects persuasion patterns such as fear appeals, certainty language, engagement bait, mockery, personal attacks, exaggeration, urgency, and us-vs-them framing.
- Estimates emotional tone, including anger, fear, contempt, excitement, informational, and neutral signals.
- Adds lightweight YouTube badges that show the intensity score.
- Opens a detailed analysis panel with exact trigger phrases and explanations.
- Rewrites emotionally loaded headlines into more neutral versions.
- Lets users block or allow categories through FeedGuard.
- Supports blur mode and soft-lock style attention controls.
- Pauses and mutes blocked video/audio while content is hidden.
- Includes a searchable category list with 55 content categories.
- Stores analytics locally with IndexedDB.
- Stores settings locally with Chrome Storage.
- Includes a reply checker for aggressive or insulting drafts.

## What It Does Not Do

- It does not fact check.
- It does not label content as misinformation.
- It does not send browsing data to a server.
- It does not require an API key.
- It does not call OpenAI, Gemini, Anthropic, Ollama, or any external AI provider in the MVP.
- It does not modify YouTube permanently. It only changes the live page in your browser tab.

## Screens and Controls

The extension includes:

- Popup control panel
- Full options dashboard
- Category search
- Local analytics view
- FeedGuard controls
- Focus mode presets
- Time-based rules
- Privacy controls
- Persuasion technique library

## FeedGuard Categories

FeedGuard includes categories such as:

- Celebrity Drama
- Political Outrage
- Gaming Drama
- Crypto Hype
- Gambling Content
- Productivity Guru Content
- Relationship Gossip
- Gore & Graphic Injury
- Conspiracy Content
- Culture War
- Financial Hype
- AI Hype
- Health Anxiety
- Medical Advice
- Fitness & Body Image
- Diet & Weight Loss
- Shopping & Deals
- Luxury Flex
- Drama Commentary
- True Crime
- Crime & Public Safety
- Disaster & Crisis
- War & Conflict
- Sports Drama
- Pranks & Stunts
- Religion & Spirituality
- Dating Advice
- Science
- History
- Programming
- Education
- Music
- Movies & TV
- Comedy
- Memes
- Career & Jobs

More categories can be added through the local category registry.

## How Scoring Works

The MVP uses a local rule engine.

For each visible YouTube item, the extension extracts text from:

- title
- description or body text
- author/channel text
- visible Shorts metadata where available

Then it checks the text against local pattern sets:

- persuasion technique patterns
- emotional tone patterns
- category patterns
- custom user triggers

The emotional intensity score is calculated from technique pressure and tone pressure, then adjusted by the user's sensitivity level:

- Relaxed
- Balanced
- Strict

Scores are displayed as:

- 0-20: Informational
- 21-40: Lightly Emotional
- 41-60: Emotionally Charged
- 61-80: Highly Persuasive
- 81-100: Extreme Emotional Manipulation

Some categories, such as Gore & Graphic Injury, can force a red badge indicator even if the emotional intensity number is low.

## How FeedGuard Works

FeedGuard receives the analysis result and checks it against the user's settings.

It can act when:

- a detected category is blocked
- whitelist mode is enabled
- a focus session is active
- a schedule rule is active
- an emotional tone filter crosses the user's threshold

When content is hidden, the extension overlays the item, blurs it, and pauses/mutes associated media. The original YouTube content is not deleted.

## Privacy

RageShield + FeedGuard is local-first.

Local storage locations:

- Chrome Storage: user settings
- IndexedDB: local analytics events

No telemetry is sent by default. No browsing history is uploaded. External AI providers are represented in the architecture for future support, but they are not called by the current MVP.
