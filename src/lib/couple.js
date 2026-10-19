// The order the couple's names appear in. Aditi comes first by default; ?order=1 puts Yashwant
// first (cover, painted names, RSVP, calendar title). The hashtag stays as it is.
export function coupleNames(couple, search = '') {
  const groomFirst = new URLSearchParams(search).get('order') === '1';
  const [first, second] = groomFirst ? [couple.groom, couple.bride] : [couple.bride, couple.groom];
  return { first, second, both: `${first} & ${second}`, groomFirst };
}
