# Devpost Project Details — Paste-Ready Draft

## Project Title
Duet: Solo — Screen-Reader-First Accessible Chess with Gemini Onboarding

## Elevator Pitch
Duet: Solo is a screen-reader-first chess variant designed for blind and low-vision players, with a Gemini-powered assistant that handles onboarding and accessibility support in real time.

## What it does
Duet: Solo provides an accessible strategy game experience where assistive-technology users are the primary audience, not an afterthought.  
The app includes:
- accessible interaction design for gameplay,
- a Gemini-powered support/onboarding agent,
- and a Stripe-backed supporter/accessibility pack checkout flow.

## How we built it
- Frontend: HTML/CSS/JavaScript
- Backend: Node.js + Express
- AI: Gemini API (`/api/agent`)
- Payments: Stripe Checkout + webhook
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
- Built a deployable app path with payment flow and transaction hooks
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
