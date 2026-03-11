# Teret-Teret Product Copy

**Version:** 1.0  
**Last Updated:** 2025-03-10  
**Maintainer:** Walia Digital

**Tone:**  
Warm · Magical · Family-friendly · Culturally rooted · Trustworthy · Premium but not corporate

**Purpose:**  
This document is the single source of truth for all Teret-Teret UI and marketing copy. Whenever UI wording changes, update this version and keep `lib/constants.ts` in sync.

> **Process:** Any new UI text must be added to this document first (with the key and English copy), then added to `lib/constants.ts` for all supported languages (am, en, es). This keeps copy consistent and avoids missing translations.

---

## Sections (below)

Keep sentences short and feelings big.

---

## Homepage

### Hero
- **App name:** Teret-Teret  
- **Subtitle:** Magical Ethiopian bedtime stories ✨  
- **Badge:** G · All ages · Child safe  
- **Hero line (optional):** One story at a time. One night at a time.

### Create your story
- **Section heading:** Create a story just for them  
- **Section sub:** Tell us your child’s name and we’ll weave them into a tale from the highlands.  
- **Primary CTA:** Tell me a story!

### Social proof / trust (optional)
- **Line:** Loved by families raising little storytellers.  
- **Line:** Stories rooted in Ethiopia, made for bedtime everywhere.

---

## Daily Teret

- **Section title:** Tonight’s Teret  
- **Section subtitle:** A new story for tonight’s learning and bedtime.  
- **Button:** Read tonight’s story  
- **Streak:** [X] day streak (e.g. “3 day streak”)  
- **Completion message:** You completed tonight’s Teret.  
- **Completion sub (optional):** Come back tomorrow for another.  
- **Empty / not loaded:** Today’s story is on its way. Try again in a moment.

---

## Audio mode (Listen)

- **Section / mode title:** Listen  
- **Subtitle:** Press play. Close eyes. Let the story carry them to sleep.  
- **Button primary:** Listen  
- **Play:** Play  
- **Pause:** Pause  
- **Restart:** Start over  
- **Speed:** Speed (e.g. 1x, 1.25x)  
- **Progress:** Listening… [X]%  
- **Error:** We couldn’t load the audio. Try again.  
- **Premium note:** Unlimited listening with Premium.  
- **Free preview:** Listen to a preview. Unlock full audio with Premium.

---

## Language learning mode

- **Mode title:** Learn with this story  
- **Subtitle:** Tap words and lines to see meanings. Learn naturally, inside the story.  
- **Tap to reveal:** Tap to see translation  
- **Words learned today:** Words you learned today  
- **Practice vocabulary:** Practice these words  
- **Save word:** Save word  
- **Saved:** Saved  
- **Key phrases:** Key phrases from this story  
- **Empty state:** No words saved yet. Tap any word in the story to save it.  
- **Lesson complete:** You learned [X] words from this story.

---

## Progress & levels

- **Level label:** Level  
- **XP to next:** [X] XP to next level  
- **Level names (in order):**  
  - Beginner Storyteller  
  - Village Storyteller  
  - Story Keeper  
  - Elder Story Keeper  
- **Milestone title:** You reached [Level name]  
- **Milestone sub:** Keep reading. The next story is waiting.  
- **Achievements screen title:** Your journey  
- **Achievements sub:** Every story and every word counts.

---

## Library (My Library)

- **Section title:** My Library  
- **Subtitle:** Your saved stories and favorites. Always here when you need them.  
- **Tabs:** All · Favorites  
- **Empty title:** No stories yet  
- **Empty sub:** Create or save a story and it’ll show up here.  
- **Favorites empty:** Star a story to find it here.  
- **Recently viewed (optional):** Recently viewed  
- **Filter (optional):** Bedtime · Language learning

---

## Family profiles

- **Section title:** Our family  
- **Subtitle:** One account. Separate stories and progress for each child.  
- **Who’s listening:** Who is listening tonight?  
- **Add child:** Add a child  
- **Switch profile:** Switch to [Name]  
- **Child progress:** [Name]’s progress  
- **Empty:** Add your first child to get started.

---

## Premium subscription & paywall

