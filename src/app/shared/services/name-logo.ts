import { Service } from '@angular/core';

@Service()
export class NameLogo {
  setNameLogo(username: string) {
    let obj = {
      name: '',
      color: '',
    };

    const colors = ['#00AA55', '#009FD4', '#B381B3', '#E3BC00', '#939393', '#D47500', '#DC2A2A'];
    let shortname;

    if (username.includes(' ')) {
      shortname = username.charAt(0) + username.split(' ')[1].charAt(0);
    } else shortname = username.charAt(0);
    obj.name = shortname;

    if (username.includes(' ')) {
      obj.color = colors[this.numberFromText(shortname) % colors.length];
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
}
