# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Central-office employees of a small retail chain manage the product catalogue from the web panel. Store staff use the companion mobile application in the field to view the same products and update stock.

## Product Purpose

StokMate gives the central office a practical product-management workspace: employees can list, search, filter, inspect, and update product information. It keeps the catalogue and stock work visible across the web and mobile clients.

## Positioning

One shared product catalogue supports two complementary workflows: central-office catalogue management on the web and field stock updates on mobile.

## Operating Context

The web panel is used by central-office staff for desktop and tablet catalogue work. The companion mobile application is used by store staff while handling physical inventory.

## Capabilities and Constraints

- The web application provides authenticated product listing, search, filtering, detail viewing, and product updates.
- The mobile application provides access to the same products and supports field stock updates.
- The project runs locally and uses an in-memory API; product data and sessions reset when the API restarts.
- Turkish is the default UI language, with persistent English support.

## Brand Commitments

- Preserve the existing shadcn/ui component patterns and Tailwind token system.
- Keep the visual language calm, operational, trustworthy, modern, and information-dense.
- Treat the product list as the main workspace; login and product detail/edit are focused supporting workflows.
- Use product images as secondary identifiers, never as the primary information channel.
- Keep stock and status understandable through text, numbers, and structure as well as color.
- Prioritize desktop and tablet layouts from 768px upward, with a graceful narrow fallback.
- Preserve accessibility and the Turkish/English and light/dark/system theme experiences.
- Avoid generic SaaS styling, nested cards, excessive rounding, oversized KPIs, decorative gradients, glass effects, wasted space, meaningless icons or badges, and status-chip overload.

## Evidence on Hand

- Existing web routes and features under `src/routes` and `src/features/products`.
- The approved implementation plan at `../../docs/DELIVERY_PLAN.md`.
- No external brand assets, testimonials, or market claims were provided.

## Product Principles

- Keep catalogue management efficient and understandable for central-office work.
- Maintain one consistent product record across web and mobile workflows.
- Make field stock updates practical without complicating the central-office workflow.
- Preserve local, transparent case-study constraints rather than implying hosted or persistent service behavior.

## Accessibility & Inclusion

- Support keyboard-accessible web workflows and accessible contrast at desktop and tablet widths.
- Keep Turkish as the default language while providing an English alternative.
