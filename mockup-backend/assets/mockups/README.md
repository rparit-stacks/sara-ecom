# Mockup Templates

Place your transparent PNG mockup template files in this directory.

## Default Template

The default template should be named `default-mockup.png` and should be a transparent PNG file.

## Template Requirements

- Format: PNG with transparency (alpha channel)
- Recommended size: 2000x2000 pixels (or as needed)
- The transparent areas will show the user's design underneath
- The opaque areas will overlay on top of the user's design

## Usage

The mockup template path can be configured via:
- Environment variable: `MOCKUP_TEMPLATE_PATH`
- Query parameter: `templatePath` (when calling the API)

## Example

```
default-mockup.png - Main product mockup template
t-shirt-front.png - T-shirt front view template
hoodie-front.png - Hoodie front view template
```
