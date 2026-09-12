# Employer talking points

Authentication = proving who a user is.
Authorization = deciding what that user can access.

Passwords are hashed, not reversibly encrypted, because the application only needs to verify them.

Media URLs expire because permanent public URLs create unnecessary leakage risk. The server checks authorization before issuing a short-lived signed URL.

RBAC must be enforced server-side because hiding UI controls is not security.

AI-assisted development is disclosed honestly: I used AI to accelerate implementation, but I own the product concept, security requirements, architecture, threat model, testing, and review. I can explain each control and the remaining production gaps.
