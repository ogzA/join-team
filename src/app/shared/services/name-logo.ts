import { Service } from '@angular/core';

@Service()
export class NameLogo {
  // Avatar-Palette "Juwel": tiefe, satte Töne plus BVB-Gelb
  // 11 Farben, Schriftfarbe wählt getTextColor() automatisch
  colors = [
    '#6D28D9',
    '#BE185D',
    '#0369A1',
    '#047857',
    '#B45309',
    '#4338CA',
    '#A21CAF',
    '#0F766E',
    '#9F1239',
    '#334155',
    '#FDE100',
  ];

  // Entfernt Titel wie "Dr." oder "Prof." am Anfang des Namens
  // Für Initialen und alphabetische Sortierung
  // Achtung: Gleiche Titel-Regel wie NAME_PATTERN in contact-validators.ts, bei Änderungen beides anpassen
  stripTitle(username: string): string {
    return username.trim().replace(/^(?:(?:Prof|Dr)\.\s+)*/, '');
  }

  setNameLogo(username: string) {
    username = this.stripTitle(username); // Initialen ohne Titel bilden

    let obj = {
      name: '',
      color: '',
      textColor: '#ffffff',
    };
    let shortname;

    if (username.includes(' ')) {
      shortname = username.charAt(0) + username.split(' ')[1].charAt(0);
    } else shortname = username.charAt(0);
    shortname = shortname.toUpperCase(); // NEU: Initialen immer groß
    obj.name = shortname;

    if (username.includes(' ')) {
      obj.color = this.colors[this.numberFromText(username.toLowerCase()) % this.colors.length];
    } else obj.color = '#939393';
    obj.textColor = this.getTextColor(obj.color); // Schrift passend zur Hintergrundfarbe
    return obj;
  }

  // djb2-Hash mit Finalizer: erzeugt aus dem Namen eine feste Zahl für die Farbwahl
  // Ohne Finalizer hinge die Farbe bei 11 Farben fast nur vom letzten Buchstaben ab (33 = 3 × 11)
  numberFromText(text: string) {
    let hash = 5381;
    for (const char of text) {
      hash = ((hash << 5) + hash + char.charCodeAt(0)) >>> 0;
    }
    // Finalizer: MurmurHash3 fmix32 (Austin Appleby, public domain)
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;
    return hash >>> 0;
  }

  // Wählt dunkle oder weiße Schrift je nach Helligkeit des Hintergrunds (YIQ-Formel)
  getTextColor(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#2a3647' : '#ffffff';
  }

  getLogoColor(username: string) {
    return this.setNameLogo(username).color;
  }

  getLogoName(username: string) {
    return this.setNameLogo(username).name;
  }
}
