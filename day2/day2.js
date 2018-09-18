{
  // stores the id of the correct answer for this turn
  let __correctId;

  // fetches 6 random article ids
  function getIds() {
    const queryString = 'http://en.wikipedia.org/w/api.php?action=query&format=json&list=random&redirects=1&rnnamespace=0&rnlimit=6&origin=*';
    return fetch(queryString)
      .then(data => data.json());
  }

  // fetches an excerpt from the article id
  function getWikiExtract(id) {
    const queryString = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&pageids=${id}&exsentences=2&exintro=1&explaintext=1&exsectionformat=plain&origin=*`;
    return fetch(queryString)
      .then(data => data.json());
  }

  // takes in an array of articles and returns one id
  function chooseRandomId(randomArray) {
    return randomArray[Math.floor((Math.random() * 5))].id;
  }

  // removes bracketed info from titles
  function shorten(title) {
    return title.replace(/(\(.*\))|(,.*)/g, '').trim();
  }

  // returns an extract with all title-related text redacted
  function redact(extract, title) {
    const titleRegExp = new RegExp(title, 'gi');
    // redact full instances of title
    let redacted = extract
      .replace(titleRegExp, `<span class='redacted' data-original='${title}'>${'0'.repeat(15)}</span>`);
    // redact any words from title
    title.split(' ').forEach((word) => {
      if (word.length > 3) {
        const wordRegExp = new RegExp(`(${word})+(?![^<]*>)`, 'gi');
        redacted = redacted
          .replace(wordRegExp, match => `<span class='redacted' data-original='${match}'>${'0'.repeat(10)}</span>`);
      }
    });
    return redacted;
  }

  // creates buttons and returns original data
  function renderButtons(data) {
    const titles = data.query.random.map(item => item.title);
    const ids = data.query.random.map(item => item.id);
    const buttons = document.getElementById('buttons');
    for (let i = 0; i < titles.length; i += 1) {
      const button = buttons.children[i];
      button.classList.remove('button--correct');
      button.classList.remove('button--disabled');
      button.innerHTML = shorten(titles[i]);
      button.dataset.id = ids[i];
    }
  }

  // puts the extract text on the page
  function renderText(text) {
    document.getElementById('extract').innerHTML = text;
  }

  // restores the redacted parts of the text
  function revealText() {
    Array.from(document.querySelectorAll('.redacted'))
      .forEach((span) => {
        span.innerHTML = span.dataset.original;
        span.classList.remove('redacted');
      });
  }

  // TODO: function which takes the answer Id and colours the buttons
  function styleButtons(buttons) {
    Array.from(buttons)
      .forEach((button) => {
        if (parseInt(button.dataset.id, 10) === __correctId) {
          button.classList.add('button--correct');
        } else {
          button.classList.add('button--disabled');
        }
      });
  }

  // fetches and displays a question
  function init() {
    let randomArticles;
    getIds()
      .then((data) => {
        randomArticles = data;
        __correctId = chooseRandomId(data.query.random);
        return getWikiExtract(__correctId);
      })
      .then((data) => {
        const { extract, title } = data.query.pages[__correctId];
        // discard if extract is not suitable, e.g. it's a disambiguation page
        if (!extract.length || extract.includes('refer to') || extract.includes('list of')) {
          init();
        } else {
          renderText(redact(extract, shorten(title)));
          renderButtons(randomArticles);
        }
      })
      .catch(error => console.error(error));
  }

  // attach event listeners
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('next').addEventListener('click', init);
    document.getElementById('buttons').addEventListener('click', (e) => {
      if (e.target.dataset.id) {
        revealText();
        styleButtons(e.target.parentElement.children);
      }
    });
  });

  init();
}
