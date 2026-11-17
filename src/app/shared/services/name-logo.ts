import { Service } from '@angular/core';

/** Creates the round name avatars (initials, background color and text color) for contacts. */
@Service()
export class NameLogo {
  /**
   * Avatar palette from the Join design (15 colors).
   * The matching text color is chosen by {@link getTextColor}.
   */
  colors = [
    '#FF7A00',
    '#FF5EB3',
    '#6E52FF',
    '#9327FF',
    '#00BEE8',
    '#1FD7C1',
    '#FF745E',
    '#FFA35E',
    '#FC71FF',
    '#FFC701',
    '#0038FF',
    '#C3FF2B',
    '#FFE62B',
    '#FF4646',
    '#FFBB2B',
  ];

  /**
   * Removes titles like "Dr." or "Prof." from the start of a name.
   * Used for the initials and for alphabetical sorting.
   *
   * @param username - The full name, possibly with titles.
   * @returns The trimmed name without leading titles.
   * @see NAME_PATTERN in contact-validators.ts uses the same title rule; keep both in sync.
   */
  stripTitle(username: string): string {
    return username.trim().replace(/^(?:(?:Prof|Dr)\.\s+)*/i, '');
  }

  /**
   * Capitalizes the first letter of every name part and leaves the rest unchanged.
   * Name parts start at the beginning, after a space, a hyphen or an apostrophe.
   * Unlike the `titlecase` pipe, "Hans-Maria" stays "Hans-Maria" instead of "Hans-maria".
   *
   * @param name - The name to format.
   * @returns The formatted name.
   */
  formatName(name: string): string {
    return name.replace(
      /(^|[\s\-'])(\p{L})/gu,
      (_match, separator, letter) => separator + letter.toUpperCase(),
    );
  }

  /**
   * Builds the avatar data for a name: titles and double spaces are removed first.
   * Names with at least two parts get two initials and a palette color based on the name,
   * single names get one initial and a gray background.
   *
   * @param username - The full name of the contact.
   * @returns The uppercase initials (`name`), the background `color` and the `textColor`.
   */
  setNameLogo(username: string) {
    username = this.stripTitle(username).replace(/\s+/g, ' ');

    let obj = {
      name: '',
      color: '',
      textColor: '#ffffff',
    };
    let shortname;

    if (username.includes(' ')) {
      shortname = username.charAt(0) + username.split(' ')[1].charAt(0);
    } else shortname = username.charAt(0);
    shortname = shortname.toUpperCase();
    obj.name = shortname;

    if (username.includes(' ')) {
      obj.color = this.colors[this.numberFromText(username.toLowerCase()) % this.colors.length];
    } else obj.color = '#939393';
    obj.textColor = this.getTextColor(obj.color);
    return obj;
  }

  /**
   * Turns a text into a fixed number, used to pick the avatar color.
   * Uses the djb2 hash plus the MurmurHash3 fmix32 finalizer (Austin Appleby, public domain).
   * The finalizer is needed because djb2 multiplies by 33: if the palette length shares a factor
   * with 33 (e.g. 11 or 15), the color would otherwise depend mostly on the last letter.
   *
   * @param text - The text to hash.
   * @returns An unsigned 32-bit integer.
   */
  numberFromText(text: string) {
    let hash = 5381;
    for (const char of text) {
      hash = ((hash << 5) + hash + char.charCodeAt(0)) >>> 0;
    }
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return hash >>> 0;
  }

  /**
   * Chooses dark or white text depending on the brightness of the background (YIQ formula).
   *
   * @param hex - Background color as `#RRGGBB`.
   * @returns `#2a3647` for light backgrounds, `#ffffff` for dark ones.
   */
  getTextColor(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#2a3647' : '#ffffff';
  }

  /**
   * Returns the avatar background color for a name.
   *
   * @param username - The full name of the contact.
   * @returns The background color as `#RRGGBB`.
   */
  getLogoColor(username: string) {
    return this.setNameLogo(username).color;
  }

  /**
   * Returns the avatar initials for a name.
   *
   * @param username - The full name of the contact.
   * @returns The uppercase initials.
   */
  getLogoName(username: string) {
    return this.setNameLogo(username).name;
  }
}
