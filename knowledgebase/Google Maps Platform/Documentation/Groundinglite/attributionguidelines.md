This page provides attribution requirements and guidelines for displaying
Grounding Lite content in your applications.

## Display Google Maps attribution

You must follow Google Maps attribution requirements when displaying Content
from Grounding Lite in your app or website. You don't need to add extra
attribution if the Content is shown on a Google Map where the attribution is
already visible.

## Google Maps logo and text attribution

Attribution should take the form of the Google Maps logo whenever possible. In
cases where space is limited, the text **Google Maps** is acceptable. It must
always be clear to end users which content is provided by Google Maps.
![Left: Google Maps logo attribution, Right: Google Maps text attribution](https://developers.google.com/static/maps/images/01_GMP_Logo_Text.jpg) Left: Google Maps logo attribution, Right: Google Maps text attribution

## Logo attribution

Follow these requirements for using the Google Maps logo in your app or website.
![Acceptable variations for Google Maps logo attribution](https://developers.google.com/static/maps/images/02_GMP_Logo_Alternates.jpg) Acceptable variations for Google Maps logo attribution

### Download Google Maps logos

Use the official Google Maps logo files. Download the logos below, and follow
the guidelines in this section.

[Download the Google Maps attribution assets](https://developers.google.com/static/maps/documentation/images/Google_Maps_Attribution_Assets.zip)

When using the Google Maps logo, follow these guidelines.

- Don't modify the logo in any way.
- Maintain the aspect ratio of the logo to prevent distortion.
- Use the outlined logo on a busy background, like a map or image.
- Use the non-outlined logo on a plain background, like a solid color or subtle gradient.

### Logo size specification

Follow these size specifications for the Google Maps logo:

- **Minimum logo height:** 16dp
- **Maximum logo height:** 19dp
- **Minimum logo clear space:** 10dp on left, right and top, 5dp on the bottom

To learn about dp, see [Pixel
density](https://m2.material.io/design/layout/pixel-density.html#pixel-density)
on the Material Design website.
![Google Maps logo showing minimum clear space and acceptable size range](https://developers.google.com/static/maps/images/03_GMP_Logo_Size_Specs.jpg) Google Maps logo showing minimum clear space and acceptable size range

### Logo accessibility

Follow these accessibility requirements for the Google Maps logo:

- Maintain an [accessible
  contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) between the logo and the background.
- Include an accessibility label with the text **Google Maps**.

![Unacceptable variations and accessibility issues for Google Maps logo attribution](https://developers.google.com/static/maps/images/04_GMP_Accessibility.png) Unacceptable variations and accessibility issues for Google Maps logo attribution

## Text attribution

If the size of your interface does not support using the Google Maps logo, you
can spell out **Google Maps** in text. Follow these guidelines:
![Acceptable variations of the Google Maps text attribution](https://developers.google.com/static/maps/images/05_GMP_Text_Attribution.jpg) Acceptable variations of the Google Maps text attribution

- Don't modify the text **Google Maps** in any way:
  - Don't change the capitalization of **Google Maps**
  - Don't wrap **Google Maps** onto multiple lines
  - Don't localize **Google Maps** into another language.
  - Prevent browsers from translating **Google Maps** by using the HTML attribute `translate="no"`.

![Unacceptable variations of the Google Maps text attribution](https://developers.google.com/static/maps/images/06_GMP_Text_Donts.jpg) Unacceptable variations of the Google Maps text attribution

- Style Google Maps text as described in the following table:

  | Google Maps text-styling requirements ||
  |---|---|
  | **Property** | **Style** |
  | Font family | [Roboto](https://fonts.google.com/specimen/Roboto?preview.text_type=custom). Loading the font is optional. |
  | Fallback font family | Any sans serif body font already used in your product or "Sans-Serif" to invoke the default system font |
  | Font style | Normal |
  | Font weight | 400 |
  | Font color | White, black (#1F1F1F), or gray (#5E5E5E). Maintain accessible [(4.5:1)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) contrast against the background. |
  | Font size | Minimum font size: 12sp Maximum font size: 16sp To learn about sp, see [Font size units](https://m3.material.io/styles/typography/type-scale-tokens#3f4488e7-3b74-45b0-a143-9d6afa4d62dc) on the Material Design website. |
  | Letter spacing | Normal |

### Example CSS

The following CSS renders Google Maps with the appropriate typographic style and
color on a white or light background.

```
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

.GMP-attribution {
font-family: Roboto, Sans-Serif;
font-style: normal;
font-weight: 400;
font-size: 1rem;
letter-spacing: normal;
white-space: nowrap;
color: #5e5e5e;
}
```