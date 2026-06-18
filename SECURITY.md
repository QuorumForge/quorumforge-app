# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` branch | ✅ |
| Older releases | ❌ |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

To report a security issue, use one of the following channels:

1. **GitHub Private Vulnerability Reporting** (preferred) — navigate to the [Security tab](https://github.com/your-org/quorumforge-app/security/advisories/new) of this repository and click "Report a vulnerability".

2. **Email** — send details to `security@quorumforge.app`. Encrypt your message with our PGP key if the content is sensitive (key available on request).

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact (what can an attacker do?)
- Any suggested mitigations

### Response timeline

We aim to:
- Acknowledge receipt within **48 hours**
- Provide an initial assessment within **5 business days**
- Publish a fix and CVE (if applicable) within **30 days**

We will credit reporters in the release notes unless they request anonymity.

## Scope

This policy covers the QuorumForge web application and its API routes. The Soroban smart contract has its own security policy in the contract repository.

### In scope
- Authentication/authorization bypass in API routes
- XSS or injection vulnerabilities in the frontend
- Exposure of environment variables or secrets
- Wallet signature manipulation or replay attacks
- Database access control issues

### Out of scope
- Vulnerabilities in third-party dependencies (report those upstream)
- Theoretical attacks with no demonstrated impact
- Social engineering

## Responsible Disclosure

We ask that you:
- Give us reasonable time to patch before public disclosure
- Not access or modify other users' data
- Not perform denial-of-service attacks

We commit to not pursuing legal action against researchers who act in good faith under this policy.
