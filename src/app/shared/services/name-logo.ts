import { Service } from '@angular/core';

@Service()
export class NameLogo {
  colors = ['#00AA55', '#009FD4', '#B381B3', '#E3BC00', '#D47500', '#DC2A2A'];

  // Entfernt Titel wie "Dr." oder "Prof." am Anfang des Namens
  // Für Initialen und alphabetische Sortierung
  // Achtung: Gleiche Titel-Regel wie NAME_PATTERN in contact-validators.ts, bei Änderungen beides anpassen.
  stripTitle(username: string): string {
    return username.trim().replace(/^(?:(?:Prof|Dr)\.\s+)*/, '');
  }

  setNameLogo(username: string) {
    username = this.stripTitle(username); // Initialien ohne Titel bilden

    let obj = {
      name: '',
      color: '',
    };
    let shortname;

    if (username.includes(' ')) {
      shortname = username.charAt(0) + username.split(' ')[1].charAt(0);
    } else shortname = username.charAt(0);
    shortname = shortname.toUpperCase(); // NEU: Initialien immer Groß
    obj.name = shortname;

    if (username.includes(' ')) {
      obj.color = this.colors[this.numberFromText(shortname) % this.colors.length];
    } else obj.color = '#939393';

    return obj;
  }

  numberFromText(text: string) {
    const charCodes = text
      .split('')
      .map((char) => char.charCodeAt(0))
      .join('');
    return parseInt(charCodes, 10);
  }

  getLogoColor(username: string) {
    return this.setNameLogo(username).color;
  }

  getLogoName(username: string) {
    return this.setNameLogo(username).name;
  }
}