- **paywallLimitTitle:** You’ve used your free stories  
- **paywallLimitSubtitle:** Unlock unlimited Teret for your family.  
- **paywallBenefit1:** Unlimited magical stories  
- **paywallBenefit2:** Save and revisit favorite stories  
- **paywallBenefit3:** Learn languages through stories  
- **paywallBenefit4:** Access stories on any device  
- **paywallUpgradeCta:** Upgrade for $4.99/month  
- **paywallMaybeLater:** Maybe later  
- **subscriptionSuccessMessage:** Welcome to unlimited Teret. (Account page after Stripe success.)  
- **premiumActivating:** Your premium access is being activated... (Shown while webhook may be delayed.)  
- **signInToUpgrade:** Sign in to upgrade and keep your stories across devices. (When signed-out user taps upgrade.)  
- **Legacy:** paywallTitle, paywallSub, paywallValueLine, paywallSubscribeBtn, paywallLaterBtn  

### Free story limits (daily, server-enforced)
- **Guest users:** 3 free stories per day (by IP; rolling 24h window).  
- **Signed-in free users:** 3 free stories per day (rolling 24h from first story in window).  
- **Premium users:** Unlimited stories.

### Account subscription UX
- **planFree:** Free | **planPremium:** Premium  
- **unlimitedStories:** Unlimited stories (e.g. under Premium plan)  
- **manageSubscription:** Manage subscription | **upgradeToPremium:** Upgrade to Premium  
- **checkoutCancelled:** Checkout cancelled. | **signInToSubscribe:** Sign in to subscribe.  
- **subscriptionComingSoon:** Subscription coming soon. (When Stripe is not configured.)

---

## Story packs storefront

- **Page title:** Story packs  
- **Subtitle:** Curated collections. One-time purchase. Yours forever.  
- **Pack: Bedtime:**  
  - **Title:** Bedtime Stories Pack  
  - **Description:** Gentle, calming stories made for winding down. Perfect for every night.  
- **Pack: Folktales:**  
  - **Title:** Ethiopian Folktales Pack  
  - **Description:** Classic tales from the highlands. Wisdom and wonder in every one.  
- **Pack: Language:**  
  - **Title:** Language Learning Pack  
  - **Description:** Stories built for learning Amharic and English together.  
- **Pack: Brave kids:**  
  - **Title:** Brave Kids Stories Pack  
  - **Description:** Adventures for brave hearts. Courage and kindness in every story.  
- **CTA:** Get this pack  
- **Owned:** In your library  
- **Price format:** $[X] one-time

---

## Printable storybook / PDF export

- **Action label:** Create printable  
- **Action alt:** Export as PDF  
- **Subtitle:** Turn this story into a beautiful storybook you can print or keep.  
- **Personalize:** Add [child]’s name on the cover  
- **My printables:** My printables  
- **Downloads:** Downloads  
- **Premium gate:** Unlock printable storybooks with Premium.  
- **Success:** Your storybook is ready to download.

---

## Schools & teachers

- **Page title:** For schools & teachers  
- **Subtitle:** Bring Teret-Teret into your classroom. Stories, language, and culture in one place.  
- **Section: Offer**  
  - **Heading:** Classroom storytelling & language learning  
  - **Body:** One simple plan for your class. Ethiopian stories, multiple languages, and printable resources. Perfect for cultural studies and bilingual programs.  
- **Section: Contact**  
  - **Heading:** Get in touch  
  - **Sub:** Tell us about your class or school. We’ll help you get set up.  
  - **CTA:** I’m interested  
- **Form placeholder (optional):** Your name, school, and how you’d like to use Teret-Teret.

---

## Account page

- **Subtitle:** Sign in to save your favorite stories, track progress, and unlock unlimited Teret for your family.  
- **Benefits (list):**  
  - ✓ Save stories for bedtime  
  - ✓ Track language learning progress  
  - ✓ Access your stories on any device  
- **Continue with Google:** Continue with Google  
- **Guest note:** You can use the app as a guest; stories are saved in this browser. Sign in to sync across devices and subscribe for unlimited stories.

---

## Share this Teret (story completion)

- **Button:** Share this Teret  
- **Share title:** Tonight's Teret from Teret-Teret 📖  
- **Share text:** A magical bedtime story that also teaches language.  
- **Success (Web Share):** Shared!  
- **Success (copy fallback):** Link copied to clipboard  

---

## Microcopy & system messages

- **Save success:** Saved!  
- **Copy success:** Copied  
- **Share success:** Shared!  
- **Export success:** Exported!  
- **Error generic:** Something went wrong. Please try again.  
- **Sign in prompt:** Sign in to sync stories across devices.  
- **Guest notice:** Stories you save as a guest stay on this device. Sign in to sync.

---

*Last updated for Phase 1–3 product scope. Add Amharic and Spanish in `lib/constants.ts` from this English set.*
