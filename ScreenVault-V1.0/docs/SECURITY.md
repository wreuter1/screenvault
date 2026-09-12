# ScreenVault V1.0 security notes

This is a portfolio MVP, not a production security system.

## Implemented
- scrypt password hashing with random salts
- server-side sessions
- server-side RBAC and object ownership checks
- CSRF token validation
- restrictive security headers
- 60-second HMAC-signed demo media URLs
- audit logging
- SHA-256 provenance metadata
- explicit actor likeness permission fields

## Still required for real production
HTTPS and secure cookie deployment, managed secrets/KMS, MFA/passkeys, rate limiting, account recovery, private cloud object storage, malware scanning, isolated media processing, centralized immutable logging/SIEM, backups/DR, dependency/SAST/DAST scanning, penetration testing, privacy/contract/legal review, and a formal threat model.

Never treat an AI/deepfake detector as absolute proof of authenticity; use provenance and risk signals with appropriate human/legal processes.
