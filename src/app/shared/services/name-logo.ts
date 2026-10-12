import { Service } from '@angular/core';

@Service()
export class NameLogo {
  setShortName(username: string, logoID: string) {
    // username = 'Andre Strauch';
    const colors = ['#00AA55', '#009FD4', '#B381B3', '#E3BC00', '#939393', '#D47500', '#DC2A2A'];
    let shortname = username.charAt(0) + username.split(' ')[1].charAt(0);

    // document.getElementById("name").innerHTML = /*html*/ `${shortname}`;
    if (logoID) {
      document.getElementById(logoID)!.style.backgroundColor =
        colors[this.numberFromText(shortname) % colors.length];
    }
  }

  numberFromText(text: string) {
    const charCodes = text
      .split('')
      .map((char) => char.charCodeAt(0))
      .join('');
    return parseInt(charCodes, 10);
  }
}
