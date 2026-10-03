# Devpost Project Details — Historical Draft

> Historical Gemini-era planning copy only. Do not use the text below as a current submission or verified product claim. Draft #67 implements eight fixed answers; merge, external review, accessibility acceptance (#69/#70), and production verification remain pending. Existing main retains the Gemini route; the key was absent on the September 28 inspected revision. No Stripe payment flow or paid accessibility pack is implemented by the current main server.

## Archived proposal text — not current product evidence

The Gemini title, pitch, operational claims, and future plans below record an earlier proposal. They do not establish live model use, verified accessibility, submission readiness, or authorization for support analytics/personalization.

## Project Title
Duet: Solo — Screen-Reader-First Accessible Chess with Gemini Onboarding

## Elevator Pitch
Duet: Solo is a screen-reader-first chess variant designed for blind and low-vision players, with a Gemini-powered assistant that handles onboarding and accessibility support in real time.

## What it does
Duet: Solo provides an accessible strategy game experience where assistive-technology users are the primary audience, not an afterthought.  
The app includes:
- accessible interaction design for gameplay,
- a Gemini-powered support/onboarding agent,
- optional supporter information; accessibility features are included in the game and are not sold as an add-on.

## How we built it
- Frontend: HTML/CSS/JavaScript
- Backend: Node.js + Express
- AI: Gemini API (`/api/agent`)
- Deployment target: Google Cloud Run

The Gemini assistant is integrated into real product operations: onboarding users, answering support questions, and guiding usage in a structured, reliable JSON response flow.

## Built with Gemini
Gemini is used as an operational assistant layer inside the product:
1. New-player onboarding
2. Accessibility Q&A and support guidance
3. Intent-level response structuring for consistent UX

This kept the experience understandable for first-time users while preserving accessibility-first interaction principles.

## Challenges we ran into
- Designing AI support without compromising assistive-technology-native UX
- Ensuring reliable backend behavior for demo/judging conditions
- Balancing game complexity with clear onboarding for new players

## Accomplishments we’re proud of
- Centered blind/low-vision usability from the start
- Integrated Gemini in a real user-support role
- Built a deployable Cloud Run path; payments are not implemented in the current main server.
- Created a submission-ready architecture under hackathon timelines

## What we learned
- Accessibility-first constraints improve product clarity for everyone
- AI is most useful when scoped to operational support, not novelty
- Submission-readiness requires as much reliability/documentation work as feature work

## What’s next
- Expand accessibility playtesting cohort
- Add richer support analytics and reporting
- Improve onboarding personalization
- Grow educator/community usage in Education & Human Potential contexts
